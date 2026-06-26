// /js/ui/drawer/drawerServices.js

import { createAccordionGroup } from "./drawerAccordion.js";
import { SERVICE_GROUPS } from "../../core/constants.js";

export function buildServicesSection() {
  return createAccordionGroup({
    id: "mobile-nav-services-group",
    label: "Services",
    items: [
      {
        href: `./services.html?group=${SERVICE_GROUPS.IMEI}`,
        id: "mobile-nav-services-imei",
        label: "Services IMEI"
      },
      {
        href: `./services.html?group=${SERVICE_GROUPS.SERVEUR}`,
        id: "mobile-nav-services-serveur",
        label: "Services Serveur"
      },
      {
        href: `./services.html?group=${SERVICE_GROUPS.LOUER_OUTILS}`,
        id: "mobile-nav-services-louer-outils",
        label: "Louer Outils"
      }
    ]
  });
}
