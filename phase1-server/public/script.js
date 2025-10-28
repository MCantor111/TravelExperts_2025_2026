/* 
  ============================================
  File: script.js
  Project: Travel Experts – Workshop 2 Refined
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-27
  ============================================
  Description:
    Unified client logic for smooth UX and API integration:
    - Smooth scrolling + hero slideshow
    - Inline validation & auto-format for phone/postal
    - Registration flow with small persistent popup
    - Dynamic package & agency loaders
    - Order form booking flow with modal + toasts
  ============================================
*/

/* =========================
   GLOBAL INITIALIZATION
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 TravelExperts Refined JS initialized");

  setupSmoothScroll();      // anchor links scroll nicely
  setupHeroSlideshow();     // rotating hero image (if present)
  setupHoverDebug();        // console hover breadcrumbs for cards
  setupAutoFormatting();    // phone/postal auto-formatters
  setupRegistrationForm();  // register -> POST /api/register + popup
  loadPackages();           // GET /api/packages -> render cards
  loadAgencies();           // GET /api/agencies  -> render agencies/agents
  setupOrderForm();         // order.html integration (if present)
});

/* =========================
   SMOOTH SCROLLING
   ========================= */
function setupSmoothScroll() {
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* =========================
   HERO IMAGE SLIDESHOW
   ========================= */
function setupHeroSlideshow() {
  const heroImg = document.querySelector("#hero img");
  if (!heroImg) return; // some pages have no hero <img>

  const heroImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Bali
    "https://images.unsplash.com/photo-1549693578-d683be217e58",   // Tokyo
    "https://images.unsplash.com/photo-1541338906008-f2d4ad1b2231" // Paris
  ];

  let i = 0;
  setInterval(() => {
    i = (i + 1) % heroImages.length;
    heroImg.src = heroImages[i];
  }, 5000);
}

/* =========================
   HOVER DEBUG LOGGING
   ========================= */
function setupHoverDebug() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () => {
      // Optional data-place attribute on cards shows up here if present
      console.log(`🪶 Hovered: ${card.dataset.place || "(no data-place)"}`);
    });
  });
}

/* =========================
   AUTO-FORMATTING
   ========================= */
function setupAutoFormatting() {
  // Phone auto-format: 403-555-8192
  const phoneInputs = [
    document.getElementById("custHomePhone"),
    document.getElementById("custBusPhone")
  ];

  phoneInputs.forEach(input => {
    if (!input) return;
    input.addEventListener("input", () => {
      let digits = input.value.replace(/\D/g, "").slice(0, 10);
      if (digits.length > 6) {
        input.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        input.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        input.value = digits;
      }
    });
  });

  // Postal auto-format: T2N 1N4
  const postalInput = document.getElementById("custPostal");
  if (postalInput) {
    postalInput.addEventListener("input", () => {
      let val = postalInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      postalInput.value = val.length > 3 ? `${val.slice(0, 3)} ${val.slice(3)}` : val;
    });
  }
}

/* =========================
   REGISTRATION FORM
   ========================= */
function setupRegistrationForm() {
  const form = document.getElementById("registrationForm");
  if (!form) return; // not on this page

  // Close button handler for the small persistent popup
  const popup = document.getElementById("registerPopup");
  const closeBtn = document.getElementById("closePopupBtn");
  if (popup && closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.remove("visible");
      popup.classList.add("hidden");
    }, { once: false });
    // click outside the inner content closes too
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.classList.add("hidden");
        popup.classList.remove("visible");
      }
    });
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validateRegistration()) return;

    // Gather payload in the exact keys the API expects
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      // Parse JSON safely
      const result = await res.json().catch(() => ({}));

      if (res.ok && result.ok) {
        // Persist fields (teacher wants fields to remain visible)
        const name = data.CustFirstName || "Traveler";
        showRegisterPopup(name);
      } else {
        showPopup(`⚠️ ${result.message || `Registration failed (HTTP ${res.status})`}`, false);
      }
    } catch (err) {
      showPopup(`❌ Server error: ${err.message}`, false);
    }
  });
}

/* =========================
   INLINE-ERROR VALIDATION
   ========================= */
