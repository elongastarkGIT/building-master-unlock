// /js/admin/adminDashboard.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { formatCurrency, formatOrderStatus } from "../../utils/formatters.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  setTextContent,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function sumSuccessfulPayments(payments) {
  return payments
    .filter((payment) => payment.status === "success")
    .reduce((total, payment) => {
      const amount = typeof payment.amount === "number" ? payment.amount : Number(payment.amount);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
}

function countOpenTickets(tickets) {
  return tickets.filter((ticket) => ticket.status === "open").length;
}

function renderRecentOrders(orders) {
  const tbody = document.getElementById("admin-recent-orders-body");

  if (!tbody) {
    return;
  }

  const recentOrders = orders
    .slice()
    .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt))
    .slice(0, 5);

  if (!recentOrders.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-recent-orders-empty", true);
    return;
  }

  toggleEmptyState("admin-recent-orders-empty", false);

  const fragment = document.createDocumentFragment();

  recentOrders.forEach((order) => {
    const row = document.createElement("tr");
    row.id = `recent-order-row-${order.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = sanitizeText(order.orderNumber || truncateId(order.id));

    const serviceCell = document.createElement("td");
    serviceCell.textContent = truncateId(order.serviceId, 12);

    const userCell = document.createElement("td");
    userCell.textContent = sanitizeText(
      order.client?.name || order.client?.email || truncateId(order.client?.uid, 10)
    );

    const statusCell = document.createElement("td");
    statusCell.textContent = formatOrderStatus(order.status || "pending");

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(order.createdAt);

    row.appendChild(idCell);
    row.appendChild(serviceCell);
    row.appendChild(userCell);
    row.appendChild(statusCell);
    row.appendChild(dateCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

function updateDashboardStats({ orders, users, payments, tickets }) {
  setTextContent("stat-orders-value", orders.length);
  setTextContent("stat-users-value", users.length);
  setTextContent("stat-revenue-value", formatCurrency(sumSuccessfulPayments(payments)));
  setTextContent("stat-tickets-value", countOpenTickets(tickets));
  renderRecentOrders(orders);
}

export async function initAdminDashboard() {
  const statsGrid = document.getElementById("admin-stats-grid");

  if (!statsGrid) {
    return;
  }

  const state = {
    orders: [],
    users: [],
    payments: [],
    tickets: []
  };

  const publish = () => {
    updateDashboardStats(state);
  };

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.ORDERS, (orders) => {
      state.orders = orders;
      publish();
    });

    listenCollection(COLLECTIONS.USERS, (users) => {
      state.users = users;
      publish();
    });

    listenCollection(COLLECTIONS.PAYMENTS, (payments) => {
      state.payments = payments;
      publish();
    });

    listenCollection(COLLECTIONS.TICKETS, (tickets) => {
      state.tickets = tickets;
      publish();
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    showAdminToast("Impossible de charger le dashboard admin.", "error");
  }
}
