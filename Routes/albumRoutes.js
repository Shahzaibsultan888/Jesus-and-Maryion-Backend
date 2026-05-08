const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const albumController = require("../controllers/albumController");
const auth = require("../middleware/authMiddleware");

// POST: Create a new album with images
router.post("/", upload.array("images", 150), albumController.createAlbum);

// GET: List all albums
router.get("/", albumController.getAllAlbums);

// GET: Single album by ID
router.get("/:id", albumController.getAlbumById);

// PUT: Add images to an existing album
router.put("/:id", upload.array("images", 150), albumController.updateAlbum);

// DELETE: Delete an album and its images
router.delete("/:id", albumController.deleteAlbum);

// DELETE: Delete a specific image from an album
router.delete("/:id/images/:filename", albumController.deleteImage);

module.exports = router;
