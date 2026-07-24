const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,

  ssl: process.env.DB_SSL === "true"
    ? {
        rejectUnauthorized: true,
      }
    : undefined,
});

const db = pool.promise();

db.getConnection()
  .then(() => console.log("MySQL connecté avec succès"))
  .catch((err) => console.error("Erreur MySQL :", err.message));

module.exports = db;