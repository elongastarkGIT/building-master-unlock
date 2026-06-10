// /utils/generators.js

/* =========================
   RANDOM STRING
========================= */
function randomString(length = 6) {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const values = new Uint32Array(length);

  crypto.getRandomValues(values);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }

  return result;

}

/* =========================
   GENERATE SLUG
========================= */
function generateSlug(value = "") {

  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

}

/* =========================
   ORDER NUMBER
   ORD-2026-A8F29X
========================= */
function generateOrderNumber() {

  const year =
    new Date().getFullYear();

  const random =
    randomString(6);

  return `ORD-${year}-${random}`;

}

/* =========================
   PAYMENT REFERENCE
   PAY-2026-X8K29Q
========================= */
function generatePaymentReference() {

  const year =
    new Date().getFullYear();

  const random =
    randomString(6);

  return `PAY-${year}-${random}`;

}

/* =========================
   TRACKING CODE
   TRK-83KD92LQ
========================= */
function generateTrackingCode() {

  return `TRK-${randomString(8)}`;

}

/* =========================
   PUBLIC ID
========================= */
function generatePublicId(
  prefix = "ID"
) {

  return `${prefix}-${randomString(10)}`;

}

/* =========================
   DEVICE ID
========================= */
function generateDeviceId() {

  return `DEV-${randomString(12)}`;

}

/* =========================
   SESSION ID
========================= */
function generateSessionId() {

  return `SES-${randomString(16)}`;

}

/* =========================
   PROMO CODE
========================= */
function generatePromoCode(
  prefix = "PROMO"
) {

  return `${prefix}-${randomString(8)}`;

}

/* =========================
   LICENSE KEY
========================= */
function generateLicenseKey() {

  return [
    randomString(4),
    randomString(4),
    randomString(4),
    randomString(4)
  ].join("-");

}

/* =========================
   EXPORTS
========================= */
export {
  generateSlug,

  generateOrderNumber,
  generatePaymentReference,
  generateTrackingCode,

  generatePublicId,
  generateDeviceId,
  generateSessionId,

  generatePromoCode,
  generateLicenseKey
};