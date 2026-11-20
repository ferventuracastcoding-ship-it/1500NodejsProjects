const express = require("express");

const database = require("./database");

const app = express();

const PORT = 3000;

// Parse JSON requests.
app.use(express.json());

// Serve the frontend.
app.use(express.static("public"));

// Get all passport records.
app.get("/api/passports", (req, res) => {

    const passports = database.getPassports();

    res.json(passports);
});

// Search for a passport.
app.get("/api/passports/:number", (req, res) => {

    const passport =
        database.findPassport(req.params.number);

    if (!passport) {
        return res.status(404).json({
            error: "Passport not found"
        });
    }

    res.json(passport);
});

// Create a passport record.
app.post("/api/passports", (req, res) => {

    const {
        passport_number,
        first_name,
        last_name,
        date_of_birth,
        nationality,
        issue_date,
        expiration_date,
        status
    } = req.body;

    // Validate required fields.
    if (
        !passport_number ||
        !first_name ||
        !last_name ||
        !date_of_birth ||
        !nationality ||
        !issue_date ||
        !expiration_date
    ) {
        return res.status(400).json({
            error: "Required passport information is missing."
        });
    }

    try {

        database.createPassport({
            passport_number,
            first_name,
            last_name,
            date_of_birth,
            nationality,
            issue_date,
            expiration_date,
            status
        });

        res.status(201).json({
            message: "Passport record created successfully."
        });

    } catch (error) {

        res.status(409).json({
            error: "Passport number already exists."
        });
    }
});

// Delete a passport record.
app.delete("/api/passports/:id", (req, res) => {

    const result =
        database.deletePassport(req.params.id);

    if (result.changes === 0) {

        return res.status(404).json({
            error: "Passport not found."
        });
    }

    res.json({
        message: "Passport deleted successfully."
    });
});

// Start the server.
app.listen(PORT, () => {

    console.log("--------------------------------");
    console.log("PASSPORT DATABASE SYSTEM");
    console.log("--------------------------------");

    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
