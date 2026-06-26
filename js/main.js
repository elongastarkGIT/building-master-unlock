import { initRouter, setActiveLinks, fixAbsoluteLinks } from "./core/router.js";
import { COLLECTIONS, ROUTES, resolvePath, ADMIN_ROLES } from "./core/constants.js";
import { formatCurrency } from "../utils/formatters.js";
import { sanitizeObject, sanitizeText } from "../utils/sanitizer.js";

const PUBLIC_DRAWER_LINKS = [
  { href: "./home.html", id: "mobile-nav-home", label: "Accueil" },
  { href: "./services.html", id: "mobile-nav-services", label: "Services" },
  { href: "./brands.html", id: "mobile-nav-brands", label: "Marques" },
  { href: "./tracking.html", id: "mobile-nav-tracking", label: "Suivi commande" },
  { href: "./faq.html", id: "mobile-nav-faq", label: "FAQ" },
  { href: "./announcements.html", id: "mobile-nav-announcements", label: "Annonces" },
  { href: "./status.html", id: "mobile-nav-status", label: "Statut" },
  { href: "./contact.html", id: "mobile-nav-contact", label: "Contact" },
  { href: "./login.html", id: "mobile-nav-login", label: "Connexion" },
  { href: "./register.html", id: "mobile-nav-register", label: "Inscription" }
];

function navigateTo(url) {
  window.location.href = resolvePath(url);
}

function cleanupSensitiveQueryParams() {
  const url = new URL(window.location.href);
  const sensitiveKeys = ["email", "password", "confirmPassword"];
  let hasSensitiveData = false;

  sensitiveKeys.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      hasSensitiveData = true;
    }
  });

  if (hasSensitiveData) {
    const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

function getAuthenticatedRedirect(session) {
  const role = session?.data?.role;

  if (role && Object.values(ADMIN_ROLES).includes(role)) {
    return ROUTES.admin.dashboard;
  }

  return ROUTES.user.dashboard;
}

function showFormError(element, message) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.hidden = false;
}

function clearFormError(element) {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.hidden = true;
}

function mapAuthError(error) {
  const code = typeof error?.code === "string" ? error.code : "";
  const message = typeof error?.message === "string" ? error.message : "";

  if (code === "auth/email-already-in-use") {
    return "Cette adresse email est deja utilisee.";
  }

  if (
    code === "auth/invalid-credential" ||
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "INVALID_CREDENTIALS"
  ) {
    return "Identifiants invalides.";
  }

  if (code === "auth/weak-password" || code === "INVALID_PASSWORD") {
    return "Le mot de passe doit contenir au moins 8 caracteres.";
  }

  if (code === "INVALID_USER_DATA") {
    return "Les informations du formulaire sont invalides.";
  }

  if (code === "auth/popup-closed-by-user") {
    return "Connexion Google annulee.";
  }

  if (code === "auth/popup-blocked") {
    return "Le navigateur a bloque la fenetre Google.";
  }

  if (code === "auth/account-exists-with-different-credential") {
    return "Un compte existe deja avec une autre methode de connexion.";
  }

  if (
    code === "auth/configuration-not-found" ||
    code === "auth/operation-not-allowed"
  ) {
    return "Authentication Firebase non configuree. Activez Email/Mot de passe dans la console Firebase.";
  }

  if (message) {
    return message;
  }

  return "Une erreur est survenue. Reessayez.";
}

function setPendingState(controls, isPending) {
  controls.forEach((control) => {
    if (control) {
      control.disabled = isPending;
    }
  });
}

function getCategoryLabel(category) {
  const map = {
    unlock: "Deblocage mobile",
    imei: "Services IMEI",
    frp: "FRP Unlock",
    icloud: "Services Apple / iCloud",
    mdm: "MDM Unlock",
    tools: "Outils GSM",
    credits: "Credits outils"
  };

  return map[category] || "Service";
}

