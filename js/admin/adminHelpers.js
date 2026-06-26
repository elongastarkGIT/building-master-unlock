// /js/admin/adminHelpers.js

import { sanitizeText } from "../../utils/sanitizer.js";
import { formatDate } from "../../utils/formatters.js";

export function showAdminToast(message, type = "info") {
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

export function toDateValue(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatFirestoreDate(value) {
  const date = toDateValue(value);
  return date ? formatDate(date) : "—";
}

export function getTimestampMs(value) {
  const date = toDateValue(value);
  return date ? date.getTime() : 0;
}

export function setTextContent(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = sanitizeText(String(value ?? "—"));
  }
}

export function toggleEmptyState(emptyId, isEmpty) {
  const emptyState = document.getElementById(emptyId);

  if (emptyState) {
    emptyState.hidden = !isEmpty;
  }
}

export function truncateId(id, length = 8) {
  const safeId = sanitizeText(id || "");

  if (safeId.length <= length) {
    return safeId || "—";
  }

  return `${safeId.slice(0, length)}…`;
}

export const ADMIN_ROLE_LABELS = {
  superadmin: "Superadmin",
  manager: "Manager",
  operator: "Operateur",
  support: "Support",
  user: "Client"
};
