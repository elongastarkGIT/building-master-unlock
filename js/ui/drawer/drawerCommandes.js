// /js/ui/drawer/drawerCommandes.js

import { createAccordionGroup } from "./drawerAccordion.js";
import { ORDER_DRAWER_FILTERS, ROUTES } from "../../core/constants.js";
import { toPagesRelativePath } from "../../core/router.js";

export function buildCommandesSection() {
  const ordersBase = toPagesRelativePath(ROUTES.user.orders);

  return createAccordionGroup({
    id: "mobile-nav-commandes-group",
    label: "Commande",
    items: [
      {
        href: `${ordersBase}?filter=${ORDER_DRAWER_FILTERS.EN_COURS}`,
        id: "mobile-nav-commandes-en-cours",
        label: "Commandes En Cours"
      },
      {
        href: `${ordersBase}?filter=${ORDER_DRAWER_FILTERS.SUCCES}`,
        id: "mobile-nav-commandes-succes",
        label: "Commandes Succès"
      },
      {
        href: `${ordersBase}?filter=${ORDER_DRAWER_FILTERS.SERVEUR}`,
        id: "mobile-nav-commandes-serveur",
        label: "Commandes Serveur"
      },
      {
        href: `${ordersBase}?filter=${ORDER_DRAWER_FILTERS.OUTILS}`,
        id: "mobile-nav-commandes-outils",
        label: "Outils"
      }
    ]
  });
}
