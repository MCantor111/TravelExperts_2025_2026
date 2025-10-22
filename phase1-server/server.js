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

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve all HTML/CSS/JS from the public directory
app.use(express.static(path.join(__dirname, "public")));

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

// ---------- Start Server ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
