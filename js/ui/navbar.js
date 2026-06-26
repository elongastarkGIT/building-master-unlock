// /js/ui/navbar.js

import { listenSession, logoutSession } from "../auth/session.js";
import { ROUTES } from "../core/constants.js";
import {
  navigate,
  getDashboardPathForRole,
  getCtaDestination,
  toPagesRelativePath
} from "../core/router.js";
import { updateMobileDrawerSession } from "./drawer/mobileDrawer.js";

let activeSession = null;

const CTA_REGISTRY = [
  { selector: "#hero-cta-services", type: "services" },
  { selector: "#hero-cta-register", type: "account" },
  { selector: "#features-cta", type: "services" },
  { selector: "#cta-bottom", type: "services" },
  { selector: "#btn-order-cta", type: "order" },
  { selector: "#empty-cta-services", type: "services" },
  { selector: "#btn-pay", type: "order" }
];

function isAuthenticated(session = activeSession) {
  return Boolean(session?.data);
}

function setActiveSession(session) {
  activeSession = session || null;
}

function createNavLink(href, id, label, className = "btn btn-ghost btn-sm") {
  const link = document.createElement("a");
  link.href = href;
  link.id = id;
  link.className = className;
  link.textContent = label;
  link.setAttribute("data-link", "");
  return link;
}

function createLogoutButton(id, className = "btn btn-ghost btn-sm") {
  const button = document.createElement("button");
  button.type = "button";
  button.id = id;
  button.className = className;
  button.textContent = "Déconnexion";

  button.addEventListener("click", async () => {
    await logoutSession();
    navigate(ROUTES.public.home);
  });

  return button;
}

function renderNavActions(session) {
  const container = document.getElementById("nav-actions");

  if (!container) {
    return;
  }

  const fragment = document.createDocumentFragment();

  if (isAuthenticated(session)) {
    const dashboardPath = toPagesRelativePath(getDashboardPathForRole(session.data.role));

    fragment.appendChild(createNavLink(
      dashboardPath,
      "btn-dashboard",
      "Mon Dashboard",
      "btn btn-primary btn-sm"
    ));

    fragment.appendChild(createLogoutButton("btn-logout"));
  } else {
    fragment.appendChild(createNavLink(
      "./login.html",
      "btn-login",
      "Connexion"
    ));

    fragment.appendChild(createNavLink(
      "./register.html",
      "btn-register",
      "Inscription",
      "btn btn-primary btn-sm"
    ));
  }

  container.replaceChildren(fragment);
}

function renderMobileAuthLinks(session) {
  updateMobileDrawerSession(session);
}

function renderFooterAccountLinks(session) {
  const accountNav = document.getElementById("footer-nav-account");

  if (!accountNav) {
    return;
  }

  const list = accountNav.querySelector("ul");

  if (!list) {
    return;
  }

  list.replaceChildren();

  const announcementsItem = document.createElement("li");
  const announcementsLink = document.createElement("a");
  announcementsLink.href = "./announcements.html";
  announcementsLink.id = "footer-link-announcements";
  announcementsLink.textContent = "Annonces";
  announcementsLink.setAttribute("data-link", "");
  announcementsItem.appendChild(announcementsLink);
  list.appendChild(announcementsItem);

  if (isAuthenticated(session)) {
    const dashboardItem = document.createElement("li");
    const dashboardLink = document.createElement("a");
    dashboardLink.href = toPagesRelativePath(getDashboardPathForRole(session.data.role));
    dashboardLink.id = "footer-link-dashboard";
    dashboardLink.textContent = "Mon Dashboard";
    dashboardLink.setAttribute("data-link", "");
    dashboardItem.appendChild(dashboardLink);
    list.appendChild(dashboardItem);

    const logoutItem = document.createElement("li");
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.id = "footer-link-logout";
    logoutButton.className = "footer-logout-btn";
    logoutButton.textContent = "Déconnexion";

    logoutButton.addEventListener("click", async () => {
      await logoutSession();
      navigate(ROUTES.public.home);
    });

    logoutItem.appendChild(logoutButton);
    list.appendChild(logoutItem);
    return;
  }

  const loginItem = document.createElement("li");
  const loginLink = document.createElement("a");
  loginLink.href = "./login.html";
  loginLink.id = "footer-link-login";
  loginLink.textContent = "Connexion";
  loginLink.setAttribute("data-link", "");
  loginItem.appendChild(loginLink);
  list.appendChild(loginItem);

  const registerItem = document.createElement("li");
  const registerLink = document.createElement("a");
  registerLink.href = "./register.html";
  registerLink.id = "footer-link-register";
  registerLink.textContent = "Inscription";
  registerLink.setAttribute("data-link", "");
  registerItem.appendChild(registerLink);
  list.appendChild(registerItem);
}

