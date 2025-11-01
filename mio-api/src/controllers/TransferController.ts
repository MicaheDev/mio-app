import { Request, Response, NextFunction, RequestHandler } from "express";

// 1. Definimos el tipo de archivo de Multer para usarlo internamente
type MulterFile = Express.Multer.File;

// 2. Definimos la Interfaz para los campos de texto del formulario (si es necesaria)
interface TransactionFormData {
  sender_id: string;
  declared_amount: number;
  transaction_reference: string;
  transaction_date: string;
}


export const TransferController = {
    // 3. Declaramos la función como RequestHandler para satisfacer a Express
    createTransfer: ((req: Request, res: Response, next: NextFunction) => {

        // Casteamos el cuerpo para asegurar los tipos de los campos de texto
        const formData = req.body as TransactionFormData;
        
        // **Clave de la Solución:**
        // Afirmamos que 'req.files' será un array de archivos (el resultado de upload.any()).
        // Esto evita el conflicto de tipado con la sobrecarga de Express.
        const files = req.files as MulterFile[] | undefined; 

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "Se requiere la imagen (screenshot)." });
        }
        
        const screenshotFile = files[0];

        // Lógica de Negocio
        console.log("Datos de la Transacción:", formData);
        console.log("Información del Screenshot:", screenshotFile);

        // ... Guardar archivo y registrar transacción ...

        res.status(201).json({ message: "Transacción recibida y en proceso." });

    }) as RequestHandler, // 4. El 'as RequestHandler' final asegura el cumplimiento del contrato.
};