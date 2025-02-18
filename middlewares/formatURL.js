const cloudinary = require("../config/cloudinaryConfig"); 
const multer = require("multer");
const multerStorageCloudinary = require("multer-storage-cloudinary").CloudinaryStorage;

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Configuración de multer con almacenamiento Cloudinary
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: "productos", // Personaliza la carpeta en Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Formatos permitidos
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
  },
}).single("image");

const formatURL = async (req, res, next) => {
  if (req.processedImage) {
    return next();
  }

  const isProductImageRoute =
    (req.path.includes("/products") || req.path.includes("/api/products")) &&
    (req.method === "POST" || req.method === "PUT");

  if (!isProductImageRoute) {
    return next();
  }

  if (
    req.method === "PUT" &&
    req.body.currentImage &&
    isValidUrl(req.body.currentImage)
  ) {
    req.body.image = req.body.currentImage;
    return next();
  }

  upload(req, res, (err) => {
    if (err) {
      console.error("Error en multer:", err);
      if (
        req.method === "PUT" &&
        req.body.currentImage &&
        isValidUrl(req.body.currentImage)
      ) {
        req.body.image = req.body.currentImage;
        return next();
      }
      return res.status(400).json({
        message: "Error al procesar la imagen: " + err.message,
      });
    }

    const processImage = async () => {
      try {
        if (
          !req.file &&
          req.method === "PUT" &&
          req.body.currentImage &&
          isValidUrl(req.body.currentImage)
        ) {
          req.body.image = req.body.currentImage;
          return next();
        }

        if (!req.file && req.method === "POST") {
          return res.status(400).json({
            message: "No se recibió archivo de imagen",
          });
        }

        if (req.file) {
          // Asignar la URL de la imagen subida a la respuesta
          req.body.image = req.file.path; // multer-storage-cloudinary lo proporciona directamente
          req.processedImage = true;
          next();
        }
      } catch (error) {
        console.error("Error al procesar imagen:", error.message);
        res.status(500).json({
          message: "Error al procesar la imagen",
          error: error.message,
        });
      }
    };

    processImage();
  });
};

module.exports = formatURL;
