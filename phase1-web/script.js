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
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34" // Paris
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
