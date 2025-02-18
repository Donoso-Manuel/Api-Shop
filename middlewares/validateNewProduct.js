const validateProduct = (req, res, next) => {
  const { name, description, price, stock, image, currentImage } = req.body;

  if (!name || !description || !price || !stock) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  if (isNaN(price) || isNaN(stock)) {
    return res
      .status(400)
      .json({ message: "El precio y stock deben ser números." });
  }

  if (req.method === "PUT" && currentImage) {
    return next();
  }

  if (!image) {
    return res.status(400).json({ message: "Debe proporcionar una imagen." });
  }

  next();
};

module.exports = { validateProduct };
