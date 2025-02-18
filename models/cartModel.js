const pool = require("../config/db");
require("dotenv").config();

const getCartDB = async (id) => {
  try {
    const query = `SELECT uc.*, p.name, p.description, p.image FROM user_cart uc JOIN product p ON uc.id_product = p.id
                      WHERE uc.id_user = $1 AND uc.id_purch IS NULL; `;
    const values = [id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error(
        "No se encontraron productos en el carrito para este usuario."
      );
    }
    return result.rows;
  } catch (error) {
    throw new Error("Error al obtener el Carrito: " + error.message);
  }
};
const deleteItemCartDB = async (id) => {
  try {

    const query = "DELETE FROM user_cart WHERE id = $1";
    const values = [id];

    const result = await pool.query(query, values);


    return result;
  } catch (error) {
    console.error("Error en deleteItemCartDB:", error);
    throw error;
  }
};
const updateCartDB = async (amount, price, purchase_total, id_cart, client) => {
  try {
    const query =
      "UPDATE user_cart SET amount = $1, price = $2, purchase_total = $3 WHERE id = $4;";
    const values = [amount, price, purchase_total, id_cart];
    await client.query(query, values);
    return { success: true, message: "Producto actualizado en el carrito" };
  } catch (error) {
    throw new Error(
      "No se pudo actualizar el producto en el carrito: " + error.message
    );
  }
};
const postCartDB = async (
  id_user,
  id_product,
  amount,
  price,
  purchase_total,
  client
) => {
  try {
    const query = `INSERT INTO user_cart (id, id_user, id_product, amount, price, purchase_total) VALUES (DEFAULT, $1, $2, $3, $4, $5);`;
    const values = [id_user, id_product, amount, price, purchase_total];
    await client.query(query, values);
    return { success: true, message: "Producto guardado en carrito" };
  } catch (error) {
    throw new Error(
      "No se pudo guardar el producto en el carrito: " + error.message
    );
  }
};

module.exports = { getCartDB, deleteItemCartDB, updateCartDB, postCartDB };
