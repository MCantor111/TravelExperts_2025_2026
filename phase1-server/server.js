/*
  ============================================
  File: server.js
  Project: Travel Experts – Workshop 2
  Author: Cantor (Matte Black ᗰტ)
  Partners: ☣️ケイオバリア☣️, VΞR1FΞX
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

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
