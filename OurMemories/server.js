const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos allowed'));
        }
    },
    limits: { fileSize: 100 * 1024 * 1024 }
});

// Schema
const Memory = mongoose.model("Memory", {
    title: String,
    description: String,
    year: Number,
    filePath: String,
    fileType: String
});

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// Routes
app.post("/add-memory", upload.single("file"), async (req, res) => {
    try {
        const memory = new Memory({
            title: req.body.title,
            description: req.body.description || "",
            year: parseInt(req.body.year),
            filePath: `/uploads/${req.file.filename}`,
            fileType: req.file.mimetype
        });
        await memory.save();
        res.json({ success: true, message: "Saved!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get("/memories", async (req, res) => {
    const data = await Memory.find();
    res.json(data);
});

// Home route - explicitly send index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
mongoose.connect("mongodb+srv://kuacarlmoko_db_user:Carl12345@floresdbs.suab6mz.mongodb.net/memoryDB")
    .then(() => {
        console.log("✅ MongoDB Connected");
        app.listen(3000, () => {
            console.log("🚀 Server running → http://localhost:3000");
        });
    })
    .catch(err => console.error("MongoDB Error:", err));