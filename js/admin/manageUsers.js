// /js/admin/manageUsers.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { formatUserStatus } from "../../utils/formatters.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function matchesSearch(user, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    user.fullName,
    user.email,
    user.phone,
    user.uid,
    user.id
  ]
    .map((value) => sanitizeText(value || "").toLowerCase())
    .join(" ");

  return haystack.includes(query);
}

function renderUsersTable(users) {
  const tbody = document.getElementById("admin-users-body");

  if (!tbody) {
    return;
  }

  if (!users.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-users-empty", true);
    return;
  }

  toggleEmptyState("admin-users-empty", false);

  const fragment = document.createDocumentFragment();

  users.forEach((user) => {
    const row = document.createElement("tr");
    row.id = `admin-user-row-${user.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = truncateId(user.id, 10);

    const emailCell = document.createElement("td");
    emailCell.textContent = sanitizeText(user.email || "—");

    const nameCell = document.createElement("td");
    nameCell.textContent = sanitizeText(user.fullName || "—");

    const statusCell = document.createElement("td");
    statusCell.textContent = formatUserStatus(user.status || "active");

    const ordersCell = document.createElement("td");
    const totalOrders = typeof user.totalOrders === "number" ? user.totalOrders : 0;
    ordersCell.textContent = String(totalOrders);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(user.createdAt);

    const actionsCell = document.createElement("td");
    const viewLink = document.createElement("a");
    viewLink.href = `./users.html#${encodeURIComponent(user.id)}`;
    viewLink.className = "btn btn-ghost btn-sm";
    viewLink.id = `admin-user-view-${user.id}`;
    viewLink.textContent = "Voir";
    viewLink.setAttribute("data-link", "");
    actionsCell.appendChild(viewLink);

    row.appendChild(idCell);
    row.appendChild(emailCell);
    row.appendChild(nameCell);
    row.appendChild(statusCell);
    row.appendChild(ordersCell);
    row.appendChild(dateCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminUsers() {
  const table = document.getElementById("admin-users-table");

  if (!table) {
    return;
  }

  let allUsers = [];
  let searchQuery = "";
  let statusFilter = "";

  const applyFilters = () => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    const filteredUsers = allUsers
      .filter((user) => {
        if (statusFilter && user.status !== statusFilter) {
          return false;
        }

        return matchesSearch(user, normalizedQuery);
      })
      .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt));

    renderUsersTable(filteredUsers);
  };

  const searchInput = document.getElementById("admin-users-search");
  const statusSelect = document.getElementById("admin-users-filter-status");
  const filterButton = document.getElementById("admin-users-filter-apply");

  searchInput?.addEventListener("input", () => {
    searchQuery = sanitizeText(searchInput.value || "");
    applyFilters();
  });

  filterButton?.addEventListener("click", () => {
    statusFilter = sanitizeText(statusSelect?.value || "");
    applyFilters();
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.USERS, (users) => {
      allUsers = users;
      applyFilters();
    });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    showAdminToast("Impossible de charger les utilisateurs.", "error");
  }
}
