document.addEventListener("DOMContentLoaded", () => {
  console.log("TravelExperts JS initialized ✈️");

  // Smooth scroll (only for internal anchor links)
  document.querySelectorAll("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Hero image slideshow — only on pages that have a #hero img
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

  // Debug log when hovering over destination cards
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`Hovering: ${card.dataset.place}`)
    );
  });
});

// Highlight active nav link based on visible section
window.addEventListener("scroll", () => {
  document.querySelectorAll("nav a[href^='#']").forEach(link => {
    const section = document.querySelector(link.getAttribute("href"));
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        link.style.color = "var(--highlight)";
      } else {
        link.style.color = "var(--accent)";
      }
    }
  });
});

// ---- BOOKING HANDLER ----
function bookNow(destination) {
  alert(`Booking request submitted for ${destination}!`);
}

// ---- REGISTRATION VALIDATION ----
function validateForm() {
  const name = document.getElementById("fullname")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const destination = document.getElementById("destination")?.value;

  if (!name || !email || !phone || !destination) {
    alert("Please fill in all fields before submitting!");
    return false;
  }

  alert(`Thank you, ${name}! You're registered for updates about ${destination}.`);
  return true;
}

// ---- CONTACT FORM VALIDATION ----
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
// Registration Form Validation
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registrationForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent page reload
    if (!validateRegistration()) return;

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      const text = await response.text();
      console.log("Server response:", text);

      // Display the server response dynamically on-page
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

function validateRegistration() {
  const required = [
    "custFirstName", "custLastName", "custAddress", "custCity", "custProv",
    "custCountry", "custPostal", "custEmail", "custHomePhone", "userId", "custPassword"
  ];

  for (const id of required) {
    const field = document.getElementById(id);
    if (!field.value.trim()) {
      alert(`Please fill out the ${id.replace("cust", "").replace(/([A-Z])/g, " $1")} field.`);
      field.focus();
      return false;
    }
  }

  const email = document.getElementById("custEmail").value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  return true;
}

// ======= BOOKING VALIDATION POPUP =======
// === POPUP LOGIC (for inline onclick buttons) ===
function openBookingPopup(destination) {
  const popup = document.getElementById("login-popup");
  popup.classList.remove("hidden");
  popup.dataset.destination = destination;
}

document.getElementById("popup-cancel").addEventListener("click", () => {
  const popup = document.getElementById("login-popup");
  popup.classList.add("hidden");
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
