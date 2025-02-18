const errorHandlerMiddleware = (err, req, res, next) => {
  console.error("ERROR HANDLER:", err); // Log del error para depuración

  // Envia una respuesta de error genérica al cliente
  res.status(500).json({
    message:
      "Ocurrió un error en el servidor. Por favor, inténtalo de nuevo más tarde.",
    error: err.message,
  });
};

module.exports = errorHandlerMiddleware;
