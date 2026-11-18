// ERROR in being unhealthy
const multer = require("multer");

function errorMiddleware(err, req, res, next) {

    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    res.status(400).json({
        success: false,
        message: err.message || "Something went wrong"
    });
}

module.exports = errorMiddleware;