function getBadgeClass(category) {
  const map = {
    unlock: "badge-info",
    imei: "badge-neutral",
    frp: "badge-success",
    icloud: "badge-neutral",
    mdm: "badge-pending",
    tools: "badge-success",
    credits: "badge-info"
  };

  return map[category] || "badge-neutral";
}

function isServiceVisible(service) {
  return service?.active !== false;
}

function normalizeService(service) {
  const clean = sanitizeObject(service || {});
  const rawPrice = typeof service?.basePrice === "number"
    ? service.basePrice
    : Number(service?.basePrice);

  return {
    id: sanitizeText(service?.id || ""),
    title: sanitizeText(clean.title || "Service sans titre"),
    slug: sanitizeText(clean.slug || ""),
    category: sanitizeText(clean.category || ""),
    description: sanitizeText(clean.description || ""),
    basePrice: Number.isFinite(rawPrice) ? rawPrice : 0,
    active: service?.active !== false,
    deliveryTime: sanitizeText(clean.deliveryTime || clean.delivery || ""),
    brand: sanitizeText(clean.brand || "")
  };
}

function createSkeletonCard(index) {
  const article = document.createElement("article");
  article.className = "card card-interactive";
  article.id = `service-skeleton-${index}`;

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h2");
  title.className = "card-title";

  const titleSkeleton = document.createElement("span");
  titleSkeleton.className = "skeleton skeleton-title";
  titleSkeleton.style.display = "block";
  titleSkeleton.style.width = `${72 + (index % 3) * 8}%`;
  title.appendChild(titleSkeleton);

  const badge = document.createElement("span");
  badge.className = "badge badge-neutral";
  badge.textContent = "—";

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("p");
  body.className = "card-body";

  const lineOne = document.createElement("span");
  lineOne.className = "skeleton skeleton-text";

  const lineTwo = document.createElement("span");
  lineTwo.className = "skeleton skeleton-text";
  lineTwo.style.width = `${58 + (index % 4) * 7}%`;

  body.appendChild(lineOne);
  body.appendChild(lineTwo);

  const footer = document.createElement("div");
  footer.className = "card-footer flex justify-between items-center";

  const price = document.createElement("span");
  price.className = "stat-value";
  price.style.fontSize = "var(--text-xl)";
  price.textContent = "—";

  const action = document.createElement("span");
  action.className = "btn btn-secondary btn-sm";
  action.textContent = "Details";

  footer.appendChild(price);
  footer.appendChild(action);

  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(footer);

  return article;
}

function renderServiceSkeletons(grid, count = 6) {
  if (!grid) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let index = 1; index <= count; index += 1) {
    fragment.appendChild(createSkeletonCard(index));
  }

  grid.replaceChildren(fragment);
  grid.setAttribute("aria-busy", "true");
}

function createServiceCard(service) {
  const article = document.createElement("article");
  article.className = "card card-interactive";
  article.id = `service-card-${service.id}`;

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = service.title;

  const badge = document.createElement("span");
  badge.className = `badge ${getBadgeClass(service.category)}`;
  badge.textContent = getCategoryLabel(service.category);

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("p");
  body.className = "card-body";
  body.textContent = service.description || "Service disponible dans le catalogue MASTER UNLOCKER.";

  const footer = document.createElement("div");
  footer.className = "card-footer flex justify-between items-center";

  const price = document.createElement("span");
  price.className = "stat-value";
  price.style.fontSize = "var(--text-xl)";
  price.textContent = formatCurrency(service.basePrice);

  const link = document.createElement("a");
  link.href = `./service-details.html?id=${encodeURIComponent(service.id)}`;
  link.className = "btn btn-secondary btn-sm";
  link.id = `service-link-${service.id}`;
  link.textContent = "Details";
  link.setAttribute("data-link", "");

  footer.appendChild(price);
  footer.appendChild(link);

  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(footer);

  return article;
}

