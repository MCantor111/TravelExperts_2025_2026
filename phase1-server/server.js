/*
  ============================================
  File: server.js
  Project: Travel Experts – Workshop 2 
  Author: Cantor Zapalski
  Partners: Metacoda (ChatGPT)
  Date: 2025-10-22
  ============================================
*/

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- API: Register new customer ----------
app.post("/api/register", async (req, res) => {
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

  if (!CustFirstName || !CustLastName || !CustEmail) {
    return res.status(400).json({ ok: false, message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO customers
      (CustFirstName, CustLastName, CustAddress, CustCity, CustProv,
       CustPostal, CustCountry, CustHomePhone, CustBusPhone, CustEmail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
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

// ---------- API: Get all travel packages ----------
app.get("/api/packages", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM packages");
    res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("DB fetch error (packages):", err);
    res.status(500).json({ ok: false, message: "Database fetch failed" });
  }
});

// ---------- API: Get all agencies with their agents ----------
app.get("/api/agencies", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.AgencyId, a.AgncyAddress, a.AgncyCity, a.AgncyProv, a.AgncyPostal,
        a.AgncyCountry, a.AgncyPhone, a.AgncyFax,
        ag.AgentId, ag.AgtFirstName, ag.AgtLastName, ag.AgtBusPhone, ag.AgtEmail
      FROM agencies a
      LEFT JOIN agents ag ON a.AgencyId = ag.AgencyId
      ORDER BY a.AgencyId;
    `);

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
          Agents: []
        };
      }

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

// ---------- Serve static front-end *after* API routes ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Default Route ----------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- API: Create a booking ----------
app.post("/api/bookings", async (req, res) => {
  const { CustFirstName, CustLastName, CustEmail, PackageName, TravelerCount } = req.body;

  try {
    // 1️⃣ Find the customer
    const [rows] = await pool.query(
      `SELECT CustomerId FROM customers 
       WHERE CustFirstName = ? AND CustLastName = ? AND CustEmail = ? 
       LIMIT 1`,
      [CustFirstName, CustLastName, CustEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Customer not found. Please register first." });
    }

    const CustomerId = rows[0].CustomerId;

    // 2️⃣ Look up the package ID by name
    const [pkgRows] = await pool.query(
      "SELECT PackageId, PkgName FROM packages WHERE PkgName = ? LIMIT 1",
      [PackageName]
    );

    if (pkgRows.length === 0) {
      return res.status(404).json({ ok: false, message: "Package not found." });
    }

    const { PackageId, PkgName } = pkgRows[0];

    // 3️⃣ Generate booking number and insert
    const BookingNo = "BK" + Math.floor(Math.random() * 1000000);
    const TripTypeId = "B"; // default

    const [bookResult] = await pool.query(
      `INSERT INTO bookings 
         (BookingDate, BookingNo, TravelerCount, CustomerId, TripTypeId, PackageId)
       VALUES (NOW(), ?, ?, ?, ?, ?)`,
      [BookingNo, TravelerCount, CustomerId, TripTypeId, PackageId]
    );

    // 4️⃣ Respond with confirmation data
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

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
