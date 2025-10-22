/*
  ============================================
  File: db.js
  Project: Travel Experts – Workshop 2
  Author: Cantor (Matte Black ᗰტ)
  Partner: VΞR1FΞX
  Date: 2025-10-22
  Description:
    MySQL connection pool (ES Module version)
  ============================================
*/

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10
});

try {
  const conn = await pool.getConnection();
  console.log(`✅ Connected to MySQL (port ${process.env.DB_PORT || 3306})`);
  conn.release();
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
}

export default pool;
