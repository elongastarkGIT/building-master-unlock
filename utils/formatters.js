// /utils/formatters.js

/* =========================
   CURRENCY FORMATTER
========================= */
function formatCurrency(amount, currency = "USD") {
  if (typeof amount !== "number") return "0";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(amount);
}

/* =========================
   DATE FORMATTER (DD/MM/YYYY)
========================= */
function formatDate(date) {
  if (!date) return "";

  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
}

/* =========================
   STATUS LABELS (UI)
========================= */
function formatOrderStatus(status) {
  const map = {
    pending: "En attente",
    paid: "Payé",
    processing: "Traitement",
    completed: "Terminé",
    failed: "Échoué",
    refunded: "Remboursé"
  };

  return map[status] || status;
}

function formatPaymentStatus(status) {
  const map = {
    pending: "En attente",
    success: "Réussi",
    failed: "Échoué",
    cancelled: "Annulé"
  };

  return map[status] || status;
}

function formatUserStatus(status) {
  const map = {
    active: "Actif",
    suspended: "Suspendu",
    banned: "Banni",
    pending: "En attente"
  };

  return map[status] || status;
}

/* =========================
   EXPORT
========================= */
export {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  formatPaymentStatus,
  formatUserStatus
};