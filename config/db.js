const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const ssl =
  process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(path.join(__dirname, "../certs/ca.pem")),
      }
    : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl,
});

const db = pool.promise();

db.getConnection()
  .then(() => console.log("MySQL connecte avec succes"))
  .catch((err) => console.error("Erreur MySQL :", err.message));

module.exports = db;