const multer = require("multer");
const cloudinary = require("../config/cloudinaryConfig"); // Importa la configuración de Cloudinary
const { Readable } = require("stream");

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
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
          // Convertir el buffer de la imagen a un stream
          const bufferStream = new Readable();
          bufferStream.push(req.file.buffer);
          bufferStream.push(null);

          // Subir la imagen a Cloudinary
          cloudinary.uploader.upload_stream(
            { folder: "productos" }, // Puedes personalizar la carpeta en Cloudinary
            (error, result) => {
              if (error) {
                console.error("Error al subir imagen a Cloudinary:", error);
                return res.status(500).json({
                  message: "Error al subir la imagen",
                  error: error.message,
                });
              }

              // Asignar la URL de la imagen subida a la respuesta
              req.body.image = result.secure_url;
              req.processedImage = true;
              next();
            }
          ).end(req.file.buffer); // Usar el buffer de la imagen
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
