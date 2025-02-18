const pool = require("../config/db");

const resetToken = async (userId, token) => {
  try {
    await pool.query(
      "INSERT INTO reset_token_password (user_id, token) VALUES ($1, $2)",
      [userId, token]
    );
  } catch (error) {
    // logging del error
    console.error("Error en resetToken:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al insertar token de reseteo: " + error.message);
  }
};
const findTokenReset = async (token) => {
  try {
    const result = await pool.query(
      "SELECT user_id FROM reset_token_password WHERE token = $1",
      [token]
    );
    return result.rows[0];
  } catch (error) {
    // logging del error
    console.error("Error en findTokenReset:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al buscar token de reseteo: " + error.message);
  }
};
const deleteToken = async (token) => {
  try {
    await pool.query("DELETE FROM reset_token_password WHERE token = $1", [
      token,
    ]);
  } catch (error) {
    // logging del error
    console.error("Error en deleteToken:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al eliminar token de reseteo: " + error.message);
  }
};
module.exports = { resetToken, findTokenReset, deleteToken };
