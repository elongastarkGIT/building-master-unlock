// /js/admin/managePayments.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { formatCurrency, formatPaymentStatus } from "../../utils/formatters.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function renderPaymentsTable(payments) {
  const tbody = document.getElementById("admin-payments-body");

  if (!tbody) {
    return;
  }

  if (!payments.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-payments-empty", true);
    return;
  }

  toggleEmptyState("admin-payments-empty", false);

  const fragment = document.createDocumentFragment();

  payments.forEach((payment) => {
    const row = document.createElement("tr");
    row.id = `admin-payment-row-${payment.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = truncateId(payment.id, 10);

    const orderCell = document.createElement("td");
    orderCell.textContent = truncateId(payment.orderId || payment.orderDraftId, 12);

    const amountCell = document.createElement("td");
    const amount = typeof payment.amount === "number" ? payment.amount : Number(payment.amount);
    const currency = sanitizeText(payment.currency || "USD");
    amountCell.textContent = Number.isFinite(amount) ? formatCurrency(amount, currency) : "—";

    const methodCell = document.createElement("td");
    methodCell.textContent = sanitizeText(payment.paymentMethod || payment.method || "—");

    const providerCell = document.createElement("td");
    providerCell.textContent = sanitizeText(payment.provider || "—");

    const statusCell = document.createElement("td");
    statusCell.textContent = formatPaymentStatus(payment.status || "pending");

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(payment.createdAt);

    row.appendChild(idCell);
    row.appendChild(orderCell);
    row.appendChild(amountCell);
    row.appendChild(methodCell);
    row.appendChild(providerCell);
    row.appendChild(statusCell);
    row.appendChild(dateCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminPayments() {
  const table = document.getElementById("admin-payments-table");

  if (!table) {
    return;
  }

  let allPayments = [];
  let statusFilter = "";
  let methodFilter = "";

  const applyFilters = () => {
    const filteredPayments = allPayments
      .filter((payment) => {
        const method = payment.paymentMethod || payment.method || "";

        if (statusFilter && payment.status !== statusFilter) {
          return false;
        }

        if (methodFilter && method !== methodFilter) {
          return false;
        }

        return true;
      })
      .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt));

    renderPaymentsTable(filteredPayments);
  };

  const statusSelect = document.getElementById("admin-payments-filter-status");
  const methodSelect = document.getElementById("admin-payments-filter-method");
  const filterButton = document.getElementById("admin-payments-filter-apply");

  filterButton?.addEventListener("click", () => {
    statusFilter = sanitizeText(statusSelect?.value || "");
    methodFilter = sanitizeText(methodSelect?.value || "");
    applyFilters();
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.PAYMENTS, (payments) => {
      allPayments = payments;
      applyFilters();
    });
  } catch (error) {
    console.error("ADMIN PAYMENTS ERROR:", error);
    showAdminToast("Impossible de charger les paiements.", "error");
  }
}
