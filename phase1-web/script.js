/*  
  ============================================================
  File: script.js
  Project: Travel Experts – Workshop 1
  Author: Cantor Zapalski  
  Partner: Metacoda (ChatGPT)
  Date: 2025-10-27
  Description:
    Core JavaScript for the Travel Experts website.  
    Handles smooth navigation, rotating hero images, 
    registration form validation, auto-formatting, 
    and booking popup logic.
  ============================================================
*/

// ------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  console.log("Travel Experts JS initialized ✈️");

  // Smooth scrolling for in-page anchor links
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // ----------------------------------------------------------
  // HERO IMAGE SLIDESHOW
  // Rotates through predefined hero images every 5 seconds.
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // DEBUG LOG: Card hover feedback (in browser console)
  // ----------------------------------------------------------
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`Hovering: ${card.dataset.place}`)
    );
  });

  // ----------------------------------------------------------
  // INPUT AUTO-FORMATTING (Phone & Postal Code)
  // ----------------------------------------------------------
  const phoneInput = document.getElementById("custHomePhone");
  const busPhoneInput = document.getElementById("custBusPhone");
  const postalInput = document.getElementById("custPostal");

  // Format home phone as XXX-XXX-XXXX
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "").slice(0, 10);
      if (digits.length > 6)
        phoneInput.value = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
      else if (digits.length > 3)
        phoneInput.value = `${digits.slice(0,3)}-${digits.slice(3)}`;
      else phoneInput.value = digits;
    });
  }

  // Format business phone identically (home phone clone)
  if (busPhoneInput) {
    busPhoneInput.addEventListener("input", () => {
      let digits = busPhoneInput.value.replace(/\D/g, "").slice(0, 10);
      if (digits.length > 6)
        busPhoneInput.value = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
      else if (digits.length > 3)
        busPhoneInput.value = `${digits.slice(0,3)}-${digits.slice(3)}`;
      else busPhoneInput.value = digits;
    });
  }

  // Format postal code as ANA NAN (auto uppercased)
  if (postalInput) {
    postalInput.addEventListener("input", () => {
      let val = postalInput.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
      postalInput.value = val.length > 3 ? `${val.slice(0,3)} ${val.slice(3)}` : val;
    });
  }

  // ----------------------------------------------------------
  // REGISTRATION FORM SUBMISSION HANDLER
  // Performs client-side validation before fetch() POST.
  // ----------------------------------------------------------
  const form = document.getElementById("registrationForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (!validateRegistration()) return; // abort on errors

      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, { method: "POST", body: formData });

        if (!response.ok) throw new Error("Server returned a non-OK status.");

        alert("✅ Registration successful! Thank you for joining Travel Experts.");
        form.reset();
      } catch (err) {
        // Custom friendly message when server is offline
        if (err.message.includes("Failed to fetch"))
          alert("❌ Cannot find endpoint to POST to.\n\nPlease ensure the PHP server is running.");
        else alert("❌ Something went wrong: " + err.message);
      }
    });
  }
}); // END DOMContentLoaded


// ------------------------------------------------------------
// SCROLL-BASED NAVIGATION HIGHLIGHT
// ------------------------------------------------------------
window.addEventListener("scroll", () => {
  document.querySelectorAll("nav a[href^='#']").forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) {
      const rect = section.getBoundingClientRect();
      link.style.color =
        rect.top <= 150 && rect.bottom >= 150 ? "var(--highlight)" : "var(--accent)";
    }
  });
});


// ------------------------------------------------------------
// CONTACT FORM VALIDATION (ALERT CONFIRMATION)
// ------------------------------------------------------------
function sendMessage() {
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const message = document.getElementById("message")?.value.trim();

  if (!name || !email || !message) {
    alert("Please fill out all fields before sending!");
    return false;
  }
  alert(`Thank you, ${name}! Your message has been sent.`);
  return true;
}


// ------------------------------------------------------------
// REGISTRATION FORM VALIDATION (FIELD-LEVEL INLINE ERRORS)
// ------------------------------------------------------------
function validateRegistration() {
  const required = [
    "custFirstName", "custLastName", "custAddress", "custCity", "custProv",
    "custCountry", "custPostal", "custEmail", "custHomePhone", "userId", "custPassword"
  ];
  let valid = true;

  // Clear old error messages
  document.querySelectorAll(".error-message").forEach(el => el.remove());
  document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

  // Helper function to display error inline
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

  // Required fields check
  for (const id of required) {
    const field = document.getElementById(id);
    if (!field.value.trim()) showError(id, "This field is required.");
  }

  // Email pattern check
  const email = document.getElementById("custEmail")?.value.trim();
  const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !simpleEmail.test(email))
    showError("custEmail", "Enter a valid email address.");

  // Phone number patterns
  const phonePattern = /^\d{3}-\d{3}-\d{4}$/;
  const phone = document.getElementById("custHomePhone")?.value.trim();
  if (phone && !phonePattern.test(phone))
    showError("custHomePhone", "Use format: 403-555-8192");

  const busPhone = document.getElementById("custBusPhone")?.value.trim();
  if (busPhone && !phonePattern.test(busPhone))
    showError("custBusPhone", "Use format: 403-555-8192");

  // Postal code pattern (ANA NAN)
  const postal = document.getElementById("custPostal")?.value.trim();
  const postalPattern = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  if (postal && !postalPattern.test(postal))
    showError("custPostal", "Use format: T2N 1N4");

  return valid;
}


// ------------------------------------------------------------
// BOOKING POPUP LOGIN SIMULATION
// ------------------------------------------------------------
function openBookingPopup(destination) {
  const popup = document.getElementById("login-popup");
  popup.classList.remove("hidden");
  popup.dataset.destination = destination;
}

// Cancel booking popup
document.getElementById("popup-cancel").addEventListener("click", () => {
  document.getElementById("login-popup").classList.add("hidden");
});

// Submit popup (login mock)
document.getElementById("popup-submit").addEventListener("click", () => {
  const userId = document.getElementById("popup-userid").value.trim();
  const password = document.getElementById("popup-password").value.trim();
  const popup = document.getElementById("login-popup");
  const destination = popup.dataset.destination || "your selected trip";

  if (userId === "userid" && password === "password")
    alert(`✅ Booking confirmed for ${destination}!`);
  else
    alert("❌ Invalid credentials. Please try again.");

  popup.classList.add("hidden");
});
