-- 1. USERS: Tabla para gestionar a la Tía (Remitente/Validador) y la Hermana (Custodio/Registrador).

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    -- Roles clave: 'sender' (Tía - Remitente/Validador), 'custodian' (Hermana - Custodio/Registrador)
    role TEXT NOT NULL CHECK (role IN ('admin', 'sender', 'custodian')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRANSFERS: Tabla que rastrea cada transferencia de dinero declarada y su proceso de verificación (3 fases).

CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,           -- ID de la Tía que declara el monto
    custodian_id TEXT NOT NULL,         -- ID de la Hermana que recibe y registra
    declared_amount REAL NOT NULL,      -- Monto en efectivo declarado
    cash_photo_url TEXT,                -- URL de la foto del LOTE de billetes enviada por la Hermana (Fase 2)
    transaction_date DATETIME NOT NULL,
    
    -- Status de la transacción, reflejando el flujo de 3 pasos:
    -- DECLARED: Creada por Tía, esperando registro de Hermana.
    -- CASH_REGISTERED: Billetes registrados por Hermana, esperando validación de Tía.
    -- COMPLETED: Tía verificó y finalizó.
    -- CANCELED: Cancelada.
    status TEXT NOT NULL CHECK (status IN ('DECLARED', 'CASH_REGISTERED', 'COMPLETED', 'CANCELED')) DEFAULT 'DECLARED',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (custodian_id) REFERENCES users(id)
);

-- 3. REGISTERED_BILLS: El registro definitivo del ahorro. Cada fila es un billete físico.

CREATE TABLE IF NOT EXISTS registered_bills (
    id TEXT PRIMARY KEY,
    -- Vincula el billete a la transferencia que lo originó
    transfer_id TEXT NOT NULL,
    denomination REAL NOT NULL,
    serial_code TEXT UNIQUE NOT NULL, -- IMPRESCINDIBLE: Asegura que cada billete es único.
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (transfer_id) REFERENCES transfers(id)
);

-- 4. AUDIT_LOG: Tabla para manejar las solicitudes de Verificación Global (Auditoría del Ahorro Total).

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL,         -- ID de la Tía que solicita la auditoría
    custodian_id TEXT NOT NULL,          -- ID de la Hermana que debe responder con la foto
    total_system_amount REAL NOT NULL,   -- Monto total ahorrado al momento de la auditoría (calculado del sistema)
    audit_photo_url TEXT,               -- URL de la foto del TOTAL ACUMULADO de billetes.
    audit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Status del proceso de auditoría:
    -- REQUESTED: Solicitada por Tía.
    -- PHOTO_SENT: Foto del total enviada por Hermana.
    -- VERIFIED: Tía confirmó el balance y la foto.
    status TEXT NOT NULL CHECK (status IN ('REQUESTED', 'EVIDENCE_PROVIDED', 'VERIFIED', 'CANCELED')) DEFAULT 'REQUESTED',
    
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (custodian_id) REFERENCES users(id)
);