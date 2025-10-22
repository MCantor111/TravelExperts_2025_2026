/* 
  ============================================
  File: script.js
  Project: Travel Experts – Workshop 2
  Author: Cantor (Matte Black ᗰტ)
  Partner: VΞR1FΞX (Metacoda)
  Date: 2025-10-22
  ============================================
  Description:
    Unified front-end logic for the Travel Experts app.
    - Smooth scrolling & active nav highlights
    - Image slideshow
    - Form auto-formatting & validation
    - Dynamic content loading (packages, agencies)
    - Node.js API integration for registration
  ============================================
*/

// =========================
// GLOBAL INITIALIZATION
// =========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 TravelExperts JS initialized");

  setupSmoothScroll();
  setupHeroSlideshow();
  setupHoverDebug();
  setupAutoFormatting();
  setupRegistrationForm();
  loadPackages();
  loadAgencies();
});

// =========================
// SMOOTH SCROLLING
// =========================
function setupSmoothScroll() {
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// =========================
// HERO IMAGE SLIDESHOW
// =========================
function setupHeroSlideshow() {
  const heroImg = document.querySelector("#hero img");
  if (!heroImg) return;

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

// =========================
// HOVER DEBUG LOGGING
// =========================
function setupHoverDebug() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`🪶 Hovered: ${card.dataset.place}`)
    );
  });
}

// =========================
// AUTO-FORMATTING
// =========================
function setupAutoFormatting() {
  const phoneInputs = [
    document.getElementById("custHomePhone"),
    document.getElementById("custBusPhone")
  ];

  phoneInputs.forEach(input => {
    if (!input) return;
    input.addEventListener("input", () => {
      let digits = input.value.replace(/\D/g, "").slice(0, 10);
      if (digits.length > 6)
        input.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      else if (digits.length > 3)
        input.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      else input.value = digits;
    });
  });

  const postalInput = document.getElementById("custPostal");
  if (postalInput) {
    postalInput.addEventListener("input", () => {
      let val = postalInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      if (val.length > 3) postalInput.value = `${val.slice(0, 3)} ${val.slice(3)}`;
      else postalInput.value = val;
    });
  }

  // Province field auto-format (letters only, 2 chars, uppercase)
  const provInput = document.getElementById("custProv");
  if (provInput) {
    provInput.addEventListener("input", () => {
      // Remove non-letters and force uppercase
      let val = provInput.value.toUpperCase().replace(/[^A-Z]/g, "");
      // Limit to 2 letters
      if (val.length > 2) val = val.slice(0, 2);
      provInput.value = val;
    });
  }

}

// =========================
// REGISTRATION FORM
// =========================
function setupRegistrationForm() {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!validateRegistration()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      displayRegistrationResult(result, form);
    } catch (err) {
      alert("❌ Server error: " + err.message);
    }
  });
}

function displayRegistrationResult(result, form) {
  document.getElementById("register-feedback")?.remove();
  const div = document.createElement("div");
  div.id = "register-feedback";
  div.style.marginTop = "2rem";
  div.style.padding = "1rem";
  div.style.borderRadius = "8px";
  div.style.textAlign = "center";
  div.style.fontWeight = "bold";

  if (result.ok) {
    div.textContent = "✅ Registration successful!";
    div.style.background = "rgba(69,162,158,0.2)";
    form.reset();
  } else {
    div.textContent = "⚠️ " + (result.message || "Registration failed.");
    div.style.background = "rgba(255,99,71,0.15)";
  }

  form.parentNode.appendChild(div);
}

// =========================
// SUCCESS POPUP FEEDBACK
// =========================
function showPopup(message, success = true) {
  // Remove any existing popup
  document.querySelector(".popup-msg")?.remove();

  const popup = document.createElement("div");
  popup.className = "popup-msg";
  popup.textContent = message;
  popup.style.position = "fixed";
  popup.style.top = "20px";
  popup.style.right = "20px";
  popup.style.padding = "1rem 1.5rem";
  popup.style.borderRadius = "8px";
  popup.style.zIndex = "9999";
  popup.style.fontWeight = "bold";
  popup.style.boxShadow = "0 0 12px rgba(0,0,0,0.25)";
  popup.style.color = success ? "#0f0" : "#f55";
  popup.style.background = success
    ? "rgba(50,205,50,0.15)"
    : "rgba(255,99,71,0.15)";
  popup.style.border = `1px solid ${success ? "#32CD32" : "#f55"}`;
  popup.style.backdropFilter = "blur(6px)";
  popup.style.transition = "opacity 0.5s ease";
  popup.style.opacity = "1";

  document.body.appendChild(popup);

  // Fade out after 3 seconds
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}


// =========================
// REGISTRATION VALIDATION
// =========================
function validateRegistration() {
  const get = id => document.getElementById(id)?.value.trim();
  const required = [
    "custFirstName", "custLastName", "custAddress", "custCity",
    "custProv", "custPostal", "custCountry", "custHomePhone", "custEmail"
  ];

  for (const id of required) {
    if (!get(id)) {
      alert(`Please fill out the ${id.replace("cust", "").replace(/([A-Z])/g, " $1")} field.`);
      document.getElementById(id).focus();
      return false;
    }
  }

  const provincePattern = /^(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)$/;
  if (!provincePattern.test(get("custProv").toUpperCase())) {
    alert("Invalid province. Use a valid 2-letter code (e.g. AB, ON).");
    return false;
  }

  const postalPattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  if (!postalPattern.test(get("custPostal").toUpperCase())) {
    alert("Invalid postal code (e.g. T2N 1N4).");
    return false;
  }

  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailPattern.test(get("custEmail"))) {
    alert("Invalid email format (e.g. user@example.com).");
    return false;
  }

  const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
  if (!phonePattern.test(get("custHomePhone"))) {
    alert("Home phone must be in the format 403-555-8192.");
    return false;
  }

  const busPhone = get("custBusPhone");
  if (busPhone && !phonePattern.test(busPhone)) {
    alert("Business phone must be in the format 403-555-8192 (or leave blank).");
    return false;
  }

  return true;
}

