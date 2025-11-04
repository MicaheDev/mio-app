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

export const TransferController = {
  async declareTransfer(
    req: Request<{}, {}, DeclareTransferDTO>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sender_id, declared_amount, transaction_date } = req.body;

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
  
  async cashRegister(req: Request<{},{},CashRegisterDTO>, res: Response, next: NextFunction){
    const {transfer_id, cash_bills, cash_photo_url} = req.body

    db.exec("BEGIN TRANSACTION")

    try{
      const bills = db.prepare("INSERT INTO registered_bills (id, transfer_id, denomination, serial_code) VALUES (?,?,?,?);")
      if(cash_bills.length <= 0){
        return next(ApiError.badRequest("There's no bills added"))
      }

      cash_bills.forEach(({denomination,serial_code}) => {
        const id = uuidv4()

        bills.run(id,transfer_id,denomination,serial_code)
      })

      db.exec("COMMIT")

      
       res.json({"result": cash_bills})
    }catch{
      db.exec("ROLLBACK")
    }
  }
};
