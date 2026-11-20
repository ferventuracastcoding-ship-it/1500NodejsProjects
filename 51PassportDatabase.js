const Database = require("better-sqlite3");

const db = new Database("passport.db");

// Create the passport table.
db.prepare(`
    CREATE TABLE IF NOT EXISTS passports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        passport_number TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        nationality TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        expiration_date TEXT NOT NULL,
        status TEXT DEFAULT 'Active'
    )
`).run();

// Add a passport.
function createPassport(passport) {
    const statement = db.prepare(`
        INSERT INTO passports (
            passport_number,
            first_name,
            last_name,
            date_of_birth,
            nationality,
            issue_date,
            expiration_date,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return statement.run(
        passport.passport_number,
        passport.first_name,
        passport.last_name,
        passport.date_of_birth,
        passport.nationality,
        passport.issue_date,
        passport.expiration_date,
        passport.status || "Active"
    );
}

// Get all passports.
function getPassports() {
    return db.prepare(`
        SELECT * FROM passports
        ORDER BY id DESC
    `).all();
}

// Find passport by number.
function findPassport(number) {
    return db.prepare(`
        SELECT * FROM passports
        WHERE passport_number = ?
    `).get(number);
}

// Delete passport.
function deletePassport(id) {
    return db.prepare(`
        DELETE FROM passports
        WHERE id = ?
    `).run(id);
}

module.exports = {
    createPassport,
    getPassports,
    findPassport,
    deletePassport
};
