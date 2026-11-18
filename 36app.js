// Error in being unhealthy
const express = require("express");
const helmet = require("helmet");

const fileRoutes = require("./routes/file.routes");
const errorMiddleware =
    require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to File Upload API"
    });
});

app.use("/api", fileRoutes);

app.use(errorMiddleware);

module.exports = app;
