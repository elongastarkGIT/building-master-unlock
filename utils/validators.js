// /utils/validators.js
/* =========================
   BASIC TYPES
========================= */
function isString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isNumber(v) {
  return typeof v === "number" && !isNaN(v);
}

function isBoolean(v) {
  return typeof v === "boolean";
}

/* =========================
   EMAIL / PHONE
========================= */
function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isPhone(phone) {
  return /^\+?[0-9]{7,15}$/.test(phone);
}

/* =========================
   USER VALIDATION
========================= */
function validateUser(user) {
  if (!isString(user.fullName)) return false;
  if (!isEmail(user.email)) return false;
  if (!isPhone(user.phone)) return false;

  const roles = ["user", "support", "operator", "manager", "superadmin"];
  const statuses = ["active", "suspended", "banned", "pending"];

  if (!roles.includes(user.role)) return false;
  if (!statuses.includes(user.status)) return false;

  return true;
}

/* =========================
   SERVICE VALIDATION
========================= */
function validateService(service) {
  if (!isString(service.title)) return false;
  if (!isString(service.slug)) return false;
  if (!isNumber(service.basePrice)) return false;

  if (service.basePrice < 0) return false;

  return true;
}

/* =========================
   ORDER VALIDATION
========================= */
function validateOrder(order) {
  if (!isString(order.serviceId)) return false;
  if (!isNumber(order.amount)) return false;

  const statuses = [
    "pending",
    "paid",
    "processing",
    "completed",
    "failed",
    "refunded"
  ];

  if (!statuses.includes(order.status)) return false;

  return true;
}

/* =========================
   PAYMENT VALIDATION
========================= */
function validatePayment(payment) {
  if (!isNumber(payment.amount)) return false;

  const statuses = ["pending", "success", "failed", "cancelled"];

  if (!statuses.includes(payment.status)) return false;

  return true;
}

/* =========================
   EXPORT
========================= */
export {
  isString,
  isNumber,
  isBoolean,

  isEmail,
  isPhone,

  validateUser,
  validateService,
  validateOrder,
  validatePayment
};