require("dotenv").config();
const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: process.env.DB_PORT || process.env.MYSQLPORT,
  user: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const requiredConfig = {
  DB_HOST: dbConfig.host,
  DB_PORT: dbConfig.port,
  DB_USER: dbConfig.user,
  DB_PASSWORD: dbConfig.password,
  DB_NAME: dbConfig.database,
  JWT_SECRET: process.env.JWT_SECRET,
};

const missingEnvVars = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno requeridas: ${missingEnvVars.join(", ")}`,
  );
}

const db = mysql.createPool(dbConfig);

db.getConnection((error, connection) => {
  if (error) {
    console.error("Error de conexión a MySQL:", error);
    return;
  }

  console.log("Conexión exitosa a MySQL");
  connection.release();
});

module.exports = db;
