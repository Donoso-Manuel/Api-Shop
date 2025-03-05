const pool = require("../config/db");
const bcrypt = require("bcrypt");
require("dotenv").config();

//Buscar usuario por email
const findByEmailDB = async (email) => {
  try {
    const query =
      "SELECT id, email, password, rol, status, name FROM users WHERE email = $1;";
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    // logging del error
    console.error("Error en findByEmailDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al buscar usuario por email: " + error.message);
  }
};

//Buscar usuario por ID
const findByIdDB = async (id) => {
  try {
    const query = "SELECT id, name, email, direction, city, phone, rol FROM users WHERE id = $1;";
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    //logging del error
    console.error("Error en findByIdDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al buscar usuario por ID: " + error.message);
  }
};

//Crear usuario (Cliente o Admin)
const createUserDB = async (userData) => {
  try {
    const { nombre, correo, password, direccion, ciudad, telefono } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Si la contraseña coincide con la clave secreta del .env, el usuario será admin
    const finalRol =
      password === process.env.ADMIN_SECRET_PASSWORD ? "admin" : "cliente";

    const query = `
            INSERT INTO users (name, email, password, direction, city, phone, rol, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            RETURNING id, name, email, rol;
        `;
    const values = [
      nombre,
      correo,
      hashedPassword,
      direccion,
      ciudad,
      telefono,
      finalRol,
    ];
    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    //logging del error
    console.error("Error en createUserDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al crear usuario: " + error.message);
  }
};

//Validar contraseña
const validatePasswordDB = async (plainPassword, hashedPassword) => {
  console.log("🔍 Contraseña ingresada:", plainPassword);
  console.log("🔍 Contraseña en BD:", hashedPassword);

  try {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    console.log("✅ Coincidencia de contraseña:", match);
    return match;
  } catch (error) {
    //logging del error para bcrypt.compare
    console.error("Error en validatePasswordDB (bcrypt.compare):", error);
    console.error("Mensaje de Error:", error.message);
    return false; // En caso de no coincidir retornamos false
  }
};

//Actualizar contraseña de admin
const createAdminPasswordDB = async (userId, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
            UPDATE users
            SET password = $1
            WHERE id = $2 AND rol = 'admin'
            RETURNING id, email, rol, name;
        `;
    const values = [hashedPassword, userId];
    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    //logging del error
    console.error("Error en createAdminPasswordDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al actualizar password de admin: " + error.message);
  }
};

//Actualizar contraseña de cualquier usuario
const updatePasswordDB = async (userId, newPassword) => {
  try {
    const query = `
            UPDATE users
            SET password = $1
            WHERE id = $2
            RETURNING id, email, password;
        `;
    const values = [newPassword, userId];

    const result = await pool.query(query, values);

    return result.rows[0];
  } catch (error) {
    //logging del error
    console.error("Error en updatePasswordDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al actualizar contraseña: " + error.message);
  }
};

//Obtener todos los usuarios
const getUsersDB = async () => {
  try {
    const query = "SELECT id, name, email, rol, status FROM users;";
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    //logging del error
    console.error("Error en getUsersDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al obtener usuarios: " + error.message);
  }
};

//Actualizar estado de usuario (activo/inactivo)
const updateStatusDB = async (id, status) => {
  try {
    const query = `UPDATE users SET status = $1 WHERE id = $2;`;
    const values = [status, id];
    await pool.query(query, values);
    return { success: true, message: "Estado actualizado correctamente" };
  } catch (error) {
    //logging del error
    console.error("Error en updateStatusDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al actualizar estado del usuario: " + error.message);
  }
};


//Obtener productos favoritos de un usuario
const getLikeProductsDB = async (userId) => {
  try {
    const query = `
            SELECT p.id, p.name, p.description, p.price, p.image
            FROM product p
            JOIN user_likes ul ON p.id = ul.product_id
            WHERE ul.user_id = $1;
        `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    //logging del error
    console.error("Error en getLikeProductsDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al obtener productos favoritos: " + error.message);
  }
};

//Generar token de recuperación de contraseña (¿Esto debería estar en tokenModel?)
const createResetTokenDB = async (userId, token) => {
  try {
    const query = `INSERT INTO reset_token_password (user_id, token) VALUES ($1, $2) RETURNING id;`;
    const values = [userId, token];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    //logging del error
    console.error("Error en createResetTokenDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error("Error al generar token de recuperación: " + error.message);
  }
};

//Verificar token de recuperación de contraseña (¿Esto debería estar en tokenModel?)
const verifyResetTokenDB = async (token) => {
  try {
    const query = `SELECT user_id FROM reset_token_password WHERE token = $1;`;
    const values = [token];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    // logging detallado del error
    console.error("Error en verifyResetTokenDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error(
      "Error al verificar token de recuperación: " + error.message
    );
  }
};

//Eliminar token de recuperación después de su uso (¿Esto debería estar en tokenModel?)
const deleteResetTokenDB = async (token) => {
  try {
    const query = `DELETE FROM reset_token_password WHERE token = $1;`;
    const values = [token];
    await pool.query(query, values);
    return { success: true, message: "Token eliminado correctamente" };
  } catch (error) {
    //logging del error
    console.error("Error en deleteResetTokenDB:", error);
    console.error("Mensaje de Error:", error.message);
    throw new Error(
      "Error al eliminar token de recuperación: " + error.message
    );
  }
};
const updateMyUserDB = async(id, name, email, direction, city, phone)=>{
  try{
    const query = `UPDATE users SET name = $1, email = $2, direction = $3, city = $4, phone = $5 WHERE id = $6;`
    const values = [name, email, direction, city, phone, id]
    await pool.query(query, values)
    
    return {success: true}
  }catch(error){
    throw new Error("Error al actualizar el usuario" + error.message)
  }
}
const userLikeDB = async(user_id, product_id)=>{
  try{
    const query = `INSERT INTO user_likes VALUES (DEFAULT, $1, $2, DEFAULT);`
    const values = [user_id, product_id]
    const query2 = `UPDATE product SET likes = likes + 1 WHERE id = $1;`
    const values2 = [product_id]
    await pool.query(query, values);
    await pool.query(query2, values2);
    return {success: true}
  }catch(error){
    throw new Error("Error al dar Like" + error.message)
  }
}
const userDisLikeDB = async(user_id, product_id)=>{
  try{
    const query = `DELETE from user_likes WHERE user_id = $1 AND product_id = $2`
    const values = [user_id, product_id]
    const query2 = `UPDATE product SET likes = GREATEST(likes - 1, 0) WHERE id = $1;`
    const values2 = [product_id]

    await pool.query(query, values)
    await pool.query(query2, values2)
    return {success: true}

  }catch(error){
    throw new Error("Error al eliminar el Like" + error.message)
  }
}
const getLikeProductsFrontDB = async(user_id)=>{
  try{
    const query = `SELECT * FROM user_likes WHERE user_id = $1;`
    const values = [user_id]

    const products = await pool.query(query, values)
    return products.rows
  }catch(error){
    throw new Error("Error al obtener los Like" + error.message)
  }
}

module.exports = {
  findByEmailDB,
  findByIdDB,
  createUserDB,
  validatePasswordDB,
  createAdminPasswordDB,
  updatePasswordDB,
  getUsersDB,
  updateStatusDB,
  getLikeProductsDB,
  createResetTokenDB,
  verifyResetTokenDB,
  deleteResetTokenDB,
  updateMyUserDB,
  userDisLikeDB,
  userLikeDB,
  getLikeProductsFrontDB
};
