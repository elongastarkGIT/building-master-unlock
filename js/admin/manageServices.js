// /js/admin/manageServices.js

import { COLLECTIONS, ROUTES, resolvePath, SERVICE_GROUPS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { generateSlug } from "../../utils/generators.js";
import { validateService } from "../../utils/validators.js";
import { formatCurrency } from "../../utils/formatters.js";
import { loadCategories, fillCategorySelect, getCategoryTitle } from "../services/categories.js";

function showAdminToast(message, type = "info") {
  const container = document.getElementById("toast-container");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = sanitizeText(message);
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 4000);
}

function renderAdminServicesTable(services, categories) {
  const tbody = document.getElementById("admin-services-body");
  const emptyState = document.getElementById("admin-services-empty");

  if (!tbody) {
    return;
  }

  if (!services.length) {
    tbody.replaceChildren();

    if (emptyState) {
      emptyState.hidden = false;
    }

    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  const fragment = document.createDocumentFragment();

  services.forEach((service) => {
    const row = document.createElement("tr");
    row.id = `admin-service-row-${service.id}`;

    const titleCell = document.createElement("td");
    titleCell.textContent = sanitizeText(service.title || "—");

    const slugCell = document.createElement("td");
    slugCell.textContent = sanitizeText(service.slug || "—");

    const categoryCell = document.createElement("td");
    categoryCell.textContent = getCategoryTitle(categories, service.category);

    const priceCell = document.createElement("td");
    const price = typeof service.basePrice === "number" ? service.basePrice : Number(service.basePrice);
    priceCell.textContent = Number.isFinite(price) ? formatCurrency(price) : "—";

    const activeCell = document.createElement("td");
    activeCell.textContent = service.active === false ? "Non" : "Oui";

    const actionsCell = document.createElement("td");
    const editLink = document.createElement("a");
    editLink.href = `./service-editor.html?id=${encodeURIComponent(service.id)}`;
    editLink.className = "btn btn-ghost btn-sm";
    editLink.id = `admin-service-edit-${service.id}`;
    editLink.textContent = "Modifier";
    editLink.setAttribute("data-link", "");
    actionsCell.appendChild(editLink);

    row.appendChild(titleCell);
    row.appendChild(slugCell);
    row.appendChild(categoryCell);
    row.appendChild(priceCell);
    row.appendChild(activeCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminServices() {
  const table = document.getElementById("admin-services-table");

  if (!table) {
    return;
  }

  let categories = [];

  try {
    categories = await loadCategories({ activeOnly: false });
  } catch (error) {
    console.error("ADMIN SERVICES CATEGORIES ERROR:", error);
  }

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.SERVICES, (services) => {
      const sortedServices = services
        .slice()
        .sort((first, second) => sanitizeText(first.title || "").localeCompare(
          sanitizeText(second.title || ""),
          "fr",
          { sensitivity: "base" }
        ));

      renderAdminServicesTable(sortedServices, categories);
    });
  } catch (error) {
    console.error("ADMIN SERVICES LOAD ERROR:", error);
    showAdminToast("Impossible de charger les services.", "error");
  }
}

export async function initServiceEditor() {
  const form = document.getElementById("service-editor-form");

  if (!form) {
    return;
  }

  const titleInput = document.getElementById("service-title");
  const slugInput = document.getElementById("service-slug");
  const priceInput = document.getElementById("service-base-price");
  const categorySelect = document.getElementById("service-category");
  const groupSelect = document.getElementById("service-group");
  const activeInput = document.getElementById("service-active");
  const submitButton = document.getElementById("service-editor-submit");
  const pageTitle = document.getElementById("page-title");
  const breadcrumbCurrent = document.getElementById("breadcrumb-current");

  const params = new URLSearchParams(window.location.search);
  const serviceId = sanitizeText(params.get("id") || "");
  let categories = [];

  try {
    categories = await loadCategories({ activeOnly: true });
    fillCategorySelect(categorySelect, categories);
  } catch (error) {
    console.error("SERVICE EDITOR CATEGORIES ERROR:", error);
    showAdminToast("Impossible de charger les categories.", "error");
  }

  if (!categories.length) {
    const hint = document.getElementById("service-category-hint");

    if (hint) {
      hint.textContent = "Aucune categorie trouvee. Creez-en d'abord dans Admin > Categories.";
    }
  }

  titleInput?.addEventListener("input", () => {
    if (!slugInput || serviceId) {
      return;
    }

    slugInput.value = generateSlug(titleInput.value);
  });

  if (serviceId) {
    try {
      const { getDocument } = await import("../../firebase/firestore.js");
      const service = await getDocument(COLLECTIONS.SERVICES, serviceId);

      if (!service) {
        showAdminToast("Service introuvable.", "error");
        return;
      }

      if (titleInput) {
        titleInput.value = sanitizeText(service.title || "");
      }

      if (slugInput) {
        slugInput.value = sanitizeText(service.slug || "");
      }

      if (priceInput) {
        priceInput.value = String(service.basePrice ?? "");
      }

      if (activeInput) {
        activeInput.checked = service.active !== false;
      }

      fillCategorySelect(categorySelect, categories, {
        selectedValue: sanitizeText(service.category || "")
      });

      if (groupSelect) {
        groupSelect.value = sanitizeText(
          service.serviceGroup || service.group || SERVICE_GROUPS.IMEI
        );
      }

      if (pageTitle) {
        pageTitle.textContent = "Modifier le service";
      }

      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = sanitizeText(service.title || "Modifier");
      }
    } catch (error) {
      console.error("SERVICE EDITOR LOAD ERROR:", error);
      showAdminToast("Impossible de charger ce service.", "error");
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = sanitizeText(titleInput?.value || "");
    const slug = sanitizeText(slugInput?.value || generateSlug(title));
    const basePrice = Number(priceInput?.value || 0);
    const category = sanitizeText(categorySelect?.value || "");
    const serviceGroup = sanitizeText(groupSelect?.value || SERVICE_GROUPS.IMEI);
    const active = Boolean(activeInput?.checked);

    const payload = {
      title,
      slug,
      basePrice,
      category,
      serviceGroup,
      active
    };

    if (!validateService(payload)) {
      showAdminToast("Verifiez le titre, le slug et le prix.", "error");
      return;
    }

    if (!category) {
      showAdminToast("Selectionnez une categorie.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const { setDocument, createDocument } = await import("../../firebase/firestore.js");

      if (serviceId) {
        await setDocument(COLLECTIONS.SERVICES, serviceId, payload);
        showAdminToast("Service mis a jour.", "success");
      } else {
        await createDocument(COLLECTIONS.SERVICES, payload);
        showAdminToast("Service cree.", "success");
      }

      window.setTimeout(() => {
        window.location.href = resolvePath(ROUTES.admin.services);
      }, 600);
    } catch (error) {
      console.error("SERVICE SAVE ERROR:", error);
      showAdminToast("Impossible d'enregistrer le service.", "error");

      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}
