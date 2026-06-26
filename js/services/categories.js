// /js/services/categories.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeObject, sanitizeText } from "../../utils/sanitizer.js";
import { generateSlug } from "../../utils/generators.js";
import { isString } from "../../utils/validators.js";

function normalizeCategory(category) {
  const clean = sanitizeObject(category || {});
  const slug = sanitizeText(category?.slug || category?.id || "");

  return {
    id: sanitizeText(category?.id || slug),
    title: sanitizeText(clean.title || "Sans titre"),
    slug,
    description: sanitizeText(clean.description || ""),
    icon: sanitizeText(clean.icon || ""),
    active: category?.active !== false
  };
}

function isCategoryVisible(category) {
  return category?.active !== false;
}

async function loadCategories({ activeOnly = true } = {}) {
  const { getCollection } = await import("../../firebase/firestore.js");
  const categories = await getCollection(COLLECTIONS.SERVICE_CATEGORIES);

  return categories
    .map(normalizeCategory)
    .filter((item) => !activeOnly || isCategoryVisible(item))
    .sort((first, second) => first.title.localeCompare(second.title, "fr", { sensitivity: "base" }));
}

function fillCategorySelect(selectEl, categories, {
  selectedValue = "",
  placeholder = "Selectionner une categorie",
  includeAllOption = false,
  allLabel = "Toutes les categories"
} = {}) {
  if (!selectEl) {
    return;
  }

  selectEl.replaceChildren();

  if (includeAllOption) {
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = allLabel;
    selectEl.appendChild(allOption);
  } else {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = placeholder;
    selectEl.appendChild(defaultOption);
  }

  if (!categories.length) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "Aucune categorie disponible";
    emptyOption.disabled = true;
    selectEl.appendChild(emptyOption);
    return;
  }

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.slug;
    option.textContent = category.title;

    if (selectedValue && category.slug === selectedValue) {
      option.selected = true;
    }

    selectEl.appendChild(option);
  });
}

function getCategoryTitle(categories, slug) {
  const found = categories.find((category) => category.slug === slug);
  return found?.title || slug || "—";
}

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

