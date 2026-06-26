// /js/ui/drawer/mobileDrawer.js

import { buildConnexionsSection } from "./drawerConnexions.js";
import { buildServicesSection } from "./drawerServices.js";
import { buildCommandesSection } from "./drawerCommandes.js";
import { buildUserLinksSection } from "./drawerUserLinks.js";
import { buildStaticLinksSection } from "./drawerStaticLinks.js";

function isAuthenticated(session) {
  return Boolean(session?.data);
}

export function renderDrawerContent(linksWrap, session = null) {
  if (!linksWrap) {
    return;
  }

  const fragment = document.createDocumentFragment();

  if (isAuthenticated(session)) {
    fragment.appendChild(buildUserLinksSection(session));
  } else {
    fragment.appendChild(buildConnexionsSection());
  }

  fragment.appendChild(buildServicesSection());

  if (isAuthenticated(session)) {
    fragment.appendChild(buildCommandesSection());
  }

  fragment.appendChild(buildStaticLinksSection());
  linksWrap.replaceChildren(fragment);
}

export function initMobileDrawer() {
  if (!document.body.classList.contains("page-public")) {
    return null;
  }

  const header = document.getElementById("site-header");
  const headerContainer = header?.querySelector(".container");
  const logo = document.getElementById("logo-link");
  const mobileNav = document.getElementById("mobile-nav");

  if (!header || !headerContainer || !logo || !mobileNav) {
    return null;
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

  renderDrawerContent(linksWrap, null);
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

  mobileNav.addEventListener("click", (event) => {
    const target = event.target;

    if (target instanceof HTMLAnchorElement && mobileNav.contains(target)) {
      closeMenu();
    }
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

  return linksWrap;
}

export function updateMobileDrawerSession(session) {
  const linksWrap = document.getElementById("mobile-nav-links");
  renderDrawerContent(linksWrap, session);
}