function validateRegistration() {
  const required = [
    "custFirstName","custLastName","custAddress","custCity",
    "custProv","custPostal","custCountry","custHomePhone","custEmail"
  ];

  // Clear prior errors
  document.querySelectorAll(".error-message").forEach(e => e.remove());
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));

  let valid = true;

  const showError = (id, msg) => {
    const f = document.getElementById(id);
    if (!f) return;
    f.classList.add("invalid");
    const err = document.createElement("span");
    err.className = "error-message";
    err.textContent = msg;
    f.insertAdjacentElement("afterend", err);
    valid = false;
  };

  // Required checks
  for (const id of required) {
    const f = document.getElementById(id);
    if (f && !f.value.trim()) showError(id, "This field is required.");
  }

  // Pattern checks
  const email = document.getElementById("custEmail")?.value.trim();
  const phone = document.getElementById("custHomePhone")?.value.trim();
  const busPhone = document.getElementById("custBusPhone")?.value.trim();
  const postal = document.getElementById("custPostal")?.value.trim();
  const prov = document.getElementById("custProv")?.value.trim();

  const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRe  = /^\d{3}-\d{3}-\d{4}$/;
  const postalRe = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  const provRe   = /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/;

  if (email && !emailRe.test(email)) showError("custEmail", "Enter a valid email address.");
  if (phone && !phoneRe.test(phone)) showError("custHomePhone", "Use format: 403-555-8192");
  if (busPhone && !busPhone.match(/^$|^\d{3}-\d{3}-\d{4}$/)) showError("custBusPhone", "Use format: 403-555-8192");
  if (postal && !postalRe.test(postal)) showError("custPostal", "Use format: T2N 1N4");
  if (prov && !provRe.test(prov)) showError("custProv", "Use valid 2-letter code (e.g. AB, ON)");

  return valid;
}

/* =========================
   REGISTRATION POPUP (SMALL, PERSISTENT)
   ========================= */
function showRegisterPopup(firstName) {
  const popup = document.getElementById("registerPopup");
  const nameSpan = document.getElementById("popupName");
  if (!popup || !nameSpan) {
    console.warn("Popup elements missing in DOM");
    return;
  }

  // Add a leading space so it reads “… aboard, Matthew.”
  nameSpan.textContent = ` ${firstName}!`;

  popup.classList.remove("hidden");
  popup.classList.add("visible");
}

/* =========================
   DYNAMIC PACKAGE LOADER
   ========================= */
