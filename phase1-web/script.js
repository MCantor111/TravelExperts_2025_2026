document.addEventListener("DOMContentLoaded", () => {
  console.log("TravelExperts JS loaded.");

  // Smooth scroll for navigation links
  document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      target.scrollIntoView({ behavior: "smooth" });
    });
  });

  // Hero slideshow logic
  const heroImages = [
    "https://via.placeholder.com/800x300?text=Bali+Beaches",
    "https://via.placeholder.com/800x300?text=Tokyo+Cityscape",
    "https://via.placeholder.com/800x300?text=Paris+Eiffel+Tower"
  ];
  let currentImage = 0;
  const heroImgElement = document.getElementById("hero-image");

  setInterval(() => {
    currentImage = (currentImage + 1) % heroImages.length;
    heroImgElement.src = heroImages[currentImage];
  }, 4000);

  // Debug logging for destination cards
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mouseenter", () =>
      console.log(`Hovering: ${card.dataset.place}`)
    );
  });
});

// Placeholder booking handler
function bookNow(destination) {
  alert(`Booking request submitted for ${destination}!`);
}

window.addEventListener('scroll', () => {
  document.querySelectorAll('nav a').forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    const rect = section.getBoundingClientRect();
    if (rect.top <= 150 && rect.bottom >= 150) {
      link.style.color = 'var(--highlight)';
    } else {
      link.style.color = 'var(--accent)';
    }
  });
});
