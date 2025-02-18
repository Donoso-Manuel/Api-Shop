const pool = require("../config/db");
require("dotenv").config();

const historyPurchDB = async (id) => {
  try {
    const query = `SELECT uc.purchase_date, uc.purchase_total, p.name, uc.price, uc.amount
                       FROM user_cart uc JOIN product p ON uc.id_product = p.id 
                       WHERE uc.id_user = $1
                        AND uc.id_purch IS NOT NULL;`;
    const values = [id];
    const purchased = await pool.query(query, values);
    if (purchased.rows.length === 0) {
      return { message: "No existe historial de compras" };
    }
    return purchased.rows;
  } catch {
    throw new Error("Error al obtener los comentarios: " + error.message);
  }
};
const confirmPurchDB = async (
  id_producto,
  amount,
  price,
  purchase_total,
  fecha,
  id_purch,
  id_cart,
  client
) => {
  try {
    const queryStock = `SELECT * FROM product WHERE id = $1;`;
    const valuesStock = [id_producto];
    const stockResult = await client.query(queryStock, valuesStock);
    const availableStock = stockResult.rows[0]?.stock;

    if (availableStock < amount) {
      throw new Error(
        `Stock insuficiente del producto ${stockResult.rows[0]?.name}. Disponible: ${availableStock} `
      );
    }

    const query = `UPDATE user_cart SET amount = $1, price = $2, purchase_total = $3, purchase_date = $4, id_purch = $5 WHERE id = $6;`;
    const values = [amount, price, purchase_total, fecha, id_purch, id_cart];
    await client.query(query, values);
    const updateQueryStock = `UPDATE product SET stock = stock - $1 WHERE id = $2;`;
    const updateValuesStock = [amount, id_producto];
    await client.query(updateQueryStock, updateValuesStock);
  } catch (error) {
    throw new Error("error al confirmar la compra: " + error.message);
  }
};
const makePurchDB = async (
  id_user,
  id_product,
  amount,
  price,
  purchase_total,
  fecha,
  id_purch,
  client
) => {
  try {
    const queryStock = `SELECT * FROM product WHERE id = $1;`;
    const valuesStock = [id_product];
    const stockResult = await client.query(queryStock, valuesStock, option);
    const availableStock = stockResult.rows[0]?.stock;

    if (availableStock < amount) {
      throw new Error(
        `Stock insuficiente del producto ${stockResult.rows[0]?.name}. Disponible: ${availableStock} `
      );
    }

    const query = `INSERT INTO user_cart VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7);`;
    const values = [
      id_user,
      id_product,
      amount,
      price,
      purchase_total,
      fecha,
      id_purch,
    ];
    await client.query(query, values);
    const updateQueryStock = `UPDATE product SET stock = stock - $1 WHERE id = $2;`;
    const updateValuesStock = [amount, id_producto];
    await client.query(updateQueryStock, updateValuesStock);
  } catch (error) {
    throw new Error("error al crear la compra: " + error.message);
  }
};

module.exports = {
  historyPurchDB,
  confirmPurchDB,
  makePurchDB,
};