async function loadPackages() {
  const container = document.querySelector("#packages-container");
  if (!container) return; // not on packages page

  // Map package names to hero images (best-effort)
  const imgMap = {
    "European Vacation":   "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "Polynesian Paradise": "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
    "Caribbean New Year":  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "Asian Expedition":    "https://images.unsplash.com/photo-1549693578-d683be217e58",
    "Arctic Aurora Quest": "https://images.unsplash.com/photo-1519681393784-d120267933ba"
  };

  try {
    const res = await fetch("http://localhost:3000/api/packages");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API response");

    container.innerHTML = "";
    const now = new Date();

    data.forEach(pkg => {
      const startDate = new Date(pkg.PkgStartDate);
      const started = startDate <= now; // “STARTED” if package start date is in the past

      const imgSrc = imgMap[pkg.PkgName] || "";
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" alt="${pkg.PkgName}">` : ""}
        <h3>${pkg.PkgName}</h3>
        <p>${pkg.PkgDesc || "Explore this exclusive travel experience."}</p>
        ${started ? `<p class="started">STARTED</p>` : ""}
        <p><strong>Start:</strong> ${String(pkg.PkgStartDate).slice(0, 10)}</p>
        <p><strong>End:</strong> ${String(pkg.PkgEndDate).slice(0, 10)}</p>
        <p><strong>Price:</strong> $${Number(pkg.PkgBasePrice).toFixed(2)}</p>
        <button class="order-btn" onclick="window.location.href='order.html?package=${encodeURIComponent(pkg.PkgName)}'">
          Order Now
        </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Package load error:", err);
    container.innerHTML = "<p class='error'>Failed to load packages.</p>";
  }
}

/* =========================
   DYNAMIC AGENCY LOADER
   ========================= */
async function loadAgencies() {
  const container = document.querySelector("#agencies-container");
  if (!container) return; // not on contact page

  try {
    const res = await fetch("http://localhost:3000/api/agencies");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API data");

    container.innerHTML = "";
    data.forEach(a => {
      const agents = (a.Agents || [])
        .map(x => `
          <div class="agent-card">
            <p><strong>${x.AgtFirstName} ${x.AgtLastName}</strong></p>
            <p>📞 ${x.AgtBusPhone}</p>
            <p>✉️ <a href="mailto:${x.AgtEmail}">${x.AgtEmail}</a></p>
          </div>
        `)
        .join("");

      const agency = document.createElement("div");
      agency.className = "agency-card";
      agency.innerHTML = `
        <h3>${a.AgncyCity} Office</h3>
        <p class="agency-address">${a.AgncyAddress}, ${a.AgncyCity}, ${a.AgncyProv}</p>
        <p class="agency-phone">📞 ${a.AgncyPhone}</p>
        <p class="agency-fax">📠 ${a.AgncyFax}</p>
        <div class="agent-list">${agents}</div>
      `;
      container.appendChild(agency);
    });
  } catch (err) {
    console.error("❌ Agency load error:", err);
    container.innerHTML = `<p style="color:#ff8080;">❌ Could not load agencies.</p>`;
  }
}

/* =========================
   ORDER FORM LOGIC
   ========================= */
function setupOrderForm() {
  const orderForm = document.getElementById("orderForm");
  if (!orderForm) return; // not on order.html

  const pkgField = document.getElementById("package");
  const pkgIdField = document.getElementById("packageId");

  // Pre-fill package name from query string
  const params = new URLSearchParams(window.location.search);
  const selectedPackage = params.get("package");
  if (pkgField && selectedPackage) pkgField.value = decodeURIComponent(selectedPackage || "");

  // Resolve PackageId to ensure server always gets a valid FK
  (async function resolvePackageId() {
    try {
      const r = await fetch("http://localhost:3000/api/packages");
      const { ok, data } = await r.json();
      if (!ok) throw new Error("API not-ok");
      const match = data.find(p => p.PkgName === (pkgField?.value || ""));
      if (pkgIdField) {
        if (match) {
          pkgIdField.value = String(match.PackageId);
        } else {
          pkgIdField.value = "";
          showPopup("Package not found; cannot book.", false);
          orderForm.querySelector("button[type='submit']").disabled = true;
        }
      }
    } catch (_) {
      showPopup("Could not load packages to resolve ID.", false);
    }
  })();

  // Submit booking
  orderForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(orderForm).entries());

    // Lightweight client validation
    const emailOK = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.CustEmail || "");
    if (!emailOK) { showPopup("Invalid email address.", false); return; }
    if (!formData.PackageId) { showPopup("Missing package id.", false); return; }

    // Normalize TravelerCount
    formData.TravelerCount = Number(formData.TravelerCount || 1);

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        showPopup(data.message || `Server error (HTTP ${res.status})`, false);
        return;
      }

      // Prefer server payload; fall back to client snapshot
      const b = data.booking || {
        BookingNo: "—",
        PkgName: pkgField?.value || "—",
        BookingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        TravelerCount: formData.TravelerCount,
        CustFirstName: formData.CustFirstName,
        CustLastName: formData.CustLastName,
        CustEmail: formData.CustEmail
      };

      // Inline modal confirmation
      const html = `
        <h2 style="margin-top:0;">✅ Booking Confirmed!</h2>
        <p><strong>Booking #:</strong> ${b.BookingNo}</p>
        <p><strong>Package:</strong> ${b.PkgName}</p>
        <p><strong>Name:</strong> ${b.CustFirstName} ${b.CustLastName}</p>
        <p><strong>Email:</strong> ${b.CustEmail}</p>
        <p><strong>Traveler Count:</strong> ${b.TravelerCount}</p>
        <p><strong>Date:</strong> ${b.BookingDate}</p>
      `;
      showModal(html);

      // Reset only the order form (registration form remains persistent by design)
      orderForm.reset();
    } catch (err) {
      console.error(err);
      showPopup("❌ Could not complete booking.", false);
    }
  });
}

/* =========================
   MODAL POPUP (Generic)
   ========================= */
function showModal(innerHTML) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    background: "#0b0c10",
    color: "#C5C6C7",
    border: "1px solid rgba(102,252,241,0.3)",
    borderRadius: "10px",
    padding: "2rem",
    boxShadow: "0 0 20px rgba(102,252,241,0.25)",
    textAlign: "left",
    maxWidth: "420px",
    width: "calc(100% - 2rem)",
    animation: "fadeInUp 0.25s ease-out"
  });

  modal.innerHTML = `
    ${innerHTML}
    <div style="text-align:center;margin-top:1rem;">
      <button id="closeModalBtn"
        style="background:linear-gradient(90deg,#45a29e,#66fcf1);
               color:#0b0c10;font-weight:bold;
               padding:0.6rem 1.2rem;border:none;
               border-radius:6px;cursor:pointer;">
        Close
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const closeBtn = document.getElementById("closeModalBtn");
  closeBtn?.addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

/* =========================
   TOAST POPUP (Generic)
   ========================= */
function showPopup(message, success = true) {
  const popup = document.createElement("div");
  popup.textContent = message;
  Object.assign(popup.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: success ? "rgba(50,205,50,0.15)" : "rgba(255,99,71,0.15)",
    color: success ? "#16d47b" : "#ff6b6b",
    border: `1px solid ${success ? "#16d47b" : "#ff6b6b"}`,
    padding: "1rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 0 12px rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
    transition: "opacity 0.5s ease"
  });
  document.body.appendChild(popup);

  // Auto-fade (errors stick around a tad longer via the CSS transition)
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}
