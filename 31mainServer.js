const express = require("express");

const app = express();

app.use(express.json());

// Import calculator routes
const calculatorRoutes =
    require("./routes/calculator");

// Register routes
app.use("/api/calculator", calculatorRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Simple Calculator API"
    });
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
