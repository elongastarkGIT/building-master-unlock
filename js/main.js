import { initRouter, setActiveLinks, fixAbsoluteLinks, getDashboardPathForRole } from "./core/router.js";
import { COLLECTIONS, ROUTES, resolvePath, SERVICE_GROUPS } from "./core/constants.js";
import { initPublicNavigation, initAdminNavigation } from "./ui/navbar.js";
import { initMobileDrawer } from "./ui/drawer/mobileDrawer.js";
import { sanitizeText } from "../utils/sanitizer.js";
import {
  createServiceCard,
  renderServiceSkeletons
} from "./services/serviceCards.js";
import {
  normalizeServiceDisplay,
  isServiceVisible,
  renderServiceDetailsPage
} from "./services/serviceDisplay.js";

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
  return getDashboardPathForRole(session?.data?.role);
}

async function redirectAfterAuth() {
  const { waitForSession } = await import("./auth/session.js");
  const session = await waitForSession();
  navigateTo(getAuthenticatedRedirect(session));
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
    return "Authentication Firebase non configuree. Activez Email/Mot de passe et Google dans la console Firebase.";
  }

  if (code === "auth/unauthorized-domain") {
    return "Ce domaine n'est pas autorise dans Firebase Authentication.";
  }

  if (code === "auth/network-request-failed") {
    return "Connexion reseau impossible. Verifiez votre connexion internet.";
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

function normalizeService(service) {
  return normalizeServiceDisplay(service);
}

function initServicesCatalog() {
  const grid = document.getElementById("services-grid");
  const filter = document.getElementById("filter-category");
  const count = document.getElementById("services-count");
  const emptyState = document.getElementById("services-empty");
  const pageTitle = document.getElementById("page-title");

  if (!grid || !filter || !count) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const groupFilter = sanitizeText(urlParams.get("group") || "");
  const groupLabels = {
    [SERVICE_GROUPS.IMEI]: "Services IMEI",
    [SERVICE_GROUPS.SERVEUR]: "Services Serveur",
    [SERVICE_GROUPS.LOUER_OUTILS]: "Louer Outils"
  };

  if (pageTitle && groupFilter && groupLabels[groupFilter]) {
    pageTitle.textContent = groupLabels[groupFilter];
  }

  let allServices = [];
  let activeSession = null;

  const renderServices = () => {
    const selectedCategory = sanitizeText(filter.value);
    const visibleServices = allServices.filter((service) => {
      if (groupFilter && service.serviceGroup !== groupFilter) {
        return false;
      }

      if (!selectedCategory) {
        return true;
      }

      return service.category === selectedCategory;
    });

    if (!visibleServices.length) {
      grid.replaceChildren();
      grid.setAttribute("aria-busy", "false");
      count.textContent = allServices.length
        ? "0 Service affiche"
        : "Aucun Service disponible";

      if (emptyState) {
        emptyState.hidden = false;
      }

      return;
    }

    const fragment = document.createDocumentFragment();
    visibleServices.forEach((service) => {
      fragment.appendChild(createServiceCard(service, activeSession));
    });

    grid.replaceChildren(fragment);
    grid.setAttribute("aria-busy", "false");
    count.textContent = `${visibleServices.length} Service${visibleServices.length > 1 ? "s" : ""} affiche${visibleServices.length > 1 ? "s" : ""}`;

    if (emptyState) {
      emptyState.hidden = true;
    }

    setActiveLinks();
  };

  renderServiceSkeletons(grid);
  filter.addEventListener("change", renderServices);

  import("./auth/session.js")
    .then(({ listenSession }) => {
      listenSession((session) => {
        activeSession = session;
        renderServices();
      });
    })
    .catch((error) => {
      console.error("SERVICES SESSION ERROR:", error);
    });

  import("../firebase/firestore.js")
    .then(async ({ listenCollection }) => {
      try {
        const { loadCategories, fillCategorySelect } = await import("./services/categories.js");
        const categories = await loadCategories({ activeOnly: true });
        fillCategorySelect(filter, categories, {
          includeAllOption: true,
          allLabel: "Toutes les categories"
        });
      } catch (error) {
        console.error("SERVICES CATEGORIES FILTER ERROR:", error);
      }

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
      count.textContent = "Impossible de charger les Services";
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

function renderServiceDetails(service, session = null) {
  renderServiceDetailsPage(service, session);
}

async function initServiceDetails() {
  const serviceTitle = document.getElementById("service-title");

  if (!serviceTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const serviceId = sanitizeText(params.get("id") || "");
  const serviceSlug = sanitizeText(params.get("slug") || "");
  let loadedService = null;

  const applyDetails = (session) => {
    if (!loadedService) {
      return;
    }

    renderServiceDetails(loadedService, session);
  };

  try {
    const { getDocument, queryDocuments } = await import("../firebase/firestore.js");

    if (serviceId) {
      loadedService = await getDocument(COLLECTIONS.SERVICES, serviceId);
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

      loadedService = result.documents[0] || null;
    }

    if (!loadedService) {
      setServiceDetailsError("Service introuvable.");
      return;
    }

    const { listenSession, waitForSession } = await import("./auth/session.js");
    const initialSession = await waitForSession();
    applyDetails(initialSession);

    listenSession((session) => {
      applyDetails(session);
    });
  } catch (error) {
    console.error("SERVICE DETAILS ERROR:", error);
    setServiceDetailsError("Impossible de charger ce Service.");
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
        await redirectAfterAuth();
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
        await redirectAfterAuth();
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
        await redirectAfterAuth();
      } catch (error) {
        showFormError(registerError, mapAuthError(error));
        setPendingState([registerSubmit, registerGoogle], false);
      }
    });
  }
}

function initPublicMobileNav() {
  initMobileDrawer();
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
  initPublicNavigation();
  initAdminNavigation();
  initFaqAccordion();
  setActiveLinks();
  window.addEventListener("popstate", setActiveLinks);

  try {
    const { initCore } = await import("./core/app.js");
    await initCore();
  } catch (error) {
    console.error("INIT CORE ERROR:", error);
  }

  if (document.body.classList.contains("page-dashboard")) {
    try {
      const { initPhoneOnboarding } = await import("./auth/phoneOnboarding.js");
      await initPhoneOnboarding();
    } catch (error) {
      console.error("PHONE ONBOARDING ERROR:", error);
    }
  }

  initRouter();

  try {
    initAuthForms();
    initServicesCatalog();
    await initServiceDetails();

    const { initAdminCategories } = await import("./services/categories.js");
    const { initAdminServices, initServiceEditor } = await import("./admin/manageServices.js");
    await initAdminCategories();
    await initAdminServices();
    await initServiceEditor();
  } catch (error) {
    console.error("PAGE INIT ERROR:", error);
  }
});