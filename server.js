const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const router = require("./routes/router");
const formatURLMiddleware = require("./middlewares/formatURL");
const errorHandlerMiddleware = require("./middlewares/errorHandlerMiddleware");
const authMiddleware = require("./middlewares/authMiddleware");
const pool = require("./config/db");
require("dotenv").config();

const testDBSetup = async (pool) => {
  try {
    await pool.query(`
            DROP TABLE IF EXISTS user_likes CASCADE;
            DROP TABLE IF EXISTS reset_token_password CASCADE;
            DROP TABLE IF EXISTS carts CASCADE;
            DROP TABLE IF EXISTS lista_deseos CASCADE;
            DROP TABLE IF EXISTS product CASCADE;
            DROP TABLE IF EXISTS users CASCADE;

            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                status BOOLEAN,
                rol VARCHAR,
                direction VARCHAR,
                city VARCHAR,
                phone VARCHAR,
                name VARCHAR
            );

            CREATE TABLE product (
                id SERIAL PRIMARY KEY,
                name VARCHAR,
                description VARCHAR,
                price INT,
                stock INT,
                image VARCHAR,
                likes INT,
                category INT
            );

            CREATE TABLE reset_token_password (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE user_likes (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES product(id) ON DELETE CASCADE,
                liked_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, product_id)
            );

            CREATE TABLE carts (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES product(id) ON DELETE CASCADE,
                cantidad INT DEFAULT 1
            );

            CREATE TABLE lista_deseos (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES product(id) ON DELETE CASCADE,
                UNIQUE (user_id, product_id)
            );

        `);

    console.log("Base de datos de pruebas configurada correctamente");
  } catch (error) {
    console.error(
      "Error en la configuración de la base de datos de pruebas",
      error
    );
    throw error;
  }
};

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(formatURLMiddleware);

app.use("/api", router);

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Iniciado en puerto ${PORT}`);
});

module.exports = { app, pool, testDBSetup };
