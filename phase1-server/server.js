/* 
  ============================================
  File: server.js
  Project: Travel Experts – Workshop 2 
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-27
  ============================================
  Description:
    Express.js backend server for the Travel Experts web app.
    Handles API endpoints for:
      - Customer registration
      - Package retrieval
      - Agency and agent listings
      - Customer bookings
    Integrates with MySQL via a connection pool.
    Also serves static front-end files from /public.
  ============================================
*/

// --------------------- Imports ---------------------
import express from "express";          // Core web server framework
import cors from "cors";                // Enables cross-origin requests (frontend → backend)
import bodyParser from "body-parser";   // Parses incoming JSON request bodies
import pool from "./db.js";             // MySQL connection pool (from db.js)
import path from "path";                // Handles filesystem paths for serving HTML
import { fileURLToPath } from "url";    // Required to emulate __dirname in ES modules

// --------------------- Initialization ---------------------
const app = express();
const PORT = process.env.PORT || 3000;  // Uses environment port or defaults to 3000

// --------------------- Middleware ---------------------
app.use(cors());            // Allow cross-origin access from frontend
app.use(bodyParser.json()); // Parse JSON payloads automatically

// The following lines re-create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================================================
//  ROUTES SECTION – Each endpoint defines an HTTP operation
// ===============================================================

// ---------- POST /api/register ----------
// Inserts a new customer record into the database
app.post("/api/register", async (req, res) => {
  // Destructure expected input fields from request body
  const {
    CustFirstName,
    CustLastName,
    CustAddress,
    CustCity,
    CustProv,
    CustPostal,
    CustCountry,
    CustHomePhone,
    CustBusPhone,
    CustEmail
  } = req.body;

  // Quick validation check for required fields
  if (!CustFirstName || !CustLastName || !CustEmail) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  // Parameterized SQL query to safely insert a new customer
  const sql = `
    INSERT INTO customers
      (CustFirstName, CustLastName, CustAddress, CustCity, CustProv,
       CustPostal, CustCountry, CustHomePhone, CustBusPhone, CustEmail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    // Execute insert and retrieve the result
    const [result] = await pool.query(sql, [
      CustFirstName,
      CustLastName,
      CustAddress,
      CustCity,
      CustProv,
      CustPostal,
      CustCountry,
      CustHomePhone,
      CustBusPhone,
      CustEmail
    ]);

    console.log("✅ New customer added:", result.insertId);
    res.json({ ok: true, message: "Registration successful!" });
  } catch (err) {
    console.error("DB insert error:", err);
    res.status(500).json({ ok: false, message: "Database insert failed" });
  }
});

// ---------- GET /api/packages ----------
// Retrieves all available travel packages from the database
app.get("/api/packages", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM packages");
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("DB fetch error (packages):", err);
    res.status(500).json({ ok: false, message: "Database fetch failed" });
  }
});

// ---------- GET /api/agencies ----------
// Returns all agency records along with their associated agents
app.get("/api/agencies", async (req, res) => {
  try {
    // Join agencies with their agents
    const [rows] = await pool.query(`
      SELECT 
        a.AgencyId, a.AgncyAddress, a.AgncyCity, a.AgncyProv, a.AgncyPostal,
        a.AgncyCountry, a.AgncyPhone, a.AgncyFax,
        ag.AgentId, ag.AgtFirstName, ag.AgtLastName, ag.AgtBusPhone, ag.AgtEmail
      FROM agencies a
      LEFT JOIN agents ag ON a.AgencyId = ag.AgencyId
      ORDER BY a.AgencyId;
    `);

    // Group results by agency for a nested JSON structure
    const agencies = {};
    for (const row of rows) {
      if (!agencies[row.AgencyId]) {
        agencies[row.AgencyId] = {
          AgencyId: row.AgencyId,
          AgncyAddress: row.AgncyAddress,
          AgncyCity: row.AgncyCity,
          AgncyProv: row.AgncyProv,
          AgncyPostal: row.AgncyPostal,
          AgncyCountry: row.AgncyCountry,
          AgncyPhone: row.AgncyPhone,
          AgncyFax: row.AgncyFax,
          Agents: [] // Nested array for linked agents
        };
      }

      // Push each agent belonging to that agency (if present)
      if (row.AgentId) {
        agencies[row.AgencyId].Agents.push({
          AgtFirstName: row.AgtFirstName,
          AgtLastName: row.AgtLastName,
          AgtBusPhone: row.AgtBusPhone,
          AgtEmail: row.AgtEmail
        });
      }
    }

    res.json({ ok: true, data: Object.values(agencies) });
  } catch (err) {
    console.error("DB fetch error (agencies):", err);
    res.status(500).json({ ok: false, message: "Database fetch failed" });
  }
});

// ===============================================================
//  FRONTEND SERVING SECTION
// ===============================================================

// Serve all static frontend files (HTML, CSS, JS) from /public folder
app.use(express.static(path.join(__dirname, "public")));

// Default route → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===============================================================
//  POST /api/bookings – Create a new travel booking
// ===============================================================
app.post("/api/bookings", async (req, res) => {
  const { CustFirstName, CustLastName, CustEmail, PackageName, TravelerCount } = req.body;

  try {
    // 1️⃣ Lookup existing customer by name and email
    const [rows] = await pool.query(
      `SELECT CustomerId FROM customers 
       WHERE CustFirstName = ? AND CustLastName = ? AND CustEmail = ? 
       LIMIT 1`,
      [CustFirstName, CustLastName, CustEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "Customer not found. Please register first."
      });
    }

    const CustomerId = rows[0].CustomerId;

    // 2️⃣ Lookup package ID by name to link booking properly
    const [pkgRows] = await pool.query(
      "SELECT PackageId, PkgName FROM packages WHERE PkgName = ? LIMIT 1",
      [PackageName]
    );

    if (pkgRows.length === 0) {
      return res.status(404).json({ ok: false, message: "Package not found." });
    }

    const { PackageId, PkgName } = pkgRows[0];

    // 3️⃣ Create random booking number and insert record
    const BookingNo = "BK" + Math.floor(Math.random() * 1000000); // Example: BK423710
    const TripTypeId = "B"; // Default type (Business)

    const [bookResult] = await pool.query(
      `INSERT INTO bookings 
         (BookingDate, BookingNo, TravelerCount, CustomerId, TripTypeId, PackageId)
       VALUES (NOW(), ?, ?, ?, ?, ?)`,
      [BookingNo, TravelerCount, CustomerId, TripTypeId, PackageId]
    );

    // 4️⃣ Respond with success payload for frontend modal display
    res.json({
      ok: true,
      booking: {
        BookingNo,
        PkgName,
        BookingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        TravelerCount,
        CustFirstName,
        CustLastName,
        CustEmail
      }
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ ok: false, message: "Database error during booking." });
  }
});

// ===============================================================
//  SERVER STARTUP
// ===============================================================

// Begin listening for incoming requests
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
