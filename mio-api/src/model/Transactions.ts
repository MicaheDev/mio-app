export interface Transaction {
  id: string; // TEXT PRIMARY KEY
  sender_id: string; // TEXT NOT NULL (FOREIGN KEY)
  declared_amount: number; // REAL NOT NULL
  transaction_reference: string; // TEXT UNIQUE NOT NULL
  screenshot_url?: string; // TEXT (Opcional, ya que lo guardarás después de subirlo)
  transaction_date: string; // DATETIME NOT NULL (Podrías usar 'string' para la fecha ISO o 'Date')
  status: 'PENDING' | 'VALIDATED' | 'CANCELED'; // TEXT NOT NULL CHECK
  created_at?: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
}

// Interfaz para los datos que se esperan del cuerpo de la solicitud POST (req.body)
// Nota: 'screenshot_url' no se incluye porque se genera al subir el archivo.
export interface TransactionFormData {
  sender_id: string;
  declared_amount: number;
  transaction_reference: string;
  transaction_date: string;
}