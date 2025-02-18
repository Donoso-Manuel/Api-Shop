const purchModel = require("../models/purchModel");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const confirmPurch = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { fecha, productos, total } = req.body;
    const id_purch = Date.now();
    const token = req.cookies.userToken;
    const secretKey = process.env.JWT_SECRET;
    const userDecode = jwt.verify(token, secretKey);
    for (const producto of productos) {
      try {
        const purchase_total = producto.amount * producto.price;
        if (producto.id_cart !== null) {
          await purchModel.confirmPurchDB(
            producto.product_id,
            producto.amount,
            producto.price,
            purchase_total,
            fecha,
            id_purch,
            producto.id_cart,
            client
          );
        } else {
          await purchModel.makePurchDB(
            userDecode.id,
            producto.product_id,
            producto.amount,
            producto.price,
            purchase_total,
            fecha,
            id_purch,
            client
          );
        }
      } catch (error) {
        console.error("Error al procesar producto:", producto, error);
        throw error;
      }
    }
    await client.query("COMMIT");
    res.status(200).json({
      success: true,
      message: "Compra realizada con éxito",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      success: false,
      message: "Error al confirmar la compra",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
const historyPurch = async (req, res) => {
  try {
    const token = req.cookies.userToken;
    const secretKey = process.env.JWT_SECRET;
    const userDecode = jwt.verify(token, secretKey);
    const history = await purchModel.historyPurchDB(userDecode.id);
    res.status(200).send(history);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el historial de compras",
      error: error.message,
    });
  }
};


module.exports = { confirmPurch, historyPurch};
