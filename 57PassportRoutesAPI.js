const express = require("express");

const db = require("../config/database");

const {
    authenticate
} = require("../middleware/auth");

const {
    requireRole
} = require("../middleware/roles");

const router = express.Router();

// Get all passports.
router.get(
    "/",
    authenticate,
    (req, res) => {

        const passports =
            db.prepare(`
                SELECT
                    id,
                    passport_number,
                    first_name,
                    last_name,
                    nationality,
                    date_of_birth,
                    issue_date,
                    expiration_date,
                    status
                FROM passports
                ORDER BY id DESC
            `).all();

        res.json(passports);
    }
);

// Search passports.
router.get(
    "/search",
    authenticate,
    (req, res) => {

        const search =
            `%${req.query.q || ""}%`;

        const results =
            db.prepare(`
                SELECT *
                FROM passports
                WHERE
                    passport_number LIKE ?
                    OR first_name LIKE ?
                    OR last_name LIKE ?
                    OR nationality LIKE ?
                ORDER BY last_name
            `).all(
                search,
                search,
                search,
                search
            );

        res.json(results);
    }
);

// Find expiring passports.
router.get(
    "/expiring",
    authenticate,
    (req, res) => {

        const results =
            db.prepare(`
                SELECT *
                FROM passports
                WHERE expiration_date
                    <= date('now', '+90 days')
                AND expiration_date
                    >= date('now')
                ORDER BY expiration_date
            `).all();

        res.json(results);
    }
);

// Create passport.
router.post(
    "/",
    authenticate,
    requireRole("admin", "officer"),
    (req, res) => {

        const {
            passport_number,
            first_name,
            last_name,
            nationality,
            date_of_birth,
            issue_date,
            expiration_date
        } = req.body;

        if (
            !passport_number ||
            !first_name ||
            !last_name ||
            !nationality ||
            !date_of_birth ||
            !issue_date ||
            !expiration_date
        ) {

            return res.status(400).json({
                error:
                    "Required fields are missing."
            });
        }

        try {

            const result =
                db.prepare(`
                    INSERT INTO passports (
                        passport_number,
                        first_name,
                        last_name,
                        nationality,
                        date_of_birth,
                        issue_date,
                        expiration_date
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    passport_number,
                    first_name,
                    last_name,
                    nationality,
                    date_of_birth,
                    issue_date,
                    expiration_date
                );

            res.status(201).json({
                message:
                    "Passport created.",
                id: result.lastInsertRowid
            });

        } catch (error) {

            res.status(409).json({
                error:
                    "Passport number already exists."
            });
        }
    }
);

// Delete passport.
router.delete(
    "/:id",
    authenticate,
    requireRole("admin"),
    (req, res) => {

        const result =
            db.prepare(`
                DELETE FROM passports
                WHERE id = ?
            `).run(req.params.id);

        if (result.changes === 0) {

            return res.status(404).json({
                error: "Passport not found."
            });
        }

        res.json({
            message:
                "Passport deleted."
        });
    }
);

module.exports = router;