function renderCategoriesTable(categories) {
  const tbody = document.getElementById("admin-categories-body");
  const emptyState = document.getElementById("admin-categories-empty");

  if (!tbody) {
    return;
  }

  if (!categories.length) {
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

  categories.forEach((category) => {
    const row = document.createElement("tr");
    row.id = `category-row-${category.id}`;

    const titleCell = document.createElement("td");
    titleCell.textContent = category.title;

    const slugCell = document.createElement("td");
    slugCell.textContent = category.slug;

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = category.description || "—";

    const activeCell = document.createElement("td");
    activeCell.textContent = category.active ? "Oui" : "Non";

    const actionsCell = document.createElement("td");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-ghost btn-sm";
    editButton.id = `category-edit-${category.id}`;
    editButton.textContent = "Modifier";
    editButton.dataset.categoryId = category.id;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "btn btn-ghost btn-sm";
    deleteButton.id = `category-delete-${category.id}`;
    deleteButton.textContent = "Supprimer";
    deleteButton.dataset.categoryId = category.id;

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);

    row.appendChild(titleCell);
    row.appendChild(slugCell);
    row.appendChild(descriptionCell);
    row.appendChild(activeCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminCategories() {
  const table = document.getElementById("admin-categories-table");

  if (!table) {
    return;
  }

  const form = document.getElementById("category-form");
  const formCard = document.getElementById("category-form-card");
  const addButton = document.getElementById("admin-add-category-btn");
  const cancelButton = document.getElementById("category-form-cancel");
  const titleInput = document.getElementById("category-title");
  const slugInput = document.getElementById("category-slug");
  const descriptionInput = document.getElementById("category-description");
  const activeInput = document.getElementById("category-active");
  const formError = document.getElementById("category-form-error");
  const formTitle = document.getElementById("category-form-title");

  let categories = [];
  let editingCategoryId = null;

  const refreshCategories = async () => {
    categories = await loadCategories({ activeOnly: false });
    renderCategoriesTable(categories);
  };

  const resetForm = () => {
    editingCategoryId = null;

    if (form) {
      form.reset();
    }

    if (activeInput) {
      activeInput.checked = true;
    }

    if (formTitle) {
      formTitle.textContent = "Nouvelle categorie";
    }

    if (formError) {
      formError.textContent = "";
      formError.hidden = true;
    }

    if (formCard) {
      formCard.hidden = true;
    }
  };

  const openCreateForm = () => {
    resetForm();

    if (formCard) {
      formCard.hidden = false;
    }

    titleInput?.focus();
  };

  const openEditForm = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) {
      return;
    }

    editingCategoryId = category.id;

    if (formTitle) {
      formTitle.textContent = "Modifier la categorie";
    }

    if (titleInput) {
      titleInput.value = category.title;
    }

    if (slugInput) {
      slugInput.value = category.slug;
    }

    if (descriptionInput) {
      descriptionInput.value = category.description;
    }

    if (activeInput) {
      activeInput.checked = category.active;
    }

    if (formError) {
      formError.textContent = "";
      formError.hidden = true;
    }

    if (formCard) {
      formCard.hidden = false;
    }
  };

  titleInput?.addEventListener("input", () => {
    if (!slugInput || editingCategoryId) {
      return;
    }

    slugInput.value = generateSlug(titleInput.value);
  });

  addButton?.addEventListener("click", openCreateForm);
  cancelButton?.addEventListener("click", resetForm);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = sanitizeText(titleInput?.value || "");
    const slug = sanitizeText(slugInput?.value || generateSlug(title));
    const description = sanitizeText(descriptionInput?.value || "");
    const active = Boolean(activeInput?.checked);

    if (!isString(title) || !isString(slug)) {
      if (formError) {
        formError.textContent = "Le titre et le slug sont obligatoires.";
        formError.hidden = false;
      }
      return;
    }

    const submitButton = document.getElementById("category-form-submit");

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const { setDocument, deleteDocument } = await import("../../firebase/firestore.js");
      const categoryId = editingCategoryId || slug;
      const payload = {
        title,
        slug,
        description,
        active
      };

      if (editingCategoryId && editingCategoryId !== slug) {
        await deleteDocument(COLLECTIONS.SERVICE_CATEGORIES, editingCategoryId);
      }

      await setDocument(COLLECTIONS.SERVICE_CATEGORIES, categoryId, payload);
      showAdminToast(editingCategoryId ? "Categorie mise a jour." : "Categorie creee.", "success");
      resetForm();
      await refreshCategories();
    } catch (error) {
      console.error("CATEGORY SAVE ERROR:", error);

      if (formError) {
        formError.textContent = "Impossible d'enregistrer la categorie.";
        formError.hidden = false;
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  document.getElementById("admin-categories-body")?.addEventListener("click", async (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const categoryId = target.dataset.categoryId;

    if (!categoryId) {
      return;
    }

    if (target.id.startsWith("category-edit-")) {
      openEditForm(categoryId);
      return;
    }

    if (!target.id.startsWith("category-delete-")) {
      return;
    }

    const confirmed = window.confirm("Supprimer cette categorie ?");

    if (!confirmed) {
      return;
    }

    try {
      const { deleteDocument } = await import("../../firebase/firestore.js");
      await deleteDocument(COLLECTIONS.SERVICE_CATEGORIES, categoryId);
      showAdminToast("Categorie supprimee.", "success");
      await refreshCategories();
    } catch (error) {
      console.error("CATEGORY DELETE ERROR:", error);
      showAdminToast("Impossible de supprimer la categorie.", "error");
    }
  });

  try {
    await refreshCategories();
  } catch (error) {
    console.error("CATEGORIES LOAD ERROR:", error);
    showAdminToast("Impossible de charger les categories.", "error");
  }
}

export {
  loadCategories,
  fillCategorySelect,
  normalizeCategory,
  getCategoryTitle,
  isCategoryVisible
};
