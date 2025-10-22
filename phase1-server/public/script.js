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
  setupOrderForm();
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
    const res = await fetch("/api/packages");
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
    const res = await fetch("/api/agencies");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API response");

    container.innerHTML = "";
    data.forEach(agency => {
      const agencyCard = document.createElement("div");
      agencyCard.className = "agency-card";

      const agentsHTML = agency.Agents.map(agent => `
        <div class="agent-card">
          <p><strong>${agent.AgtFirstName} ${agent.AgtLastName}</strong></p>
          <p>📞 ${agent.AgtBusPhone}</p>
          <p>✉️ <a href="mailto:${agent.AgtEmail}">${agent.AgtEmail}</a></p>
        </div>
      `).join("");

      agencyCard.innerHTML = `
        <h3>${agency.AgncyCity} Office</h3>
        <p class="agency-address">${agency.AgncyAddress}, ${agency.AgncyCity}, ${agency.AgncyProv}</p>
        <p class="agency-phone">📞 ${agency.AgncyPhone}</p>
        <p class="agency-fax">📠 ${agency.AgncyFax}</p>
        <div class="agent-list">${agentsHTML}</div>
      `;
      container.appendChild(agencyCard);
    });
  } catch (err) {
    console.error("Agency load error:", err);
    container.innerHTML = "<p class='error'>Failed to load agencies.</p>";
  }
}

// =========================
// ORDER FORM LOGIC
// =========================
function setupOrderForm() {
  const form = document.getElementById("orderForm");
  if (!form) return;

  const pkgField = document.getElementById("package");
  const confirmation = document.getElementById("confirmation");

  const params = new URLSearchParams(window.location.search);
  const pkgName = params.get("package");
  if (pkgField && pkgName) pkgField.value = pkgName;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("custName").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const pkg = pkgField.value;

    confirmation.innerHTML = `
      <h2>✅ Booking Confirmed!</h2>
      <p>Thank you, <strong>${name}</strong>!</p>
      <p>Your booking for <strong>${pkg}</strong> has been received.</p>
      <p>A confirmation email will be sent to <strong>${email}</strong>.</p>
    `;
    confirmation.classList.remove("hidden");
    form.reset();
  });
}
