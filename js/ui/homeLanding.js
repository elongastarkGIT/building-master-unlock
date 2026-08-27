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

function isElementInViewport(node) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function createTestimonialCard(review, index) {
  const rating = Number(review.rating) || 0;
  const comment = String(review.comment || "").trim();
  const card = document.createElement("article");
  card.id = `testimonial-${index + 1}`;
  card.className = "testimonial-card liquid-glass";
  card.setAttribute("data-reveal", "");

  const starsEl = document.createElement("p");
  starsEl.id = `testimonial-${index + 1}-stars`;
  starsEl.className = "testimonial-stars";
  starsEl.setAttribute("aria-label", `Note ${rating} sur 5`);
  starsEl.textContent = starsFromRating(rating);

  const quoteEl = document.createElement("p");
  quoteEl.id = `testimonial-${index + 1}-quote`;
  quoteEl.className = "testimonial-quote";
  quoteEl.textContent = comment;

  const authorEl = document.createElement("p");
  authorEl.id = `testimonial-${index + 1}-author`;
  authorEl.className = "testimonial-author";
  authorEl.textContent = "Client";

  const roleEl = document.createElement("p");
  roleEl.id = `testimonial-${index + 1}-role`;
  roleEl.className = "testimonial-role";
  roleEl.textContent = review.orderId ? "Avis commande" : "Avis plateforme";

  card.appendChild(starsEl);
  card.appendChild(quoteEl);
  card.appendChild(authorEl);
  card.appendChild(roleEl);

  return card;
}

function hideTestimonialsSection() {
  const section = document.getElementById("testimonials");

  if (!section) {
    return;
  }

  section.hidden = true;
  section.setAttribute("aria-hidden", "true");

  const grid = document.getElementById("testimonials-grid");

  if (grid) {
    grid.replaceChildren();
  }
}

function showTestimonialsSection() {
  const section = document.getElementById("testimonials");

  if (!section) {
    return;
  }

  section.hidden = false;
  section.removeAttribute("aria-hidden");
}

async function hydrateTestimonialsFromFirestore() {
  const section = document.getElementById("testimonials");
  const grid = document.getElementById("testimonials-grid");

  if (!section || !grid) {
    return;
  }

  hideTestimonialsSection();

  try {
    const { loadApprovedReviews } = await import("../reviews/submitReview.js");
    const reviews = await loadApprovedReviews(3);

    if (!reviews.length) {
      hideTestimonialsSection();
      return;
    }

    const fragment = document.createDocumentFragment();

    reviews.forEach((review, index) => {
      fragment.appendChild(createTestimonialCard(review, index));
    });

    grid.replaceChildren(fragment);
    showTestimonialsSection();
    initTestimonialsReveal();
  } catch (error) {
    console.error("TESTIMONIALS HYDRATE ERROR:", error);
    hideTestimonialsSection();
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
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  cards.forEach((card) => {
    if (isElementInViewport(card)) {
      card.classList.add("is-visible");
      return;
    }

    observer.observe(card);
  });
}

function initScrollReveal() {
  const nodes = document.querySelectorAll("[data-scroll]");

  if (!nodes.length) {
    return;
  }

  document.documentElement.classList.add("has-scroll-reveal");

  const reveal = (node) => {
    node.classList.add("is-inview");
  };

  if (typeof IntersectionObserver !== "function") {
    nodes.forEach(reveal);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });

  nodes.forEach((node) => {
    if (isElementInViewport(node)) {
      reveal(node);
      return;
    }

    observer.observe(node);
  });

  window.setTimeout(() => {
    nodes.forEach((node) => {
      if (!node.classList.contains("is-inview")) {
        reveal(node);
      }
    });
  }, 2500);
}

function applyLogoFallback(img, fallback) {
  if (!img || !fallback) {
    return;
  }

  const showFallback = () => {
    img.classList.add("is-broken");
    img.setAttribute("hidden", "");
    fallback.removeAttribute("hidden");
  };

  if (img.complete) {
    if (img.naturalWidth === 0) {
      showFallback();
    }
    return;
  }

  img.addEventListener("error", showFallback, { once: true });
}

function initLogoFallback() {
  applyLogoFallback(
    document.getElementById("logo-img"),
    document.getElementById("logo-fallback")
  );
  applyLogoFallback(
    document.getElementById("footer-logo-img"),
    document.getElementById("footer-logo-fallback")
  );
}

export async function initHomeLanding() {
  const hero = document.getElementById("hero");

  if (hero) {
    const titleEl = document.getElementById("hero-title-text");
    initHeroTitleRotation(titleEl);
    initHeroCounters();
  }

  initLogoFallback();
  // Ne jamais bloquer l'affichage des sections sur Firestore
  initScrollReveal();
  await hydrateTestimonialsFromFirestore();
}