function initServicesCatalog() {
  const grid = document.getElementById("services-grid");
  const filter = document.getElementById("filter-category");
  const count = document.getElementById("services-count");
  const emptyState = document.getElementById("services-empty");

  if (!grid || !filter || !count) {
    return;
  }

  let allServices = [];

  const renderServices = () => {
    const selectedCategory = sanitizeText(filter.value);
    const visibleServices = allServices.filter((service) => {
      if (!selectedCategory) {
        return true;
      }

      return service.category === selectedCategory;
    });

    if (!visibleServices.length) {
      grid.replaceChildren();
      grid.setAttribute("aria-busy", "false");
      count.textContent = allServices.length
        ? "0 service affiche"
        : "Aucun service disponible";

      if (emptyState) {
        emptyState.hidden = false;
      }

      return;
    }

    const fragment = document.createDocumentFragment();
    visibleServices.forEach((service) => {
      fragment.appendChild(createServiceCard(service));
    });

    grid.replaceChildren(fragment);
    grid.setAttribute("aria-busy", "false");
    count.textContent = `${visibleServices.length} service${visibleServices.length > 1 ? "s" : ""} affiche${visibleServices.length > 1 ? "s" : ""}`;

    if (emptyState) {
      emptyState.hidden = true;
    }

    setActiveLinks();
  };

  renderServiceSkeletons(grid);
  filter.addEventListener("change", renderServices);

  import("../firebase/firestore.js")
    .then(({ listenCollection }) => {
      listenCollection(COLLECTIONS.SERVICES, (services) => {
        allServices = services
          .map(normalizeService)
          .filter(isServiceVisible)
          .sort((first, second) => first.title.localeCompare(second.title, "fr", { sensitivity: "base" }));

        renderServices();
      });
    })
    .catch((error) => {
      console.error("SERVICES CATALOG ERROR:", error);
      grid.replaceChildren();
      grid.setAttribute("aria-busy", "false");
      count.textContent = "Impossible de charger les services";
    });
}

function setServiceDetailsError(message) {
  const safeMessage = sanitizeText(message || "Service introuvable.");
  const title = document.getElementById("service-title");
  const breadcrumb = document.getElementById("breadcrumb-current");
  const description = document.getElementById("service-description");
  const availability = document.getElementById("service-availability");
  const sidebarName = document.getElementById("sidebar-service-name");
  const sidebarTotal = document.getElementById("sidebar-total");
  const cta = document.getElementById("btn-order-cta");
  const form = document.getElementById("order-form");

  if (title) title.textContent = safeMessage;
  if (breadcrumb) breadcrumb.textContent = safeMessage;
  if (description) description.textContent = safeMessage;
  if (availability) availability.textContent = "Indisponible";
  if (sidebarName) sidebarName.textContent = safeMessage;
  if (sidebarTotal) sidebarTotal.textContent = "—";
  if (form) form.hidden = true;

  if (cta) {
    cta.removeAttribute("href");
    cta.setAttribute("aria-disabled", "true");
    cta.classList.add("btn-ghost");
    cta.textContent = "Service indisponible";
  }
}

