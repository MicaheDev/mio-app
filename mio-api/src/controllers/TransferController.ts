import { Request, Response, NextFunction } from "express";
import { DeclareTransferDTO } from "../model/Transfer";
import { Database } from "../config/database";
import { v4 as uuidv4 } from "uuid";
import { ApiError } from "../model/Error";
import { CashRegisterDTO } from "../model/CashBills";

const db = Database.getInstance().getDB();
const CUSTODIAN_ROLE = "custodian";
const SENDER_ROLE = "sender"; // Nueva constante para claridad
const INITIAL_STATUS = "DECLARED";
const CASH_REGISTERED_STATUS = "CASH_REGISTERED";

export const TransferController = {
  async declareTransfer(
    req: Request<{}, {}, DeclareTransferDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { declared_amount, transaction_date } = req.body;

      const user = req.user;

      if (!user || !user.id) {
        return next(
          ApiError.forbidden(
            "Acceso denegado. Se requiere el rol de remitente para declarar transferencias."
          )
        );
      }
      const sender_id = user.id;

      const existsSql = "SELECT role FROM users WHERE id = ?";

      const senderExists = db.prepare(existsSql).get(sender_id) as
        | { role: string }
        | undefined;

      if (!senderExists) {
        // Usar ApiError para errores de negocio
        return next(
          ApiError.badRequest("Error: El remitente (sender_id) no existe.")
        );
      }

      if (senderExists.role !== SENDER_ROLE)
        return next(
          ApiError.forbidden(
            "Acceso denegado. Se requiere el rol de remitente para declarar transferencias."
          )
        );

      const custodianSql = "SELECT id FROM users WHERE role = ?";

      const custodian = db.prepare(custodianSql).get(CUSTODIAN_ROLE) as
        | { id: string }
        | undefined;

      if (!custodian || !custodian.id) {
        // Usar un 500 si la estructura de la app requiere que exista un custodio.
        return next(
          new ApiError(
            412,
            `Error de configuración: No se encontró ningún custodio.`
          )
        );
      }

      const id = uuidv4();
      const custodian_id = custodian.id;

      const transferToDeclareSql = `INSERT INTO transfers (id, sender_id, custodian_id, declared_amount, transaction_date, cash_photo_url, status) 
        VALUES (?,?,?,?,?,NULL,?)`; // cash_photo_url es NULL en el inicio

      db.prepare(transferToDeclareSql).run(
        id,
        sender_id,
        custodian_id,
        declared_amount,
        transaction_date,
        INITIAL_STATUS
      );

      return res.status(201).json({
        success: true,
        message:
          "Transferencia declarada exitosamente. Pendiente de registro por el custodio.",
        transfer_id: id,
        custodian_id: custodian_id,
      });
    } catch (error) {
      next(error);
    }
  },

  async cashRegister(
    req: Request<{}, {}, CashRegisterDTO>,
    res: Response,
    next: NextFunction
  ) {
    const { transfer_id, cash_bills, cash_photo_url } = req.body;

    const user = req.user;

    let transfer:
      | { declared_amount: number; status: string; custodian_id: string }
      | undefined;

    if (!user || !user.id) {
      return next(
        ApiError.forbidden(
          "Solo el custodio asignado puede realizar el registro de esta transferencia."
        )
      );
    }

    if (!cash_bills || cash_bills.length === 0) {
      return next(ApiError.badRequest("Debe agregar al menos un billete."));
    }

    const total_amount = cash_bills.reduce(
      (acc, bill) => acc + bill.denomination,
      0
    );

    try {
      const transferSql =
        "SELECT declared_amount, status, custodian_id FROM transfers WHERE id = ?";
      transfer = db.prepare(transferSql).get(transfer_id) as typeof transfer;

      if (!transfer) {
        return next(ApiError.notFound("ID de la transferencia no encontrado."));
      }

      if (transfer.status !== "DECLARED") {
        return next(
          ApiError.conflict(
            `La transferencia ya ha sido registrada (estado actual: ${transfer.status}).`
          )
        );
      }

      if (transfer.custodian_id !== user.id) {
        return next(
          ApiError.forbidden(
            "Solo el custodio asignado puede realizar el registro de esta transferencia."
          )
        );
      }

      if (transfer.declared_amount !== total_amount) {
        return next(
          ApiError.badRequest(
            `Error de monto: La suma de los billetes (${total_amount}) debe ser igual al monto declarado (${transfer.declared_amount}).`
          )
        );
      }

      db.exec("BEGIN TRANSACTION");

      const insertBillStmt = db.prepare(
        "INSERT INTO registered_bills (id, transfer_id, denomination, serial_code) VALUES (?,?,?,?);"
      );

      const updateTransferSql =
        "UPDATE transfers SET status = ?, cash_photo_url = ? WHERE id = ?";
      const updateTransferStmt = db.prepare(updateTransferSql);

      for (const { denomination, serial_code } of cash_bills) {
        const id = uuidv4();

        // Ejecutamos el statement. Si falla, el catch se encarga del ROLLBACK.
        insertBillStmt.run(id, transfer_id, denomination, serial_code);
      }

      updateTransferStmt.run(
        CASH_REGISTERED_STATUS,
        cash_photo_url,
        transfer_id
      );

      db.exec("COMMIT");

      return res.status(200).json({
        success: true,
        message:
          "Billetes registrados exitosamente. Pendiente de verificación final por el remitente.",
        transfer_id: transfer_id,
        registered_count: cash_bills.length,
      });
    } catch (error) {
      try {
        db.exec("ROLLBACK"); // Asegura que la transacción se revierta
      } catch (rollbackError) {
        console.error("Error al intentar ROLLBACK:", rollbackError);
      }

      console.error("Error durante el registro de billetes:", error);

      // Identificar si el error es por violación de unicidad (serial_code duplicado)
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return next(
          ApiError.conflict(
            "Error de base de datos: Al menos un número de serie de billete ya está registrado. Por favor, verifique los seriales."
          )
        );
      }

      // Si no es un error de BD específico, o un ApiError ya lanzado, se pasa al manejador global 500
      next(error);
    }
  },

  validateTransfer(req: Request, res: Response, next: NextFunction){
    
  }
};
