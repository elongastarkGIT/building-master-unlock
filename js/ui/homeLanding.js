// /js/ui/homeLanding.js

const HERO_TITLES = [
  "Libérez tout le potentiel de vos appareils en un clic.",
  "Ici, vous repartez avec un téléphone officiellement débloqué à vie.",
  "Déblocage de précision et licences GSM, livrés en un temps record."
];

const TITLE_VISIBLE_MS = 4200;
const TITLE_FADE_MS = 420;

function formatCounterValue(value, decimals, prefix, suffix) {
  const fixed = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  const withSpaces = decimals > 0
    ? fixed
    : fixed.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${prefix}${withSpaces}${suffix}`;
}

function animateCounter(element) {
  const targetRaw = element.getAttribute("data-target");

  if (!targetRaw) {
    return;
  }

  const target = Number(targetRaw);
  const decimals = Number(element.getAttribute("data-decimals") || "0");
  const prefix = element.getAttribute("data-prefix") || "";
  const suffix = element.getAttribute("data-suffix") || "";
  const duration = 1400;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    element.textContent = formatCounterValue(current, decimals, prefix, suffix);

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function initHeroTitleRotation(titleEl) {
  if (!titleEl || HERO_TITLES.length < 2) {
    return;
  }

  let index = 0;

  setInterval(() => {
    titleEl.classList.remove("is-visible");

    window.setTimeout(() => {
      index = (index + 1) % HERO_TITLES.length;
      titleEl.textContent = HERO_TITLES[index];
      titleEl.classList.add("is-visible");
    }, TITLE_FADE_MS);
  }, TITLE_VISIBLE_MS);
}

function initHeroCounters() {
  const counters = document.querySelectorAll("#hero-counters .hero-counter-value[data-target]");

  if (!counters.length) {
    return;
  }

  let started = false;

  const run = () => {
    if (started) {
      return;
    }

    started = true;
    counters.forEach((el) => animateCounter(el));
  };

  const root = document.getElementById("hero-counters");

  if (!root || typeof IntersectionObserver !== "function") {
    run();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        run();
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(root);
}

function starsFromRating(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return "★".repeat(value) + "☆".repeat(5 - value);
}

async function hydrateTestimonialsFromFirestore() {
  const cards = Array.from(document.querySelectorAll("#testimonials-grid .testimonial-card"));

  if (!cards.length) {
    return;
  }

  try {
    const { loadApprovedReviews } = await import("../reviews/submitReview.js");
    const reviews = await loadApprovedReviews(3);

    if (!reviews.length) {
      return;
    }

    reviews.forEach((review, index) => {
      const card = cards[index];

      if (!card) {
        return;
      }

      const starsEl = card.querySelector(".testimonial-stars");
      const quoteEl = card.querySelector(".testimonial-quote");
      const authorEl = card.querySelector(".testimonial-author");
      const roleEl = card.querySelector(".testimonial-role");
      const rating = Number(review.rating) || 0;

      if (starsEl) {
        starsEl.textContent = starsFromRating(rating);
        starsEl.setAttribute("aria-label", `Note ${rating} sur 5`);
      }

      if (quoteEl) {
        quoteEl.textContent = String(review.comment || "").trim();
      }

      if (authorEl) {
        authorEl.textContent = "Client";
      }

      if (roleEl) {
        roleEl.textContent = review.orderId ? "Avis commande" : "Avis plateforme";
      }
    });
  } catch (error) {
    console.error("TESTIMONIALS HYDRATE ERROR:", error);
  }
}

function initTestimonialsReveal() {
  const cards = document.querySelectorAll("#testimonials-grid .testimonial-card");

  if (!cards.length) {
    return;
  }

  if (typeof IntersectionObserver !== "function") {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  cards.forEach((card) => observer.observe(card));
}

function initScrollReveal() {
  const nodes = document.querySelectorAll("[data-scroll]");

  if (!nodes.length) {
    return;
  }

  if (typeof IntersectionObserver !== "function") {
    nodes.forEach((node) => node.classList.add("is-inview"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-inview");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  nodes.forEach((node) => observer.observe(node));
}

export async function initHomeLanding() {
  const hero = document.getElementById("hero");

  if (hero) {
    const titleEl = document.getElementById("hero-title-text");
    initHeroTitleRotation(titleEl);
    initHeroCounters();
  }

  await hydrateTestimonialsFromFirestore();
  initTestimonialsReveal();
  initScrollReveal();
}
