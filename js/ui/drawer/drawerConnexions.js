// /js/ui/drawer/drawerConnexions.js

import { createAccordionGroup } from "./drawerAccordion.js";

export function buildConnexionsSection() {
  return createAccordionGroup({
    id: "mobile-nav-connexions",
    label: "Connexions",
    items: [
      {
        href: "./login.html",
        id: "mobile-nav-login",
        label: "Connexion"
      },
      {
        href: "./register.html",
        id: "mobile-nav-register",
        label: "Inscription"
      }
    ]
  });
}
