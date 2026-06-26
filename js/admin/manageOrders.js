// /js/admin/manageOrders.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { formatCurrency, formatOrderStatus } from "../../utils/formatters.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function renderOrdersTable(orders) {
  const tbody = document.getElementById("admin-orders-body");

  if (!tbody) {
    return;
  }

  if (!orders.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-orders-empty", true);
    return;
  }

  toggleEmptyState("admin-orders-empty", false);

  const fragment = document.createDocumentFragment();

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.id = `admin-order-row-${order.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = sanitizeText(order.orderNumber || truncateId(order.id));

    const serviceCell = document.createElement("td");
    serviceCell.textContent = truncateId(order.serviceId, 12);

    const userCell = document.createElement("td");
    userCell.textContent = sanitizeText(
      order.client?.name || order.client?.email || truncateId(order.client?.uid, 10)
    );

    const amountCell = document.createElement("td");
    const amount = typeof order.amount === "number" ? order.amount : Number(order.amount);
    const currency = sanitizeText(order.currency || "USD");
    amountCell.textContent = Number.isFinite(amount) ? formatCurrency(amount, currency) : "—";

    const statusCell = document.createElement("td");
    statusCell.textContent = formatOrderStatus(order.status || "pending");

    const processingCell = document.createElement("td");
    processingCell.textContent = sanitizeText(order.processingStatus || "waiting");

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(order.createdAt);

    const actionsCell = document.createElement("td");
    const viewLink = document.createElement("a");
    viewLink.href = `./order-details.html?id=${encodeURIComponent(order.id)}`;
    viewLink.className = "btn btn-ghost btn-sm";
    viewLink.id = `admin-order-view-${order.id}`;
    viewLink.textContent = "Voir";
    viewLink.setAttribute("data-link", "");
    actionsCell.appendChild(viewLink);

    row.appendChild(idCell);
    row.appendChild(serviceCell);
    row.appendChild(userCell);
    row.appendChild(amountCell);
    row.appendChild(statusCell);
    row.appendChild(processingCell);
    row.appendChild(dateCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminOrders() {
  const table = document.getElementById("admin-orders-table");

  if (!table) {
    return;
  }

  let allOrders = [];
  let statusFilter = "";
  let processingFilter = "";

  const applyFilters = () => {
    const filteredOrders = allOrders
      .filter((order) => {
        if (statusFilter && order.status !== statusFilter) {
          return false;
        }

        if (processingFilter && order.processingStatus !== processingFilter) {
          return false;
        }

        return true;
      })
      .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt));

    renderOrdersTable(filteredOrders);
  };

  const statusSelect = document.getElementById("admin-orders-filter-status");
  const processingSelect = document.getElementById("admin-orders-filter-processing");
  const filterButton = document.getElementById("admin-orders-filter-apply");
  const resetButton = document.getElementById("admin-orders-filter-reset");

  filterButton?.addEventListener("click", () => {
    statusFilter = sanitizeText(statusSelect?.value || "");
    processingFilter = sanitizeText(processingSelect?.value || "");
    applyFilters();
  });

  resetButton?.addEventListener("click", () => {
    statusFilter = "";
    processingFilter = "";

    if (statusSelect) {
      statusSelect.value = "";
    }

    if (processingSelect) {
      processingSelect.value = "";
    }

    applyFilters();
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.ORDERS, (orders) => {
      allOrders = orders;
      applyFilters();
    });
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);
    showAdminToast("Impossible de charger les commandes.", "error");
  }
}
