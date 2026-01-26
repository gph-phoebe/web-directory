const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

let clickLockId = null;
let clickLockUntil = 0;

function setActive(id) {
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
  });
}

// 1) When you click a nav item: set active immediately (then let scroll take over)
navLinks.forEach(a => {
  a.addEventListener("click", () => {
    const id = a.getAttribute("href").slice(1);
    clickLockId = id;
    clickLockUntil = Date.now() + 800; // lock highlight briefly during scroll
    setActive(id);
  });
});

// 2) Scroll-based: choose the "best" section (closest to top offset)
const TOP_OFFSET = 120; // adjust if you change header spacing

function updateActiveFromScroll() {
  // If we just clicked, keep that active until the lock expires
  if (clickLockId && Date.now() < clickLockUntil) return;

  let bestId = sections[0]?.id;
  let bestDist = Infinity;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const dist = Math.abs(rect.top - TOP_OFFSET);

    // Only consider sections that have reached near the top (or are close)
    if (rect.bottom > TOP_OFFSET && dist < bestDist) {
      bestDist = dist;
      bestId = section.id;
    }
  }

  if (bestId) setActive(bestId);
}

// Run on load + on scroll (throttled with rAF)
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateActiveFromScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

window.addEventListener("resize", updateActiveFromScroll);
window.addEventListener("load", updateActiveFromScroll);

// Optional: if user stops scrolling, release lock sooner
window.addEventListener("scroll", () => {
  if (clickLockId && Date.now() >= clickLockUntil) clickLockId = null;
}, { passive: true });