// =========================
// DYNAMIC PACKAGE LOADER
// =========================
async function loadPackages() {
  const container = document.querySelector("#packages-container");
  if (!container) return;

  const imgMap = {
    "European Vacation": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    "Polynesian Paradise": "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
    "Caribbean New Year": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "Asian Expedition": "https://images.unsplash.com/photo-1549693578-d683be217e58",
    "Arctic Aurora Quest": "https://images.unsplash.com/photo-1519681393784-d120267933ba"
  };

  try {
    // use absolute URL to ensure it always hits the Node API
    const res = await fetch("http://localhost:3000/api/packages");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API response");

    container.innerHTML = "";
    const now = new Date();

    data.forEach(pkg => {
      const started = new Date(pkg.PkgStartDate) < now;
      const imgSrc = imgMap[pkg.PkgName] || "";
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" alt="${pkg.PkgName}">` : ""}
        <h3>${pkg.PkgName}</h3>
        <p>${pkg.PkgDesc || "Explore this exclusive travel experience."}</p>
        ${started ? `<p class="started">STARTED</p>` : ""}
        <p><strong>Start:</strong> ${pkg.PkgStartDate.slice(0,10)}</p>
        <p><strong>End:</strong> ${pkg.PkgEndDate.slice(0,10)}</p>
        <p><strong>Price:</strong> $${Number(pkg.PkgBasePrice).toFixed(2)}</p>
        <button class="order-btn" onclick="window.location.href='order.html?package=${encodeURIComponent(pkg.PkgName)}'">Order Now</button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Package load error:", err);
    container.innerHTML = "<p class='error'>Failed to load packages.</p>";
  }
}

// =========================
// DYNAMIC AGENCY LOADER
// =========================
async function loadAgencies() {
  const container = document.querySelector("#agencies-container");
  if (!container) return;

  try {
    // Force absolute URL to the running Node server
    const res = await fetch("http://localhost:3000/api/agencies");

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API data");

    container.innerHTML = "";
    data.forEach(a => {
      const agency = document.createElement("div");
      agency.className = "agency-card";
      const agents = a.Agents.map(x => `
        <div class="agent-card">
          <p><strong>${x.AgtFirstName} ${x.AgtLastName}</strong></p>
          <p>📞 ${x.AgtBusPhone}</p>
          <p>✉️ <a href="mailto:${x.AgtEmail}">${x.AgtEmail}</a></p>
        </div>`).join("");

      agency.innerHTML = `
        <h3>${a.AgncyCity} Office</h3>
        <p class="agency-address">${a.AgncyAddress}, ${a.AgncyCity}, ${a.AgncyProv}</p>
        <p class="agency-phone">📞 ${a.AgncyPhone}</p>
        <p class="agency-fax">📠 ${a.AgncyFax}</p>
        <div class="agent-list">${agents}</div>`;
      container.appendChild(agency);
    });
  } catch (err) {
    console.error("❌ Agency load error:", err);
    container.innerHTML = `
      <p style="color: #ff8080; font-size: 1.1rem;">
        ❌ Could not load agencies (see console).<br>
        <small>${err.message}</small>
      </p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadAgencies);


// =========================
// ORDER FORM LOGIC (Popup Confirmation)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm");
  const pkgField = document.getElementById("package");

  // Autofill from ?package=
  const params = new URLSearchParams(window.location.search);
  const selectedPackage = params.get("package");
  if (pkgField && selectedPackage)
    pkgField.value = decodeURIComponent(selectedPackage);

  if (!orderForm) return;

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // stop reload

    const formData = Object.fromEntries(new FormData(orderForm).entries());

    try {
      const res = await fetch("http://localhost:3000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!result.ok) {
        showPopup(`⚠️ ${result.message || "Booking failed."}`, false);
        return;
      }

      const b = result.booking;

      // 🔔 success popup with booking details
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
      orderForm.reset();
    } catch (err) {
      console.error(err);
      showPopup("❌ Could not complete booking.", false);
    }
  });
});

// =========================
// GENERIC TOAST POPUP (small messages)
// =========================
function showPopup(message, success = true) {
  const popup = document.createElement("div");
  popup.textContent = message;
  Object.assign(popup.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: success
      ? "rgba(50,205,50,0.15)"
      : "rgba(255,99,71,0.15)",
    color: success ? "#0f0" : "#f55",
    border: `1px solid ${success ? "#32CD32" : "#f55"}`,
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 0 12px rgba(0,0,0,0.25)",
    backdropFilter: "blur(6px)",
    transition: "opacity 0.5s ease",
  });
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}

// =========================
// MODAL POPUP (main booking confirmation)
// =========================
function showModal(innerHTML) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
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
    maxWidth: "400px",
    animation: "fadeInUp 0.5s ease-out",
  });
  modal.innerHTML = innerHTML + `
    <div style="text-align:center; margin-top:1rem;">
      <button id="closeModalBtn"
        style="background:linear-gradient(90deg,#45a29e 0%,#66fcf1 100%);
               color:#0b0c10;
               font-weight:bold;
               padding:0.6rem 1.2rem;
               border:none;
               border-radius:6px;
               cursor:pointer;">
        Close
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 400);
  });
}
