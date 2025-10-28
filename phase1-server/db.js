/*
  ============================================
  File: db.js
  Project: Travel Experts – Workshop 2
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-27
  ============================================
  Description:
    Establishes a connection pool to the MySQL database
    using the mysql2 library (Promise-based API).
    This pool is shared across the backend (server.js)
    to handle multiple concurrent database requests efficiently.
  ============================================
*/

// ---------------------- Imports ----------------------
import dotenv from "dotenv";              // Loads environment variables from .env file
import mysql from "mysql2/promise";       // MySQL client with async/await support

// Load the environment configuration (host, user, etc.)
dotenv.config();

// ---------------------- Connection Pool ----------------------
// A connection pool maintains several reusable connections to the database,
// preventing overhead from reconnecting on each query.
const pool = mysql.createPool({
  host: process.env.DB_HOST,                 // Hostname of MySQL server
  user: process.env.DB_USER,                 // Username
  password: process.env.DB_PASSWORD,         // Password
  database: process.env.DB_DATABASE,         // Database name
  port: process.env.DB_PORT || 3306,         // Default port for MySQL
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10 // Max simultaneous connections
});

// ---------------------- Connection Test ----------------------
// Immediately test the connection once the server starts.
// This ensures early detection of configuration or network issues.
try {
  const conn = await pool.getConnection();  // Get a connection from the pool
  console.log(`✅ Connected to MySQL (port ${process.env.DB_PORT || 3306})`);
  conn.release();                           // Return connection back to pool
} catch (err) {
  console.error("❌ Database connection failed:", err.message);
}

// Export the connection pool for use throughout the app
export default pool;
