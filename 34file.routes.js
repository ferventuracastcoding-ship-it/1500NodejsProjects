const express = require("express");
const router = express.Router();
// const router = express.Router();

const upload = require("../config/multer.config");

const fileController =
    require("../controllers/file.controller");

// Single upload
router.post(
    "/upload",
    upload.single("file"),
    fileController.uploadSingle
);

// Multiple uploads
router.post(
    "/upload-multiple",
    upload.array("files", 5),
    fileController.uploadMultiple
);

// List files
router.get(
    "/files",
    fileController.getFiles
);

// Download file
router.get(
    "/download/:filename",
    fileController.downloadFile
);

// Delete file
router.delete(
    "/delete/:filename",
    fileController.deleteFile
);

module.exports = router;
