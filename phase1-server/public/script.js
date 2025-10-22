/* 
  ============================================
  File: script.js
  Project: Travel Experts – Workshop 1
  Author: Cantor (Matte Black ᗰტ)
  Partner: Metacoda (☣️ケイオバリア☣️)
  Date: 2025-10-18
  Description:
    Core JavaScript logic for Travel Experts website.
    Handles smooth scrolling, image slideshow, form
    validation (contact + registration), and popup 
    booking simulation.
  ============================================
*/

// =========================
// PAGE INITIALIZATION
// =========================
document.addEventListener("DOMContentLoaded", () => { 
  console.log("TravelExperts JS initialized ✈️");

  // -------------------------
  // Smooth Scrolling
  // -------------------------
  // Adds smooth scrolling for internal anchor links (those beginning with "#").
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();  // prevent instant jump
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // -------------------------
  // Hero Image Slideshow
  // -------------------------
  // Cycles through a predefined list of hero images every 5 seconds.
  const heroImg = document.querySelector("#hero img");
  if (heroImg) {
    const heroImages = [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", // Bali
      "https://images.unsplash.com/photo-1549693578-d683be217e58",   // Tokyo
      "https://images.unsplash.com/photo-1541338906008-f2d4ad1b2231" // Paris
    ];
    let current = 0;
    setInterval(() => {
      current = (current + 1) % heroImages.length;
      heroImg.src = heroImages[current];
    }, 5000);
  }

  // -------------------------
  // Card Hover Debug
  // -------------------------
  // Console log triggered when hovering over destination cards.
  // Useful for testing hover interactions or analytics logging.
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`Hovering: ${card.dataset.place}`)
    );
  });

  // -------------------------
  // Auto-Formatting Handlers
  // -------------------------
  // Automatically format Canadian phone numbers and postal codes
  // in the registration form as the user types.
  const phoneInput = document.getElementById("custHomePhone");
  const postalInput = document.getElementById("custPostal");

  // Auto-format phone number: "4035558192" → "403-555-8192"
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, ""); // remove non-numeric chars
      if (digits.length > 10) digits = digits.slice(0, 10);

      if (digits.length > 6) {
        phoneInput.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        phoneInput.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        phoneInput.value = digits;
      }
    });
  }

  // Auto-format postal code: "t2n1n4" → "T2N 1N4"
  if (postalInput) {
    postalInput.addEventListener("input", () => {
      let val = postalInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (val.length > 6) val = val.slice(0, 6);
      if (val.length > 3) {
        postalInput.value = `${val.slice(0, 3)} ${val.slice(3)}`;
      } else {
        postalInput.value = val;
      }
    });
  }
});


// =========================
// NAVIGATION HIGHLIGHT
// =========================
// Dynamically highlights navigation links based on the section
// currently visible in the viewport during scrolling.
window.addEventListener("scroll", () => {
  document.querySelectorAll("nav a[href^='#']").forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) {
      const rect = section.getBoundingClientRect();
      link.style.color = rect.top <= 150 && rect.bottom >= 150
        ? "var(--highlight)"
        : "var(--accent)";
    }
  });
});


// =========================
// CONTACT FORM VALIDATION
// =========================
// Simple client-side validation for the contact page form.
// Ensures that all fields are filled before submission.
function sendMessage() {
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const message = document.getElementById("message")?.value.trim();

  if (!name || !email || !message) {
    alert("Please fill out all fields before sending!");
    return false;
  }

  alert(`Thank you, ${name}! Your message has been sent. We'll get back to you soon.`);
  return true;
}


// =========================
// REGISTRATION FORM VALIDATION
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return; // skip if not on registration page

  // Handle form submission manually using Fetch API
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent default page reload
    if (!validateRegistration()) return;

    const formData = new FormData(form);

    try {
      // Simulate POST submission to PHP server-side validator
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Server response:", text);

      // Display server response dynamically below form
      const resultDiv = document.createElement("div");
      resultDiv.style.marginTop = "2rem";
      resultDiv.style.padding = "1rem";
      resultDiv.style.background = "rgba(69,162,158,0.15)";
      resultDiv.style.borderRadius = "8px";
      resultDiv.innerHTML = text;
      form.parentNode.appendChild(resultDiv);

    } catch (err) {
      alert("Something went wrong: " + err.message);
    }
  });
});


// -------------------------
// validateRegistration()
// -------------------------
// Performs input validation for the registration form.
// Checks for completeness, proper formatting, and valid email,
// phone, and postal code formats (Canadian).
function validateRegistration() {
  const required = [
    "custFirstName", "custLastName", "custAddress", "custCity", "custProv",
    "custCountry", "custPostal", "custEmail", "custHomePhone", "userId", "custPassword"
  ];

  // Ensure all required fields are filled
  for (const id of required) {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      alert(`Please fill out the ${id.replace("cust", "").replace(/([A-Z])/g, " $1")} field.`);
      field.focus();
      return false;
    }
  }

  // Validate email format
  const email = document.getElementById("custEmail").value.trim();
  const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!simpleEmail.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  // Validate phone number (format: 403-555-8192)
  const phone = document.getElementById("custHomePhone").value.trim();
  const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
  if (!phonePattern.test(phone)) {
    alert("Please enter a valid phone number in the format 403-555-8192.");
    return false;
  }

  // Validate postal code (format: T2N 1N4)
  const postal = document.getElementById("custPostal").value.trim();
  const postalPattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  if (!postalPattern.test(postal)) {
    alert("Please enter a valid postal code in the format T2N 1N4.");
    return false;
  }

  return true; // all validations passed
}


