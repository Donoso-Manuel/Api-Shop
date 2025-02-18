const { upload, cloudinary } = require("../config/cloudinaryConfig");
const { Readable } = require("stream");

// Función para validar si la URL es válida
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Función para subir la imagen a Cloudinary usando el stream
const uploadImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);

    cloudinary.uploader.upload_stream(
      { folder: "productos" }, // Carpeta en Cloudinary
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result); // Retorna el resultado de la subida
      }
    ).end(buffer);
  });
};

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

  // Usar multer para manejar la carga de la imagen
  upload(req, res, async (err) => {
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
          // Subir la imagen a Cloudinary
          const result = await uploadImageToCloudinary(req.file.buffer);
          // Asignar la URL de la imagen subida a la respuesta
          req.body.image = result.secure_url; // Cloudinary proporciona la URL segura
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
