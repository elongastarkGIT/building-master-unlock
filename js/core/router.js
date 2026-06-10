// /js/core/router.js

import { ROUTES, USER_ROLES, ADMIN_ROLES } from "./constants.js";
import { guardPage } from "./guards.js";

/* =========================
   ROUTER STATE
========================= */

let currentPath = window.location.pathname;

/* =========================
   NAVIGATE (SAFE)
========================= */
export function navigate(url) {
  if (!url) return;
  window.location.href = url;
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
  const exact = routes.find((route) => route.path === path);

  if (exact) {
    return exact;
  }

  const matches = routes
    .filter((route) => route.path !== "/" && path.startsWith(route.path))
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
  currentPath = window.location.pathname;

  const route = getRoute(currentPath);
  applyGuard(route);

  window.addEventListener("popstate", () => {
    currentPath = window.location.pathname;
    const nextRoute = getRoute(currentPath);
    applyGuard(nextRoute);
    setActiveLinks();
  });
}

/* =========================
   ACTIVE LINK SYSTEM
========================= */

export function setActiveLinks() {
  currentPath = window.location.pathname;

  const links = document.querySelectorAll("[data-link]");

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (href === currentPath) {
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
  return window.location.pathname === path;
}
