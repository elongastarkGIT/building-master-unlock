// /js/admin/manageTickets.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function formatTicketStatus(status) {
  const map = {
    open: "Ouvert",
    pending: "En attente",
    closed: "Ferme"
  };

  return map[status] || sanitizeText(status || "—");
}

function formatTicketPriority(priority) {
  const map = {
    low: "Basse",
    medium: "Moyenne",
    high: "Haute"
  };

  return map[priority] || sanitizeText(priority || "—");
}

function renderTicketsTable(tickets) {
  const tbody = document.getElementById("admin-tickets-body");

  if (!tbody) {
    return;
  }

  if (!tickets.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-tickets-empty", true);
    return;
  }

  toggleEmptyState("admin-tickets-empty", false);

  const fragment = document.createDocumentFragment();

  tickets.forEach((ticket) => {
    const row = document.createElement("tr");
    row.id = `admin-ticket-row-${ticket.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = truncateId(ticket.id, 10);

    const subjectCell = document.createElement("td");
    subjectCell.textContent = sanitizeText(ticket.subject || "—");

    const userCell = document.createElement("td");
    userCell.textContent = truncateId(ticket.uid, 10);

    const priorityCell = document.createElement("td");
    priorityCell.textContent = formatTicketPriority(ticket.priority);

    const statusCell = document.createElement("td");
    statusCell.textContent = formatTicketStatus(ticket.status);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(ticket.createdAt);

    const actionsCell = document.createElement("td");
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "btn btn-ghost btn-sm";
    viewButton.id = `admin-ticket-view-${ticket.id}`;
    viewButton.textContent = "Voir";
    viewButton.disabled = true;
    viewButton.title = "Detail ticket bientot disponible";
    actionsCell.appendChild(viewButton);

    row.appendChild(idCell);
    row.appendChild(subjectCell);
    row.appendChild(userCell);
    row.appendChild(priorityCell);
    row.appendChild(statusCell);
    row.appendChild(dateCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminTickets() {
  const table = document.getElementById("admin-tickets-table");

  if (!table) {
    return;
  }

  let allTickets = [];
  let priorityFilter = "";
  let statusFilter = "";

  const applyFilters = () => {
    const filteredTickets = allTickets
      .filter((ticket) => {
        if (priorityFilter && ticket.priority !== priorityFilter) {
          return false;
        }

        if (statusFilter && ticket.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt));

    renderTicketsTable(filteredTickets);
  };

  const prioritySelect = document.getElementById("admin-tickets-filter-priority");
  const statusSelect = document.getElementById("admin-tickets-filter-status");
  const filterButton = document.getElementById("admin-tickets-filter-apply");
  const resetButton = document.getElementById("admin-tickets-filter-reset");

  filterButton?.addEventListener("click", () => {
    priorityFilter = sanitizeText(prioritySelect?.value || "");
    statusFilter = sanitizeText(statusSelect?.value || "");
    applyFilters();
  });

  resetButton?.addEventListener("click", () => {
    priorityFilter = "";
    statusFilter = "";

    if (prioritySelect) {
      prioritySelect.value = "";
    }

    if (statusSelect) {
      statusSelect.value = "";
    }

    applyFilters();
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.TICKETS, (tickets) => {
      allTickets = tickets;
      applyFilters();
    });
  } catch (error) {
    console.error("ADMIN TICKETS ERROR:", error);
    showAdminToast("Impossible de charger les tickets.", "error");
  }
}