function renderServiceDetails(service) {
  const normalizedService = normalizeService(service);
  const isAvailable = isServiceVisible(normalizedService);
  const categoryLabel = getCategoryLabel(normalizedService.category);
  const badgeLabel = isAvailable ? categoryLabel : "Indisponible";
  const deliveryLabel = normalizedService.deliveryTime || "Delai communique apres validation";
  const descriptionLabel = normalizedService.description || "Les details de ce service sont disponibles sur demande.";

  const title = document.getElementById("service-title");
  const breadcrumb = document.getElementById("breadcrumb-current");
  const category = document.getElementById("service-category");
  const badge = document.getElementById("service-badge");
  const description = document.getElementById("service-description");
  const price = document.getElementById("service-price");
  const delivery = document.getElementById("service-delivery");
  const availability = document.getElementById("service-availability");
  const sidebarName = document.getElementById("sidebar-service-name");
  const sidebarTotal = document.getElementById("sidebar-total");
  const cta = document.getElementById("btn-order-cta");
  const pageTitle = document.querySelector("title");

  if (title) title.textContent = normalizedService.title;
  if (breadcrumb) breadcrumb.textContent = normalizedService.title;
  if (category) category.textContent = categoryLabel;
  if (description) description.textContent = descriptionLabel;
  if (price) price.textContent = formatCurrency(normalizedService.basePrice);
  if (delivery) delivery.textContent = deliveryLabel;
  if (availability) availability.textContent = isAvailable ? "Disponible" : "Indisponible";
  if (sidebarName) sidebarName.textContent = normalizedService.title;
  if (sidebarTotal) sidebarTotal.textContent = formatCurrency(normalizedService.basePrice);
  if (pageTitle) pageTitle.textContent = `${normalizedService.title} — MASTER UNLOCKER`;

  if (badge) {
    badge.className = `badge ${isAvailable ? getBadgeClass(normalizedService.category) : "badge-neutral"}`;
    badge.textContent = badgeLabel;
  }

  if (cta) {
    if (isAvailable) {
      cta.href = `./checkout.html?serviceId=${encodeURIComponent(normalizedService.id)}`;
      cta.removeAttribute("aria-disabled");
      cta.classList.remove("btn-ghost");
      cta.textContent = "Commander et payer";
    } else {
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
      cta.classList.add("btn-ghost");
      cta.textContent = "Service indisponible";
    }
  }
}

async function initServiceDetails() {
  const serviceTitle = document.getElementById("service-title");

  if (!serviceTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const serviceId = sanitizeText(params.get("id") || "");
  const serviceSlug = sanitizeText(params.get("slug") || "");

  try {
    const { getDocument, queryDocuments } = await import("../firebase/firestore.js");
    let service = null;

    if (serviceId) {
      service = await getDocument(COLLECTIONS.SERVICES, serviceId);
    } else if (serviceSlug) {
      const result = await queryDocuments({
        collectionName: COLLECTIONS.SERVICES,
        filters: [
          {
            field: "slug",
            operator: "==",
            value: serviceSlug
          }
        ],
        limitCount: 1
      });

      service = result.documents[0] || null;
    }

    if (!service) {
      setServiceDetailsError("Service introuvable.");
      return;
    }

    renderServiceDetails(service);
  } catch (error) {
    console.error("SERVICE DETAILS ERROR:", error);
    setServiceDetailsError("Impossible de charger ce service.");
  }
}

function initFaqAccordion() {
  const accordion = document.getElementById("faq-accordion");

  if (!accordion) {
    return;
  }

  const items = Array.from(accordion.querySelectorAll(".faq-item"));

  const closeItem = (item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    item.classList.remove("is-open");
    button?.setAttribute("aria-expanded", "false");

    if (answer) {
      answer.hidden = true;
    }
  };

  const openItem = (item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    items.forEach((currentItem) => {
      if (currentItem !== item) {
        closeItem(currentItem);
      }
    });

    item.classList.add("is-open");
    button?.setAttribute("aria-expanded", "true");

    if (answer) {
      answer.hidden = false;
    }
  };

  items.forEach((item) => {
    const button = item.querySelector(".faq-question");

    button?.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      if (isOpen) {
        closeItem(item);
        return;
      }

      openItem(item);
    });
  });
}

let authModulesPromise = null;

function loadAuthModules() {
  if (!authModulesPromise) {
    authModulesPromise = Promise.all([
      import("../firebase/auth.js"),
      import("./auth/session.js")
    ]).then(([authModule, sessionModule]) => ({
      loginUser: authModule.loginUser,
      loginWithGoogle: authModule.loginWithGoogle,
      registerUser: authModule.registerUser,
      listenSession: sessionModule.listenSession,
      logoutSession: sessionModule.logoutSession
    }));
  }

  return authModulesPromise;
}

function initAuthForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!loginForm && !registerForm) {
    return;
  }

  let suppressAuthenticatedRedirect = false;

  loadAuthModules()
    .then(({ listenSession }) => {
      listenSession((session) => {
        if (suppressAuthenticatedRedirect) {
          return;
        }

        if (session?.data) {
          navigateTo(getAuthenticatedRedirect(session));
        }
      });
    })
    .catch((error) => {
      console.error("AUTH SESSION INIT ERROR:", error);
    });

  if (loginForm) {
    const loginError = document.getElementById("login-error");
    const loginSubmit = document.getElementById("login-submit");
    const loginGoogle = document.getElementById("login-google");

    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormError(loginError);
      setPendingState([loginSubmit, loginGoogle], true);

      const formData = new FormData(loginForm);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const { loginUser } = await loadAuthModules();
        await loginUser(email, password);
        navigateTo(ROUTES.user.dashboard);
      } catch (error) {
        showFormError(loginError, mapAuthError(error));
        setPendingState([loginSubmit, loginGoogle], false);
      }
    });

    loginGoogle?.addEventListener("click", async () => {
      clearFormError(loginError);
      setPendingState([loginSubmit, loginGoogle], true);

      try {
        const { loginWithGoogle } = await loadAuthModules();
        await loginWithGoogle();
        navigateTo(ROUTES.user.dashboard);
      } catch (error) {
        showFormError(loginError, mapAuthError(error));
        setPendingState([loginSubmit, loginGoogle], false);
      }
    });
  }

  if (registerForm) {
    const registerError = document.getElementById("register-error");
    const registerSubmit = document.getElementById("register-submit");
    const registerGoogle = document.getElementById("register-google");
    const passwordInput = document.getElementById("register-password");
    const confirmInput = document.getElementById("register-confirm");

    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormError(registerError);

      if (passwordInput?.value !== confirmInput?.value) {
        showFormError(registerError, "Les mots de passe ne correspondent pas.");
        return;
      }

      setPendingState([registerSubmit, registerGoogle], true);
      suppressAuthenticatedRedirect = true;

      const formData = new FormData(registerForm);

      try {
        const { registerUser, logoutSession } = await loadAuthModules();
        await registerUser({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password")
        });

        await logoutSession();
        navigateTo(ROUTES.public.login);
      } catch (error) {
        suppressAuthenticatedRedirect = false;
        showFormError(registerError, mapAuthError(error));
        setPendingState([registerSubmit, registerGoogle], false);
      }
    });

    registerGoogle?.addEventListener("click", async () => {
      clearFormError(registerError);
      setPendingState([registerSubmit, registerGoogle], true);

      try {
        const { loginWithGoogle } = await loadAuthModules();
        await loginWithGoogle();
        navigateTo(ROUTES.user.dashboard);
      } catch (error) {
        showFormError(registerError, mapAuthError(error));
        setPendingState([registerSubmit, registerGoogle], false);
      }
    });
  }
}

