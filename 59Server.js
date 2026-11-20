require("dotenv").config();

const express = require("express");

const passportRoutes =
    require("./routes/passportRoutes");

const analyticsRoutes =
    require("./routes/analyticsRoutes");

const app = express();

const PORT =
    process.env.PORT || 3000;

// Parse JSON.
app.use(express.json());

// Serve frontend.
app.use(
    express.static("public")
);

// API routes.
app.use(
    "/api/passports",
    passportRoutes
);

app.use(
    "/api/analytics",
    analyticsRoutes
);

// Health check.
app.get(
    "/api/health",
    (req, res) => {

        res.json({
            status: "online",
            service:
                "Passport Management API",
            timestamp:
                new Date().toISOString()
        });
    }
);

// Handle unknown API routes.
app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            error: "API route not found."
        });
    }
);

// Start server.
app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "================================"
        );

        console.log(
            " PASSPORT MANAGEMENT PLATFORM"
        );

        console.log(
            "================================"
        );

        console.log(
            `http://localhost:${PORT}`
        );
    }
);
