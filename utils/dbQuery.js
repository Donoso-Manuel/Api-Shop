const pool = require("../config/db");

const dbQuery = async (query, params = []) => {
  try {
    const { rows } = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error("❌ Error en la consulta:", error);
    throw error;
  }
};

module.exports = dbQuery;
