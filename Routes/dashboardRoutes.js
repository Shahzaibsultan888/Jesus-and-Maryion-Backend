const express = require("express");
const router = express.Router();
const Album = require("../models/Album");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");
const fs = require("fs");
const path = require("path");

// 🔹 BULK UPLOAD (Drag & Drop)
router.post(
  "/upload",
  auth,
  upload.array("images", 1000),
  async (req, res) => {
    try {
      const albumName = req.body.album || "Default Album"; // NEW
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const imageFilenames = req.files.map(file => file.filename);

      let existingAlbum = await Album.findOne({ name: albumName });
      if (existingAlbum) {
          existingAlbum.images = [...existingAlbum.images, ...imageFilenames];
          await existingAlbum.save();
      } else {
          existingAlbum = new Album({
              name: albumName,
              images: imageFilenames
          });
          await existingAlbum.save();
      }

      res.json({
        message: `${req.files.length} images uploaded successfully to album '${albumName}'`
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 🔥 DELETE ALL IMAGES (ENTIRE FOLDER)
router.delete("/delete-all", auth, async (req, res) => {
  try {
    const albums = await Album.find();

    albums.forEach(album => {
      if (album.images && album.images.length > 0) {
          album.images.forEach(filename => {
            const filePath = path.join(__dirname, "..", "uploads", filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          });
      }
    });

    await Album.deleteMany();

    res.json({ message: "All images and albums deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
