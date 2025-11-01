CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'sender', 'validator')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    declared_amount REAL NOT NULL,
    transaction_reference TEXT UNIQUE NOT NULL,
    screenshot_url TEXT,
    transaction_date DATETIME NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'VALIDATED', 'CANCELED')) DEFAULT "PENDING",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cash_bills (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    validator_id TEXT NOT NULL,
    denomination REAL NOT NULL,
    serial_code TEXT UNIQUE NOT NULL,
    bill_photo_url TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    FOREIGN KEY (validator_id) REFERENCES users(id)
);

