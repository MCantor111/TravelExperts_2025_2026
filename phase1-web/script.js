/* 
  ============================================
  File: script.js
  Project: Travel Experts – Workshop 1
  Author: Cantor Zapalski
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-26
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
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // -------------------------
  // Hero Image Slideshow
  // -------------------------
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
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`Hovering: ${card.dataset.place}`)
    );
  });

  // -------------------------
  // Auto-Formatting Handlers
  // -------------------------
  const phoneInput = document.getElementById("custHomePhone");
  const busPhoneInput = document.getElementById("custBusPhone");
  const postalInput = document.getElementById("custPostal");

  // Auto-format home phone number
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "");
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

  // ✅ Auto-format business phone number (identical behavior)
  if (busPhoneInput) {
    busPhoneInput.addEventListener("input", () => {
      let digits = busPhoneInput.value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.slice(0, 10);

      if (digits.length > 6) {
        busPhoneInput.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        busPhoneInput.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        busPhoneInput.value = digits;
      }
    });
  }

  // Auto-format postal code
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

  // -------------------------
  // Registration Form Handler
  // -------------------------
  const form = document.getElementById("registrationForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateRegistration()) return;

      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, { method: "POST", body: formData });

        if (!response.ok) {
          throw new Error("Server returned a non-OK status.");
        }

        alert("✅ Registration successful! Thank you for joining Travel Experts.");
        form.reset();
      } catch (err) {
        // 💬 Friendly offline/server error message
        if (err.message.includes("Failed to fetch")) {
          alert("❌ Cannot find endpoint to POST to.\n\nPlease ensure the PHP server is running.");
        } else {
          alert("❌ Something went wrong: " + err.message);
        }
      }
    });
  }
}); // ✅ END DOMContentLoaded


// =========================
// NAVIGATION HIGHLIGHT
// =========================
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
// REGISTRATION VALIDATION
// =========================
function validateRegistration() {
  const required = [
    "custFirstName", "custLastName", "custAddress", "custCity", "custProv",
    "custCountry", "custPostal", "custEmail", "custHomePhone", "userId", "custPassword"
  ];

  let valid = true;

  document.querySelectorAll(".error-message").forEach(el => el.remove());
  document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

  const showError = (id, message) => {
    const field = document.getElementById(id);
    if (!field) return;
    field.classList.add("invalid");
    const error = document.createElement("span");
    error.className = "error-message";
    error.textContent = message;
    field.insertAdjacentElement("afterend", error);
    valid = false;
  };

  // Required fields
  for (const id of required) {
    const field = document.getElementById(id);
    if (!field.value.trim()) showError(id, "This field is required.");
  }

  // Email format
  const email = document.getElementById("custEmail")?.value.trim();
  const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !simpleEmail.test(email)) {
    showError("custEmail", "Enter a valid email address.");
  }

  // Home phone format
  const phone = document.getElementById("custHomePhone")?.value.trim();
  const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
  if (phone && !phonePattern.test(phone)) {
    showError("custHomePhone", "Use format: 403-555-8192");
  }

  // Business phone format (optional)
  const busPhone = document.getElementById("custBusPhone")?.value.trim();
  if (busPhone && !phonePattern.test(busPhone)) {
    showError("custBusPhone", "Use format: 403-555-8192");
  }

  // Postal code format
  const postal = document.getElementById("custPostal")?.value.trim();
  const postalPattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  if (postal && !postalPattern.test(postal)) {
    showError("custPostal", "Use format: T2N 1N4");
  }

  return valid;
}


// =========================
// BOOKING POPUP VALIDATION
// =========================
function openBookingPopup(destination) {
  const popup = document.getElementById("login-popup");
  popup.classList.remove("hidden");
  popup.dataset.destination = destination;
}

document.getElementById("popup-cancel").addEventListener("click", () => {
  document.getElementById("login-popup").classList.add("hidden");
});

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
