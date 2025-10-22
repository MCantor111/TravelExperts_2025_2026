/* =========================================================
   db.js — MySQL Connection Pool for Travel Experts (Workshop 2)
   Author: Cantor (Matte Black ᗰტ) + VER1FEX
   ========================================================= */
require('dotenv').config();
const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  port: process.env.DB_PORT || 3306
});

// Convert callback-based pool → Promise-based
const promisePool = pool.promise();

// Test connection immediately when module loads
promisePool.getConnection()
  .then(conn => {
    console.log('✅ Connected to MySQL database!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

// Export the promise pool (so server.js can use .query)
module.exports = promisePool;
