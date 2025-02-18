const pool = require("../config/db");

const createProductDB = async (
  name,
  description,
  price,
  stock,
  image,
  category
) => {
  try {

    const query = `INSERT INTO product (id, name, description, price, stock, image, likes, category) 
                   VALUES (DEFAULT, $1, $2, $3, $4, $5, 0, $6);`;
    const values = [name, description, price, stock, image, category || ""];

    await pool.query(query, values);
    return true;
  } catch (error) {
    console.error("Error en createProductDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al crear el producto: " + error.message);
  }
};

const getProductIdDB = async (id) => {
  try {
    const query = `SELECT * FROM product WHERE id = $1;`;
    const values = [id];

    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    console.error("Error en getProductIdDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al buscar el producto: " + error.message);
  }
};

const getProductsDB = async () => {
  try {
    const query = `SELECT * FROM product;`;

    const result = await pool.query(query);

    return result.rows;
  } catch (error) {
    console.error("Error en getProductsDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al buscar los productos: " + error.message);
  }
};
const updateProductIDDB = async (
  id,
  name,
  description,
  price,
  stock,
  image,
  category
) => {
  try {
    const query = `UPDATE product 
                   SET name = $1, description = $2, price = $3, stock = $4, image = $5, category = $6 
                   WHERE id = $7 
                   RETURNING *;`;
    const values = [name, description, price, stock, image, category, id];

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error en updateProductIDDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al actualizar el producto: " + error.message);
  }
};

const updateStockDB = async (id, stock) => {
  try {
    const query = `UPDATE product SET stock = $1 WHERE id = $2;`;
    const values = [stock, id];

    await pool.query(query, values);

    return { success: true, message: "Stock Actualizado" };
  } catch (error) {
    console.error("Error en updateStockDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("no se pudo actualizar stock: " + error.message);
  }
};

const deleteProductDB = async (id) => {
  try {
    const query = "DELETE FROM product WHERE id = $1";
    await pool.query(query, [id]);
    return true;
  } catch (error) {
    console.error("Error en deleteProductDB:", error);
    throw new Error("Error al eliminar el producto de la base de datos");
  }
};

const alterCategoryColumn = async () => {
  try {
    const query = `ALTER TABLE product ALTER COLUMN category TYPE VARCHAR(50);`;
    await pool.query(query);
    console.log("Columna category modificada exitosamente");
  } catch (error) {
    console.error("Error al modificar la columna:", error);
  }
};
const recommendedProductsDB = async()=>{
  try{
    const query = "SELECT * FROM product ORDER BY likes DESC LIMIT 10;"
    const products =  await pool.query(query)
    return(products.rows)
  }catch(error){
    throw new Error("Error al obtener los productos");
  }
}

alterCategoryColumn();

module.exports = {
  createProductDB,
  getProductIdDB,
  getProductsDB,
  updateProductIDDB,
  updateStockDB,
  deleteProductDB,
  recommendedProductsDB,
};