function bindCtaElement(element, ctaType) {
  if (!element || element.dataset.ctaBound === "true") {
    return;
  }

  element.setAttribute("data-cta", ctaType);
  element.dataset.ctaBound = "true";

  element.addEventListener("click", (event) => {
    const destination = getCtaDestination(ctaType, activeSession);
    const href = toPagesRelativePath(destination);

    if (!isAuthenticated()) {
      event.preventDefault();
      navigate(ROUTES.public.login);
      return;
    }

    if (element.tagName === "A") {
      element.setAttribute("href", href);
    } else {
      event.preventDefault();
      navigate(destination);
    }
  });
}

function registerCtaElements() {
  CTA_REGISTRY.forEach(({ selector, type }) => {
    const element = document.querySelector(selector);

    if (element) {
      bindCtaElement(element, type);
    }
  });

  document.querySelectorAll("[data-cta]").forEach((element) => {
    const ctaType = element.getAttribute("data-cta");

    if (ctaType) {
      bindCtaElement(element, ctaType);
    }
  });
}

function applyCtaTargets(session) {
  const targets = [
    ...CTA_REGISTRY.map(({ selector, type }) => ({
      element: document.querySelector(selector),
      type
    })),
    ...Array.from(document.querySelectorAll("[data-cta]")).map((element) => ({
      element,
      type: element.getAttribute("data-cta")
    }))
  ];

  targets.forEach(({ element, type }) => {
    if (!element || !type) {
      return;
    }

    const destination = getCtaDestination(type, session);
    const href = toPagesRelativePath(destination);

    if (element.tagName === "A") {
      element.setAttribute("href", href);
    }

    if (type === "account" || type === "register") {
      if (isAuthenticated(session)) {
        element.textContent = "Mon Dashboard";
      } else if (element.id === "hero-cta-register") {
        element.textContent = "Créer un compte";
      }
    }
  });
}

function applyPublicNavigation(session) {
  setActiveSession(session);
  renderNavActions(session);
  renderMobileAuthLinks(session);
  renderFooterAccountLinks(session);
  applyCtaTargets(session);
}

export function initPublicNavigation() {
  if (!document.body.classList.contains("page-public")) {
    return;
  }

  registerCtaElements();
  applyPublicNavigation(activeSession);

  listenSession((session) => {
    applyPublicNavigation(session);
  });
}

export function initAdminNavigation() {
  if (!document.body.classList.contains("page-admin")) {
    return;
  }

  const footer = document.getElementById("admin-sidebar-footer");

  const catalogueSection = document.getElementById("nav-section-catalogue");
  const servicesLink = document.getElementById("nav-services");

  if (catalogueSection && servicesLink && !document.getElementById("nav-categories")) {
    const categoriesLink = document.createElement("a");
    categoriesLink.href = "./categories.html";
    categoriesLink.id = "nav-categories";
    categoriesLink.className = "sidebar-link";
    categoriesLink.setAttribute("data-link", "");

    const icon = document.createElement("span");
    icon.className = "sidebar-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "◈";

    const label = document.createElement("span");
    label.textContent = "Catégories";

    categoriesLink.appendChild(icon);
    categoriesLink.appendChild(label);
    catalogueSection.insertBefore(categoriesLink, servicesLink.nextSibling);
  }

  if (!footer || document.getElementById("nav-public-site")) {
    return;
  }

  const publicLink = document.createElement("a");
  publicLink.href = "../pages/home.html";
  publicLink.id = "nav-public-site";
  publicLink.className = "sidebar-link";
  publicLink.setAttribute("data-link", "");

  const icon = document.createElement("span");
  icon.className = "sidebar-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "⌂";

  const label = document.createElement("span");
  label.textContent = "Voir le site public";

  publicLink.appendChild(icon);
  publicLink.appendChild(label);
  footer.insertBefore(publicLink, footer.firstChild);
}
