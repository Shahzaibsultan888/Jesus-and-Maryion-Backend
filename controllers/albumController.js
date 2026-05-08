const Album = require("../models/Album");
const fs = require("fs");
const path = require("path");

exports.createAlbum = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Album name is required" });
    }

    let imageFilenames = [];
    if (req.files && req.files.length > 0) {
      imageFilenames = req.files.map(file => file.filename);
    }

    const existingAlbum = await Album.findOne({ name });
    if (existingAlbum) {
      return res.status(400).json({ message: "Album name already exists" });
    }

    const newAlbum = new Album({
      name,
      images: imageFilenames
    });

    await newAlbum.save();
    res.status(201).json({ message: "Album created successfully", album: newAlbum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().sort({ createdAt: -1 });
    res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }
    res.json(album);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.filename);
      album.images = [...album.images, ...newImages];
      await album.save();
    }

    if (req.body.name) {
        album.name = req.body.name;
        await album.save();
    }

    res.json({ message: "Album updated successfully", album });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (album.images && album.images.length > 0) {
      album.images.forEach(filename => {
        const filePath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Album.findByIdAndDelete(req.params.id);
    res.json({ message: "Album deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        const { filename } = req.params;
        album.images = album.images.filter(img => img !== filename);
        await album.save();

        const filePath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: "Image deleted successfully", album });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
