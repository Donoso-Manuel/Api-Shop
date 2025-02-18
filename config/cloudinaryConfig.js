const cloudinary = require("cloudinary").v2;
const multer = require("multer");
require("dotenv").config();

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuración de Multer para almacenar imágenes en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de tamaño de archivo 5MB
  },
}).single("image");

module.exports = { upload, cloudinary };
