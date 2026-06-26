// /js/admin/analytics.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState
} from "./adminHelpers.js";

const REPORT_TYPE_LABELS = {
  orders: "Commandes",
  payments: "Paiements",
  users: "Utilisateurs",
  revenue: "Revenus"
};

function isWithinPeriod(value, dateFrom, dateTo) {
  const timestamp = getTimestampMs(value);

  if (!timestamp) {
    return true;
  }

  if (dateFrom) {
    const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();

    if (timestamp < fromMs) {
      return false;
    }
  }

  if (dateTo) {
    const toMs = new Date(`${dateTo}T23:59:59`).getTime();

    if (timestamp > toMs) {
      return false;
    }
  }

  return true;
}

function rowsToCsv(rows) {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function buildReportRows(type, dateFrom, dateTo) {
  const { getCollection } = await import("../../firebase/firestore.js");

  if (type === "users") {
    const users = await getCollection(COLLECTIONS.USERS);
    const filtered = users.filter((user) => isWithinPeriod(user.createdAt, dateFrom, dateTo));

    return {
      headers: ["UID", "Email", "Nom", "Statut", "Commandes", "Date"],
      rows: filtered.map((user) => [
        user.id,
        user.email || "",
        user.fullName || "",
        user.status || "",
        user.totalOrders ?? 0,
        formatFirestoreDate(user.createdAt)
      ])
    };
  }

  if (type === "payments" || type === "revenue") {
    const payments = await getCollection(COLLECTIONS.PAYMENTS);
    const filtered = payments.filter((payment) => {
      if (!isWithinPeriod(payment.createdAt, dateFrom, dateTo)) {
        return false;
      }

      if (type === "revenue") {
        return payment.status === "success";
      }

      return true;
    });

    return {
      headers: ["ID", "Commande", "Montant", "Devise", "Statut", "Methode", "Date"],
      rows: filtered.map((payment) => [
        payment.id,
        payment.orderId || payment.orderDraftId || "",
        payment.amount ?? 0,
        payment.currency || "USD",
        payment.status || "",
        payment.paymentMethod || payment.method || "",
        formatFirestoreDate(payment.createdAt)
      ])
    };
  }

  const orders = await getCollection(COLLECTIONS.ORDERS);
  const filtered = orders.filter((order) => isWithinPeriod(order.createdAt, dateFrom, dateTo));

  return {
    headers: ["ID", "Service", "Client", "Montant", "Statut", "Traitement", "Date"],
    rows: filtered.map((order) => [
      order.orderNumber || order.id,
      order.serviceId || "",
      order.client?.email || order.client?.name || "",
      order.amount ?? 0,
      order.status || "",
      order.processingStatus || "",
      formatFirestoreDate(order.createdAt)
    ])
  };
}

function renderReportsTable(reports) {
  const tbody = document.getElementById("admin-reports-body");

  if (!tbody) {
    return;
  }

  if (!reports.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-reports-empty", true);
    return;
  }

  toggleEmptyState("admin-reports-empty", false);

  const fragment = document.createDocumentFragment();

  reports
    .slice()
    .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt))
    .forEach((report) => {
      const row = document.createElement("tr");
      row.id = `admin-report-row-${report.id}`;

      const typeCell = document.createElement("td");
      typeCell.textContent = REPORT_TYPE_LABELS[report.type] || sanitizeText(report.type || "—");

      const formatCell = document.createElement("td");
      formatCell.textContent = sanitizeText(report.format || "csv").toUpperCase();

      const periodCell = document.createElement("td");
      periodCell.textContent = sanitizeText(report.period || "—");

      const dateCell = document.createElement("td");
      dateCell.textContent = formatFirestoreDate(report.createdAt);

      const actionsCell = document.createElement("td");
      const statusLabel = document.createElement("span");
      statusLabel.className = "badge badge-neutral";
      statusLabel.textContent = sanitizeText(report.status || "generated");
      actionsCell.appendChild(statusLabel);

      row.appendChild(typeCell);
      row.appendChild(formatCell);
      row.appendChild(periodCell);
      row.appendChild(dateCell);
      row.appendChild(actionsCell);

      fragment.appendChild(row);
    });

  tbody.replaceChildren(fragment);
}

export async function initAdminReports() {
  const form = document.getElementById("admin-reports-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const typeSelect = document.getElementById("reports-type");
    const formatSelect = document.getElementById("reports-format");
    const dateFromInput = document.getElementById("reports-date-from");
    const dateToInput = document.getElementById("reports-date-to");
    const submitButton = document.getElementById("reports-generate-submit");

    const type = sanitizeText(typeSelect?.value || "");
    const format = sanitizeText(formatSelect?.value || "csv");
    const dateFrom = sanitizeText(dateFromInput?.value || "");
    const dateTo = sanitizeText(dateToInput?.value || "");

    if (!type) {
      showAdminToast("Selectionnez un type de rapport.", "error");
      return;
    }

    if (format !== "csv") {
      showAdminToast("Seul le format CSV est disponible pour le moment.", "warning");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const reportData = await buildReportRows(type, dateFrom, dateTo);
      const csvContent = rowsToCsv([reportData.headers, ...reportData.rows]);
      const filename = `master-unlocker-${type}-${Date.now()}.csv`;
      downloadCsv(filename, csvContent);

      const period = dateFrom && dateTo ? `${dateFrom} → ${dateTo}` : "Toute periode";
      const { createDocument } = await import("../../firebase/firestore.js");

      await createDocument(COLLECTIONS.REPORTS, {
        type,
        format: "csv",
        period,
        status: "generated",
        rowCount: reportData.rows.length
      });

      showAdminToast("Rapport CSV genere.", "success");
    } catch (error) {
      console.error("ADMIN REPORTS GENERATE ERROR:", error);
      showAdminToast("Impossible de generer le rapport.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.REPORTS, (reports) => {
      renderReportsTable(reports);
    });
  } catch (error) {
    console.error("ADMIN REPORTS ERROR:", error);
    showAdminToast("Impossible de charger les rapports.", "error");
  }
}
