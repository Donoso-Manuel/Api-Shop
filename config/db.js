const { Pool } = require("pg");
require("dotenv").config();

let poolConfig;

if (process.env.NODE_ENV === "test") {
  // Entorno de pruebas
  poolConfig = {
    user: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    host: process.env.PGHOST_TEST,
    database: process.env.PGDATABASE_TEST,
    port: process.env.PGPORT_TEST || 5432,
    ssl: process.env.PGSSL_TEST === "true",
  };
} else {
  // Entorno de desarrollo (o producción)
  poolConfig = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: process.env.PGPORT || 5432,
    ssl: process.env.PGSSL === "true",
  };
}

let pool;

try {
  pool = new Pool(poolConfig);
  console.log("Configuración de pool creada exitosamente");

  // Verificar la conexión inmediatamente
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Error al verificar la conexión:", err);
    } else {
      console.log("Conexión a la base de datos verificada:", res.rows[0]);
    }
  });
} catch (error) {
  console.error("Error al crear el pool de conexiones:", error);
  process.exit(1);
}

// Agregar listener para errores de conexión
pool.on("error", (err) => {
  console.error("Error inesperado en el pool de conexiones:", err);
});

module.exports = pool;
