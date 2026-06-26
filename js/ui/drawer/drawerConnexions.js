// /js/ui/drawer/drawerConnexions.js

import { createAccordionGroup } from "./drawerAccordion.js";

export function buildConnexionsSection() {
  return createAccordionGroup({
    id: "mobile-nav-connexions",
    label: "Connexions",
    items: [
      {
        href: "./register.html",
        id: "mobile-nav-register",
        label: "Register"
      },
      {
        href: "./login.html",
        id: "mobile-nav-login",
        label: "Login"
      }
    ]
  });
}
