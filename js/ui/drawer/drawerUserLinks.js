// /js/ui/drawer/drawerUserLinks.js

import { logoutSession } from "../../auth/session.js";
import { ROUTES } from "../../core/constants.js";
import { navigate, getDashboardPathForRole, toPagesRelativePath } from "../../core/router.js";

function createDrawerLink(href, id, label) {
  const link = document.createElement("a");
  link.href = href;
  link.id = id;
  link.textContent = label;
  link.className = "mobile-nav-primary-link";
  link.setAttribute("data-link", "");
  return link;
}

function createDrawerLogoutButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.id = "mobile-nav-logout";
  button.className = "mobile-nav-logout-btn";
  button.textContent = "Déconnexion";

  button.addEventListener("click", async () => {
    await logoutSession();
    navigate(ROUTES.public.home);
  });

  return button;
}

export function buildUserLinksSection(session) {
  const wrap = document.createElement("div");
  wrap.className = "mobile-nav-user-block";
  wrap.id = "mobile-nav-user-block";

  const dashboardPath = toPagesRelativePath(getDashboardPathForRole(session?.data?.role));

  wrap.appendChild(createDrawerLink(
    dashboardPath,
    "mobile-nav-dashboard",
    "Dashboard"
  ));

  wrap.appendChild(createDrawerLogoutButton());

  return wrap;
}
