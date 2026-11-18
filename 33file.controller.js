const fs = require("fs");
const path = require("path");

const uploadDir = path.resolve(
    process.env.UPLOAD_DIR || "src/uploads"
);

// Upload single file
exports.uploadSingle = (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Please upload a file"
        });
    }

    res.status(201).json({
        success: true,
        message: "File uploaded successfully",

        file: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        }
    });
};

// Upload multiple files
exports.uploadMultiple = (req, res) => {

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please upload files"
        });
    }

    const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
    }));

    res.status(201).json({
        success: true,
        message: "Files uploaded successfully",
        files
    });
};

// List files
exports.getFiles = (req, res) => {

    const files = fs.readdirSync(uploadDir);

    res.json({
        success: true,
        files
    });
};

// Download file
exports.downloadFile = (req, res) => {

    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    res.download(filePath);
};

// Delete file
exports.deleteFile = (req, res) => {

    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: "File not found"
        });
    }

    fs.unlinkSync(filePath);

    res.json({
        success: true,
        message: "File deleted successfully"
    });
};
