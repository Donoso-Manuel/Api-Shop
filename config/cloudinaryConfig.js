const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "productos", 
    format: async () => "png", 
    public_id: (req, file) => file.originalname.split(".")[0], // Nombre del archivo sin extensión
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };