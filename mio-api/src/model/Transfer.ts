import { z } from "zod";

export interface Transfer {
  id: string; // TEXT PRIMARY KEY
  sender_id: string; // TEXT NOT NULL (FOREIGN KEY)
  custodian_id: string
  declared_amount: number; // REAL NOT NULL
  transaction_date: string; // DATETIME NOT NULL (Podrías usar 'string' para la fecha ISO o 'Date')
  cash_photo_url: string
  status: 'DECLARED' | 'CASH_REGISTERED' | 'COMPLETED' | 'CANCELED'; // TEXT NOT NULL CHECK
  created_at?: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// Interfaz para los datos que se esperan del cuerpo de la solicitud POST (req.body)
// Nota: 'screenshot_url' no se incluye porque se genera al subir el archivo.
export interface TransferDTO {
  declared_amount: number;
  transaction_date: string;
}


// Define el esquema para los datos requeridos al declarar una transferencia
export const DeclareTransferSchema = z.object({

  declared_amount: z
    .number({
      error: "El monto declarado es requerido.",
    })
    .positive("El monto declarado debe ser un valor positivo."),

  // Asumiendo que el frontend enviará la fecha como un string ISO 8601
  transaction_date: z
    .string({
      error: "La fecha de la transacción es requerida.",
    })
    .datetime("La fecha de la transacción debe ser una cadena de fecha ISO 8601 válida."),
});

// Tipado del DTO basado en el esquema de Zod
export type DeclareTransferDTO = z.infer<typeof DeclareTransferSchema>;
