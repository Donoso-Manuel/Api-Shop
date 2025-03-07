const cartModel = require("../models/cartModel");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const getCart = async (req, res) => {
  try {
    const token = req.cookies.userToken;
    const secretKey = process.env.JWT_SECRET;
    const userDecode = jwt.verify(token, secretKey);
    const cart = await cartModel.getCartDB(userDecode.id);
    res.status(201).send(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener el carrito", error: error.message });
  }
};
const postCart = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { productos } = req.body;
    const token = req.cookies.userToken;
    const secretKey = process.env.JWT_SECRET;
    const userDecode = jwt.verify(token, secretKey);

    for (const producto of productos) {
      try {
        const purchase_total = producto.amount * producto.price;
        if (producto.id_cart !== null) {
          await cartModel.updateCartDB(
            producto.amount,
            producto.price,
            purchase_total,
            producto.id_cart,
            client
          );
        } else {
          await cartModel.postCartDB(
            userDecode.id,
            producto.id_product,
            producto.amount,
            producto.price,
            purchase_total,
            client
          );
        }
      } catch (error) {
        console.error("Error al procesar producto:", producto, error);
        throw error;
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Producto agregado al carrito" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      message: "Error al agregar producto al carrito",
      error: error.message,
    });
  } finally {
    client.release();
  }
};
const deleteItemCart = async (req, res) => {
  try {
    const { id } = req.body;
    await cartModel.deleteItemCartDB(id);
    res.status(200).json({ message: "Producto eliminado del carrito" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar producto del carrito",
      error: error.message,
    });
  }
};

module.exports = { getCart, postCart, deleteItemCart };
