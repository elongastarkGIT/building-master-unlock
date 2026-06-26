// /js/core/router.js

import { ROUTES, USER_ROLES, ADMIN_ROLES, resolvePath, stripBasePath } from "./constants.js";
import { guardPage } from "./guards.js";

/* =========================
   ROUTER STATE
========================= */

let currentPath = stripBasePath(window.location.pathname);

/* =========================
   FIX ABSOLUTE LINKS (HTML)
========================= */

export function fixAbsoluteLinks(root = document) {
  root.querySelectorAll('a[href^="/"], form[action^="/"]').forEach((el) => {
    const attr = el.hasAttribute("href") ? "href" : "action";
    const value = el.getAttribute(attr);
    if (value && value.startsWith("/")) {
      el.setAttribute(attr, resolvePath(value));
    }
  });
}

/* =========================
   NAVIGATE (SAFE)
========================= */
export function navigate(url) {
  if (!url) return;
  window.location.href = resolvePath(url);
}

/* =========================
   ROUTE TABLE
========================= */

const routes = [
  // PUBLIC
  { path: "/", type: "public" },
  { path: "/index.html", type: "public" },
  { path: ROUTES.public.home, type: "public" },
  { path: ROUTES.public.services, type: "public" },
  { path: ROUTES.public.serviceDetails, type: "public" },
  { path: ROUTES.public.login, type: "public" },
  { path: ROUTES.public.register, type: "public" },
  { path: ROUTES.public.forgotPassword, type: "public" },
  { path: ROUTES.public.checkout, type: "public" },
  { path: ROUTES.public.brands, type: "public" },
  { path: ROUTES.public.brandDetails, type: "public" },
  { path: ROUTES.public.faq, type: "public" },
  { path: ROUTES.public.contact, type: "public" },
  { path: ROUTES.public.announcements, type: "public" },
  { path: ROUTES.public.status, type: "public" },
  { path: ROUTES.public.tracking, type: "public" },
  { path: ROUTES.public.maintenance, type: "public" },
  { path: ROUTES.public.notFound, type: "public" },

  // USER DASHBOARD
  { path: ROUTES.user.dashboard, type: "user" },
  { path: ROUTES.user.orders, type: "user" },
  { path: ROUTES.user.orderDetails, type: "user" },
  { path: ROUTES.user.profile, type: "user" },
  { path: ROUTES.user.payments, type: "user" },
  { path: ROUTES.user.notifications, type: "user" },
  { path: ROUTES.user.tickets, type: "user" },
  { path: ROUTES.user.licenses, type: "user" },
  { path: ROUTES.user.wallet, type: "user" },
  { path: ROUTES.user.settings, type: "user" },
  { path: ROUTES.user.security, type: "user" },

  // ADMIN
  { path: ROUTES.admin.dashboard, type: "admin" },
  { path: ROUTES.admin.orders, type: "admin" },
  { path: ROUTES.admin.orderDetails, type: "admin" },
  { path: ROUTES.admin.users, type: "admin" },
  { path: ROUTES.admin.admins, type: "admin" },
  { path: ROUTES.admin.services, type: "admin" },
  { path: ROUTES.admin.categories, type: "admin" },
  { path: ROUTES.admin.serviceEditor, type: "admin" },
  { path: ROUTES.admin.payments, type: "admin" },
  { path: ROUTES.admin.tickets, type: "admin" },
  { path: ROUTES.admin.notifications, type: "admin" },
  { path: ROUTES.admin.promotions, type: "admin" },
  { path: ROUTES.admin.providers, type: "admin" },
  { path: ROUTES.admin.reports, type: "admin" },
  { path: ROUTES.admin.settings, type: "admin" },
  { path: ROUTES.admin.status, type: "admin" },
  { path: ROUTES.admin.logs, type: "admin" }
];

/* =========================
   GET CURRENT ROUTE
========================= */

function getRoute(path) {
  const normalized = stripBasePath(path);
  const exact = routes.find((route) => route.path === normalized);

  if (exact) {
    return exact;
  }

  const matches = routes
    .filter((route) => route.path !== "/" && normalized.startsWith(route.path))
    .sort((a, b) => b.path.length - a.path.length);

  return matches[0] || null;
}

/* =========================
   GUARD SYSTEM
========================= */

function applyGuard(route) {
  if (!route) return;

  if (route.type === "user") {
    guardPage({ allowRoles: [USER_ROLES.USER] });
  }

  if (route.type === "admin") {
    guardPage({
      allowRoles: Object.values(ADMIN_ROLES)
    });
  }
}

/* =========================
   ROUTER INIT
========================= */

export function initRouter() {
  fixAbsoluteLinks();
  currentPath = stripBasePath(window.location.pathname);

  const route = getRoute(currentPath);
  applyGuard(route);

  window.addEventListener("popstate", () => {
    currentPath = stripBasePath(window.location.pathname);
    const nextRoute = getRoute(currentPath);
    applyGuard(nextRoute);
    setActiveLinks();
  });
}

/* =========================
   ACTIVE LINK SYSTEM
========================= */

export function setActiveLinks() {
  currentPath = stripBasePath(window.location.pathname);

  const links = document.querySelectorAll("[data-link]");

  links.forEach((link) => {
    const href = link.getAttribute("href");
    const normalizedHref = stripBasePath(href);

    if (normalizedHref === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/* =========================
   ROUTE CHECKER
========================= */

export function isRoute(path) {
  return stripBasePath(window.location.pathname) === stripBasePath(path);
}

/* =========================
   AUTH NAV HELPERS
========================= */

export function isAdminRole(role) {
  return Boolean(role && Object.values(ADMIN_ROLES).includes(role));
}

export function getDashboardPathForRole(role) {
  if (isAdminRole(role)) {
    return ROUTES.admin.dashboard;
  }

  return ROUTES.user.dashboard;
}

export function getCtaDestination(ctaType, session) {
  const authenticated = Boolean(session?.data);

  if (!authenticated) {
    return ROUTES.public.login;
  }

  const role = session.data.role;

  if (ctaType === "services") {
    return ROUTES.public.services;
  }

  if (ctaType === "order") {
    return ROUTES.public.services;
  }

  if (ctaType === "contact") {
    return ROUTES.public.contact;
  }

  if (ctaType === "tracking") {
    return ROUTES.user.orders;
  }

  if (ctaType === "account" || ctaType === "register") {
    return getDashboardPathForRole(role);
  }

  return getDashboardPathForRole(role);
}

export function toPagesRelativePath(routePath) {
  if (!routePath || typeof routePath !== "string") {
    return routePath;
  }

  if (routePath.startsWith("/pages/")) {
    return `./${routePath.slice("/pages/".length)}`;
  }

  if (routePath.startsWith("/dashboard/")) {
    return `../dashboard/${routePath.slice("/dashboard/".length)}`;
  }

  if (routePath.startsWith("/admin/")) {
    return `../admin/${routePath.slice("/admin/".length)}`;
  }

  return resolvePath(routePath);
}
