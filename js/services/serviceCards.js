// /js/services/serviceCards.js

import { formatCurrency } from "../../utils/formatters.js";
import {
  getBadgeClass,
  getCategoryLabel,
  normalizeServiceDisplay
} from "./serviceDisplay.js";
import { shouldShowPrices } from "./serviceVisibility.js";

export function createServiceCard(service, session = null) {
  const normalizedService = normalizeServiceDisplay(service);
  const showPrice = shouldShowPrices(session);

  const article = document.createElement("article");
  article.className = "card card-interactive";
  article.id = `service-card-${normalizedService.id}`;

  const header = document.createElement("div");
  header.className = "card-header";

  const titleWrap = document.createElement("div");
  titleWrap.className = "card-title-wrap";

  const title = document.createElement("h2");
  title.className = "card-title";
  title.textContent = normalizedService.title;

  titleWrap.appendChild(title);

  if (normalizedService.isNew) {
    const newBadge = document.createElement("span");
    newBadge.className = "badge badge-new";
    newBadge.id = `service-new-badge-${normalizedService.id}`;
    newBadge.textContent = "Nouveau";
    titleWrap.appendChild(newBadge);
  }

  const badge = document.createElement("span");
  badge.className = `badge ${getBadgeClass(normalizedService.category)}`;
  badge.textContent = getCategoryLabel(normalizedService.category);

  header.appendChild(titleWrap);
  header.appendChild(badge);

  const body = document.createElement("p");
  body.className = "card-body";
  body.textContent = normalizedService.description || "Service disponible dans le catalogue MASTER UNLOCKER.";

  const meta = document.createElement("div");
  meta.className = "card-meta";

  if (normalizedService.deliveryTime) {
    const duration = document.createElement("span");
    duration.className = "card-meta-item";
    duration.id = `service-duration-${normalizedService.id}`;
    duration.textContent = `Duree : ${normalizedService.deliveryTime}`;
    meta.appendChild(duration);
  }

  const footer = document.createElement("div");
  footer.className = "card-footer flex justify-between items-center";

  const price = document.createElement("span");
  price.className = "stat-value service-price";
  price.id = `service-price-${normalizedService.id}`;
  price.style.fontSize = "var(--text-xl)";

  if (showPrice) {
    price.textContent = formatCurrency(normalizedService.basePrice);
  } else {
    price.setAttribute("hidden", "hidden");
    price.style.display = "none";
  }

  const link = document.createElement("a");
  link.href = `./service-details.html?id=${encodeURIComponent(normalizedService.id)}`;
  link.className = "btn btn-secondary btn-sm";
  link.id = `service-link-${normalizedService.id}`;
  link.textContent = "Details";
  link.setAttribute("data-link", "");

  footer.appendChild(price);
  footer.appendChild(link);

  article.appendChild(header);
  article.appendChild(body);

  if (meta.childElementCount) {
    article.appendChild(meta);
  }

  article.appendChild(footer);

  return article;
}

export function createSkeletonCard(index) {
  const article = document.createElement("article");
  article.className = "card card-interactive";
  article.id = `service-skeleton-${index}`;

  const header = document.createElement("div");
  header.className = "card-header";

  const title = document.createElement("h2");
  title.className = "card-title";

  const titleSkeleton = document.createElement("span");
  titleSkeleton.className = "skeleton skeleton-title";
  titleSkeleton.style.display = "block";
  titleSkeleton.style.width = `${72 + (index % 3) * 8}%`;
  title.appendChild(titleSkeleton);

  const badge = document.createElement("span");
  badge.className = "badge badge-neutral";
  badge.textContent = "—";

  header.appendChild(title);
  header.appendChild(badge);

  const body = document.createElement("p");
  body.className = "card-body";

  const lineOne = document.createElement("span");
  lineOne.className = "skeleton skeleton-text";

  const lineTwo = document.createElement("span");
  lineTwo.className = "skeleton skeleton-text";
  lineTwo.style.width = `${58 + (index % 4) * 7}%`;

  body.appendChild(lineOne);
  body.appendChild(lineTwo);

  const footer = document.createElement("div");
  footer.className = "card-footer flex justify-between items-center";

  const price = document.createElement("span");
  price.className = "stat-value";
  price.style.fontSize = "var(--text-xl)";
  price.textContent = "—";

  const action = document.createElement("span");
  action.className = "btn btn-secondary btn-sm";
  action.textContent = "Details";

  footer.appendChild(price);
  footer.appendChild(action);

  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(footer);

  return article;
}

export function renderServiceSkeletons(grid, count = 6) {
  if (!grid) {
    return;
  }

  const fragment = document.createDocumentFragment();

  for (let index = 1; index <= count; index += 1) {
    fragment.appendChild(createSkeletonCard(index));
  }

  grid.replaceChildren(fragment);
  grid.setAttribute("aria-busy", "true");
}