function initPublicMobileNav() {
  if (!document.body.classList.contains("page-public")) {
    return;
  }

  const header = document.getElementById("site-header");
  const headerContainer = header?.querySelector(".container");
  const logo = document.getElementById("logo-link");
  const mobileNav = document.getElementById("mobile-nav");

  if (!header || !headerContainer || !logo || !mobileNav) {
    return;
  }

  document.body.appendChild(mobileNav);

  const navHeader = document.createElement("div");
  navHeader.className = "mobile-nav-header";
  navHeader.id = "mobile-nav-header";

  const navTitle = document.createElement("span");
  navTitle.className = "mobile-nav-title";
  navTitle.id = "mobile-nav-title";
  navTitle.textContent = "Navigation";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.id = "mobile-nav-close";
  closeButton.className = "mobile-nav-close";
  closeButton.setAttribute("aria-label", "Fermer le menu");

  for (let index = 0; index < 2; index += 1) {
    const bar = document.createElement("span");
    bar.className = "mobile-nav-close-bar";
    bar.setAttribute("aria-hidden", "true");
    closeButton.appendChild(bar);
  }

  navHeader.appendChild(navTitle);
  navHeader.appendChild(closeButton);

  const linksWrap = document.createElement("div");
  linksWrap.className = "mobile-nav-links";
  linksWrap.id = "mobile-nav-links";

  const drawerLinksFragment = document.createDocumentFragment();

  PUBLIC_DRAWER_LINKS.forEach(({ href, id, label }) => {
    const link = document.createElement("a");
    link.href = href;
    link.id = id;
    link.textContent = label;
    link.setAttribute("data-link", "");
    drawerLinksFragment.appendChild(link);
  });

  linksWrap.appendChild(drawerLinksFragment);
  mobileNav.replaceChildren(navHeader, linksWrap);

  let toggle = document.getElementById("mobile-menu-toggle");

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.id = "mobile-menu-toggle";
    toggle.className = "menu-toggle menu-toggle-public";
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    toggle.setAttribute("aria-controls", "mobile-nav");
    toggle.setAttribute("aria-expanded", "false");

    for (let index = 0; index < 3; index += 1) {
      const bar = document.createElement("span");
      bar.className = "menu-toggle-bar";
      bar.setAttribute("aria-hidden", "true");
      toggle.appendChild(bar);
    }

    headerContainer.insertBefore(toggle, logo);
  }

  let overlay = document.getElementById("mobile-nav-overlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "mobile-nav-overlay";
    overlay.className = "mobile-nav-overlay";
    overlay.setAttribute("aria-hidden", "true");
  }

  document.body.appendChild(overlay);

  const closeMenu = () => {
    if (!mobileNav.classList.contains("is-open")) {
      return;
    }

    mobileNav.classList.remove("is-open");
    overlay.classList.remove("is-open");
    document.body.classList.remove("mobile-nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    overlay.setAttribute("aria-hidden", "true");
    mobileNav.setAttribute("aria-hidden", "true");
  };

  const openMenu = () => {
    mobileNav.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("mobile-nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fermer le menu");
    overlay.setAttribute("aria-hidden", "false");
    mobileNav.setAttribute("aria-hidden", "false");
  };

  const toggleMenu = () => {
    if (mobileNav.classList.contains("is-open")) {
      closeMenu();
      return;
    }

    openMenu();
  };

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMenu();
  });

  closeButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeMenu();
  });

  overlay.addEventListener("click", closeMenu);

  linksWrap.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!mobileNav.classList.contains("is-open")) {
      return;
    }

    const target = event.target;

    if (
      mobileNav.contains(target) ||
      toggle.contains(target) ||
      overlay.contains(target)
    ) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  mobileNav.setAttribute("aria-hidden", "true");
}

function isIndexPage() {
  const pathname = window.location.pathname.toLowerCase();
  return pathname.endsWith("/index.html") || pathname.endsWith("/");
}

document.addEventListener("DOMContentLoaded", async () => {
  if (isIndexPage()) {
    return;
  }

  cleanupSensitiveQueryParams();
  fixAbsoluteLinks();
  initPublicMobileNav();
  initFaqAccordion();
  setActiveLinks();
  window.addEventListener("popstate", setActiveLinks);
  initRouter();

  try {
    initAuthForms();
    initServicesCatalog();
    await initServiceDetails();
  } catch (error) {
    console.error("PAGE INIT ERROR:", error);
  }

  try {
    const { initCore } = await import("./core/app.js");
    await initCore();
  } catch (error) {
    console.error("INIT CORE ERROR:", error);
  }
});