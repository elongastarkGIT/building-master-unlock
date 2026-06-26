// /js/services/serviceDisplay.js

import { sanitizeObject, sanitizeText } from "../../utils/sanitizer.js";
import { formatCurrency } from "../../utils/formatters.js";
import { SERVICE_GROUPS } from "../core/constants.js";
import { applyPriceVisibility, shouldShowPrices } from "./serviceVisibility.js";

const IMEI_CATEGORIES = new Set(["unlock", "imei", "frp", "icloud", "mdm"]);
const SERVEUR_CATEGORIES = new Set(["tools", "credits", "serveur"]);

export function resolveServiceGroup(service) {
  const explicit = sanitizeText(service?.serviceGroup || service?.group || "");

  if (explicit) {
    return explicit;
  }

  const category = sanitizeText(service?.category || "");

  if (category === SERVICE_GROUPS.LOUER_OUTILS) {
    return SERVICE_GROUPS.LOUER_OUTILS;
  }

  if (SERVEUR_CATEGORIES.has(category)) {
    return SERVICE_GROUPS.SERVEUR;
  }

  if (IMEI_CATEGORIES.has(category)) {
    return SERVICE_GROUPS.IMEI;
  }

  return SERVICE_GROUPS.IMEI;
}

export function normalizeServiceDisplay(service) {
  const clean = sanitizeObject(service || {});
  const rawPrice = typeof service?.basePrice === "number"
    ? service.basePrice
    : Number(service?.basePrice);

  return {
    id: sanitizeText(service?.id || ""),
    title: sanitizeText(clean.title || "Service sans titre"),
    slug: sanitizeText(clean.slug || ""),
    category: sanitizeText(clean.category || ""),
    serviceGroup: resolveServiceGroup(service),
    description: sanitizeText(clean.description || clean.shortDescription || ""),
    basePrice: Number.isFinite(rawPrice) ? rawPrice : 0,
    active: service?.active !== false,
    deliveryTime: sanitizeText(
      clean.estimatedTime || clean.deliveryTime || clean.delivery || ""
    ),
    brand: sanitizeText(clean.brand || ""),
    isNew: service?.isNew === true || service?.nouveau === true,
    phonePhotoUrl: sanitizeText(clean.phonePhotoUrl || clean.phonePhotoLink || ""),
    requiresPhonePhoto: Boolean(
      clean.requiresPhonePhoto ||
      clean.phonePhotoRequired ||
      clean.requirePhonePhoto
    )
  };
}

export function isServiceVisible(service) {
  return service?.active !== false;
}

export function getCategoryLabel(category) {
  const map = {
    unlock: "Deblocage mobile",
    imei: "Services IMEI",
    frp: "FRP Unlock",
    icloud: "Services Apple / iCloud",
    mdm: "MDM Unlock",
    tools: "Outils GSM",
    credits: "Credits outils",
    serveur: "Services Serveur",
    "louer-outils": "Louer Outils"
  };

  return map[category] || "Service";
}

export function getBadgeClass(category) {
  const map = {
    unlock: "badge-info",
    imei: "badge-neutral",
    frp: "badge-success",
    icloud: "badge-neutral",
    mdm: "badge-pending",
    tools: "badge-success",
    credits: "badge-info",
    serveur: "badge-info",
    "louer-outils": "badge-success"
  };

  return map[category] || "badge-neutral";
}

export function renderServiceDetailsPage(service, session) {
  const normalizedService = normalizeServiceDisplay(service);
  const isAvailable = isServiceVisible(normalizedService);
  const showPrices = shouldShowPrices(session);
  const categoryLabel = getCategoryLabel(normalizedService.category);
  const badgeLabel = isAvailable ? categoryLabel : "Indisponible";
  const deliveryLabel = normalizedService.deliveryTime || "Delai communique apres validation";
  const descriptionLabel = normalizedService.description || "Les details de ce service sont disponibles sur demande.";

  const title = document.getElementById("service-title");
  const breadcrumb = document.getElementById("breadcrumb-current");
  const category = document.getElementById("service-category");
  const badge = document.getElementById("service-badge");
  const newBadge = document.getElementById("service-new-badge");
  const description = document.getElementById("service-description");
  const price = document.getElementById("service-price");
  const priceRow = document.getElementById("service-price-row");
  const delivery = document.getElementById("service-delivery");
  const availability = document.getElementById("service-availability");
  const sidebarName = document.getElementById("sidebar-service-name");
  const sidebarTotal = document.getElementById("sidebar-total");
  const sidebarTotalRow = document.getElementById("sidebar-total-row");
  const cta = document.getElementById("btn-order-cta");
  const pageTitle = document.querySelector("title");
  const phonePhotoGroup = document.getElementById("field-phone-photo-group");
  const phonePhotoHint = document.getElementById("field-phone-photo-hint");
  const phonePhotoLink = document.getElementById("field-phone-photo-link");

  if (title) {
    title.textContent = normalizedService.title;
  }

  if (breadcrumb) {
    breadcrumb.textContent = normalizedService.title;
  }

  if (category) {
    category.textContent = categoryLabel;
  }

  if (description) {
    description.textContent = descriptionLabel;
  }

  if (price) {
    price.textContent = showPrices ? formatCurrency(normalizedService.basePrice) : "";
  }

  applyPriceVisibility(priceRow, session);
  applyPriceVisibility(price, session);

  if (delivery) {
    delivery.textContent = deliveryLabel;
  }

  if (availability) {
    availability.textContent = isAvailable ? "Disponible" : "Indisponible";
  }

  if (sidebarName) {
    sidebarName.textContent = normalizedService.title;
  }

  if (sidebarTotal) {
    sidebarTotal.textContent = showPrices ? formatCurrency(normalizedService.basePrice) : "";
  }

  applyPriceVisibility(sidebarTotalRow, session);
  applyPriceVisibility(sidebarTotal, session);

  if (pageTitle) {
    pageTitle.textContent = `${normalizedService.title} — MASTER UNLOCKER`;
  }

  if (badge) {
    badge.className = `badge ${isAvailable ? getBadgeClass(normalizedService.category) : "badge-neutral"}`;
    badge.textContent = badgeLabel;
  }

  if (newBadge) {
    newBadge.hidden = !normalizedService.isNew;
  }

  const showPhonePhoto = normalizedService.requiresPhonePhoto || Boolean(normalizedService.phonePhotoUrl);

  if (phonePhotoGroup) {
    phonePhotoGroup.hidden = !showPhonePhoto;
  }

  if (phonePhotoHint) {
    phonePhotoHint.textContent = "Fournissez un lien vers la photo du telephone (obligatoire pour MDM / Tecno / Samsung).";
  }

  if (phonePhotoLink && normalizedService.phonePhotoUrl) {
    phonePhotoLink.href = normalizedService.phonePhotoUrl;
    phonePhotoLink.textContent = "Voir Exemple Photo";
    phonePhotoLink.hidden = false;
  } else if (phonePhotoLink) {
    phonePhotoLink.removeAttribute("href");
    phonePhotoLink.textContent = "";
    phonePhotoLink.hidden = true;
  }

  if (cta) {
    if (isAvailable) {
      cta.href = `./checkout.html?serviceId=${encodeURIComponent(normalizedService.id)}`;
      cta.removeAttribute("aria-disabled");
      cta.classList.remove("btn-ghost");
      cta.textContent = "Commander et payer";
    } else {
      cta.removeAttribute("href");
      cta.setAttribute("aria-disabled", "true");
      cta.classList.add("btn-ghost");
      cta.textContent = "Service indisponible";
    }
  }
}