// =========================
// BOOKING POPUP VALIDATION
// =========================
// Simulates a user verification process when booking trips
// from the Packages page. Only allows the hard-coded demo login.
function openBookingPopup(destination) {
  const popup = document.getElementById("login-popup");
  popup.classList.remove("hidden");
  popup.dataset.destination = destination;
}

// =========================
// BOOKING POPUP VALIDATION (Safe)
// =========================
function openBookingPopup(destination) {
  const popup = document.getElementById("login-popup");
  if (!popup) return;
  popup.classList.remove("hidden");
  popup.dataset.destination = destination;
}

// Only attach listeners if elements exist
const cancelBtn = document.getElementById("popup-cancel");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    document.getElementById("login-popup").classList.add("hidden");
  });
}

const submitBtn = document.getElementById("popup-submit");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const userId = document.getElementById("popup-userid")?.value.trim();
    const password = document.getElementById("popup-password")?.value.trim();
    const popup = document.getElementById("login-popup");
    const destination = popup?.dataset.destination || "your selected trip";

    if (userId === "userid" && password === "password") {
      alert(`✅ Booking confirmed for ${destination}!`);
    } else {
      alert("❌ Invalid credentials. Please try again.");
    }

    popup?.classList.add("hidden");
  });
}


// ========== Dynamic Package Loader (without default image) ==========
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#packages-container");
  if (!container) return;

  // Image mapping for known packages
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
      const imgSrc = imgMap[pkg.PkgName] || ""; // no fallback now

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
        <button class="order-btn" onclick="window.location.href='order.html?package=${encodeURIComponent(pkg.PkgName)}'">
          Order Now
        </button>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading packages:", err);
    container.innerHTML =
      "<p class='error'>Error loading packages. Please try again later.</p>";
  }
});

// ========== Dynamic Agencies & Agents Loader ==========
// === Dynamic Agency & Agent Loader ===
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#agencies-container");
  if (!container) {
    console.log("No agencies container found");
    return;
  }
  console.log("Agency loader initialized");

    const faceMap = {
      "Janet Delton": "https://cdn.generated.photos/user/02e1b38020a311eb8a900242ac110002_512_512.jpg",
      "Judy Lisle": "https://cdn.generated.photos/user/0b90b82020a311eb8a900242ac110002_512_512.jpg",
      "Dennis C. Reynolds": "https://cdn.generated.photos/user/1110b86020a311eb8a900242ac110002_512_512.jpg",
      "John Coville": "https://cdn.generated.photos/user/1909d2a020a311eb8a900242ac110002_512_512.jpg",
      "Janice W. Dahl": "https://cdn.generated.photos/user/24a3a92020a311eb8a900242ac110002_512_512.jpg",
      "Bruce Dixon": "https://cdn.generated.photos/user/3c2c3b2020a311eb8a900242ac110002_512_512.jpg",
      "Beverly Jones": "https://cdn.generated.photos/user/4b17f44020a311eb8a900242ac110002_512_512.jpg",
      "Jane Merrill": "https://cdn.generated.photos/user/5b07c4a020a311eb8a900242ac110002_512_512.jpg",
      "Brian Peterson": "https://cdn.generated.photos/user/6f8b2f1020a311eb8a900242ac110002_512_512.jpg"
    };


  try {
    const res = await fetch("/api/agencies");
    const { ok, data } = await res.json();
    if (!ok) throw new Error("Bad API response");

    container.innerHTML = "";

    data.forEach(agency => {
      const agencyCard = document.createElement("div");
      agencyCard.className = "agency-card";

      const agentsHTML = agency.Agents.map(agent => {
      const fullName = `${agent.AgtFirstName} ${agent.AgtLastName}`.trim();
      return `
        <div class="agent-card">
          <p><strong>${fullName}</strong></p>
          <p>📞 ${agent.AgtBusPhone}</p>
          <p>✉️ <a href="mailto:${agent.AgtEmail}">${agent.AgtEmail}</a></p>
        </div>
      `;
    }).join("");

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
    console.error("Error loading agencies:", err);
    container.innerHTML =
      "<p class='error'>Unable to load agency information.</p>";
  }
});

// =========================
// ORDER FORM LOGIC
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm");
  const pkgField = document.getElementById("package");
  const confirmation = document.getElementById("confirmation");

  // If a ?package= parameter exists in the URL, show it in the field
  const params = new URLSearchParams(window.location.search);
  const selectedPackage = params.get("package");
  if (pkgField && selectedPackage) pkgField.value = selectedPackage;

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
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
      orderForm.reset();
    });
  }
});
