const express = require("express");

const db = require("../config/database");

const {
    authenticate
} = require("../middleware/auth");

const router = express.Router();

// Dashboard statistics.
router.get(
    "/dashboard",
    authenticate,
    (req, res) => {

        const total =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM passports
            `).get();

        const active =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM passports
                WHERE status = 'active'
            `).get();

        const expired =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM passports
                WHERE expiration_date < date('now')
            `).get();

        const expiring =
            db.prepare(`
                SELECT COUNT(*) AS count
                FROM passports
                WHERE expiration_date
                    BETWEEN date('now')
                    AND date('now', '+90 days')
            `).get();

        const nationalities =
            db.prepare(`
                SELECT
                    nationality,
                    COUNT(*) AS count
                FROM passports
                GROUP BY nationality
                ORDER BY count DESC
            `).all();

        res.json({
            totalPassports:
                total.count,

            activePassports:
                active.count,

            expiredPassports:
                expired.count,

            expiringWithin90Days:
                expiring.count,

            nationalities
        });
    }
);

module.exports = router;
