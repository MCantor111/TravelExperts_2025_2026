/* =========================================================
   server.js — Express API for Travel Experts (Workshop 2)
   Author: Cantor (Matte Black ᗰტ) + VER1FEX
   NOTE: Keeps Workshop 1 static files intact in /public.
   ========================================================= */
require('dotenv').config();
const express = require('express');
const pool = require('./db');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- Static site (Workshop 1 preserved) ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- Utilities ---------- */
const pick = (obj, keys) => Object.fromEntries(keys.map(k => [k, obj[k]]));

/* ---------- GET /api/packages ---------- */
/* Lists valid packages; flags ones already started (bold/red date on FE). */
app.get('/api/packages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT PackageId, PkgName, PkgStartDate, PkgEndDate, PkgDesc, 
              PkgBasePrice, PkgAgencyCommission
         FROM packages
        WHERE PkgEndDate >= CURDATE()
        ORDER BY PkgStartDate`
    );
    const today = new Date();
    const data = rows.map(r => ({
      ...r,
      Started: new Date(r.PkgStartDate) < today
    }));
    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB_ERROR_PACKAGES' });
  }
});

/* ---------- GET /api/agencies ---------- */
/* Agencies with nested agents (for Contact page). */
app.get('/api/agencies', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.AgencyId, a.AgncyAddress, a.AgncyCity, a.AgncyProv, a.AgncyPostal, 
              a.AgncyCountry, a.AgncyPhone, a.AgncyFax,
              g.AgentId, g.AgtFirstName, g.AgtLastName, g.AgtBusPhone, g.AgtEmail
         FROM agencies a 
         JOIN agents g ON a.AgencyId = g.AgencyId
        ORDER BY a.AgencyId, g.AgtLastName`
    );

    const byAgency = new Map();
    for (const r of rows) {
      const key = r.AgencyId;
      if (!byAgency.has(key)) {
        byAgency.set(key, {
          AgencyId: r.AgencyId,
          AgncyAddress: r.AgncyAddress,
          AgncyCity: r.AgncyCity,
          AgncyProv: r.AgncyProv,
          AgncyPostal: r.AgncyPostal,
          AgncyCountry: r.AgncyCountry,
          AgncyPhone: r.AgncyPhone,
          AgncyFax: r.AgncyFax,
          Agents: []
        });
      }
      byAgency.get(key).Agents.push({
        AgentId: r.AgentId,
        AgtFirstName: r.AgtFirstName,
        AgtLastName:  r.AgtLastName,
        AgtBusPhone:  r.AgtBusPhone,
        AgtEmail:     r.AgtEmail
      });
    }

    res.json({ ok: true, data: Array.from(byAgency.values()) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB_ERROR_AGENCIES' });
  }
});

/* ---------- POST /api/orders ---------- */
/* Creates Customer + Booking. 
   Notes:
   - bookings.BookingNo (varchar) required: generate short code.
   - bookings.TripTypeId (varchar) may be required; we’ll use any existing ID 
     from triptypes table, else fallback to 'L' and insert if missing.
*/
app.post('/api/orders', async (req, res) => {
  const client = await pool.getConnection();
  try {
    const payload = pick(req.body, [
      'CustFirstName','CustLastName','CustEmail','CustHomePhone',
      'CustAddress','CustCity','CustProv','CustPostal','CustCountry',
      'TravelerCount','PackageId'
    ]);

    // Very basic validation
    if (!payload.CustFirstName || !payload.CustLastName || !payload.CustEmail || !payload.PackageId) {
      return res.status(400).json({ ok: false, error: 'BAD_REQUEST' });
    }

    await client.beginTransaction();

    // 1) Create Customer (minimal fields)
    const [custRes] = await client.query(
      `INSERT INTO customers 
       (CustFirstName, CustLastName, CustEmail, CustHomePhone, CustAddress,
        CustCity, CustProv, CustPostal, CustCountry)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.CustFirstName, payload.CustLastName, payload.CustEmail, payload.CustHomePhone || null,
        payload.CustAddress || null, payload.CustCity || null, payload.CustProv || null,
        payload.CustPostal || null, payload.CustCountry || null
      ]
    );
    const customerId = custRes.insertId;

    // 2) Ensure TripTypeId
    let tripTypeId = null;
    const [tt] = await client.query(`SELECT TripTypeId FROM triptypes LIMIT 1`);
    if (tt.length) {
      tripTypeId = tt[0].TripTypeId;
    } else {
      // create a default leisure type 'L' if table is empty
      await client.query(`INSERT INTO triptypes (TripTypeId, TTName) VALUES ('L','Leisure')`);
      tripTypeId = 'L';
    }

    // 3) BookingNo: short random code
    const bookingNo = Math.random().toString(36).slice(2, 8).toUpperCase();

    // 4) Create Booking
    const travelerCount = Number(payload.TravelerCount || 1);
    await client.query(
      `INSERT INTO bookings
       (BookingDate, BookingNo, TravelerCount, CustomerId, PackageId, TripTypeId)
       VALUES (NOW(), ?, ?, ?, ?, ?)`,
      [bookingNo, travelerCount, customerId, payload.PackageId, tripTypeId]
    );

    await client.commit();
    res.json({ ok: true, customerId, bookingNo });
  } catch (err) {
    await client.rollback();
    console.error(err);
    res.status(500).json({ ok: false, error: 'DB_ERROR_ORDER' });
  } finally {
    client.release();
  }
});

const port = parseInt(process.env.PORT || '3000', 10);
app.listen(port, () => console.log(`Travel Experts API running on http://localhost:${port}`));
