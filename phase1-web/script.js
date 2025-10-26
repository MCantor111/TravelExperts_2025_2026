/* 
  ============================================
  File: script.js
  Project: Travel Experts – Workshop 1
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
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

// Cancel button hides the popup without doing anything.
document.getElementById("popup-cancel").addEventListener("click", () => {
  document.getElementById("login-popup").classList.add("hidden");
});

// Submit button checks user credentials (mock validation).
document.getElementById("popup-submit").addEventListener("click", () => {
  const userId = document.getElementById("popup-userid").value.trim();
  const password = document.getElementById("popup-password").value.trim();
  const popup = document.getElementById("login-popup");
  const destination = popup.dataset.destination || "your selected trip";

  if (userId === "userid" && password === "password") {
    alert(`✅ Booking confirmed for ${destination}!`);
  } else {
    alert("❌ Invalid credentials. Please try again.");
  }

  popup.classList.add("hidden");
});
