// /js/services/serviceVisibility.js

export function shouldShowPrices(session) {
  return Boolean(session?.data);
}

export function applyPriceVisibility(element, session) {
  if (!element) {
    return;
  }

  if (shouldShowPrices(session)) {
    element.removeAttribute("hidden");
    element.style.display = "";
    return;
  }

  element.setAttribute("hidden", "hidden");
  element.style.display = "none";
}

export function applyPriceVisibilityAll(selectors, session, root = document) {
  selectors.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element) => {
      applyPriceVisibility(element, session);
    });
  });
}
