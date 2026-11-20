CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS passports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nationality TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiration_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS passport_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    document_type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passport_id)
        REFERENCES passports(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
