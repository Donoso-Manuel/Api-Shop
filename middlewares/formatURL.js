const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");

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

  upload(req, res, async (err) => {
    if (err) {
      console.error("Error en multer:", err);
      return res.status(400).json({
        message: "Error al procesar la imagen: " + err.message,
      });
    }

    try {
      if (!req.file && req.method === "POST") {
        return res.status(400).json({
          message: "No se recibió archivo de imagen",
        });
      }

      if (req.file) {
        const formData = new FormData();
        
        const imageBase64 = req.file.buffer.toString("base64");

        formData.append("image", imageBase64);
        formData.append("key", process.env.IMGBB_API_KEY); 

        const imgbbResponse = await axios.post(
          "https://api.imgbb.com/1/upload", 
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );

        req.processedImage = true;
        req.body.image = imgbbResponse.data.data.display_url;
      }

      next();
    } catch (error) {
      console.error("Error al procesar imagen:", error);
      res.status(500).json({
        message: "Error al procesar la imagen",
        error: error.message,
      });
    }
  });
};

module.exports = formatURL;