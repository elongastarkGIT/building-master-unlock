// /utils/sanitizer.js
/* =========================
   STRING BASIC CLEAN
========================= */
function sanitizeString(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/</g, "")
    .replace(/>/g, "")
    .trim();
}

/* =========================
   REMOVE SCRIPT DANGER
========================= */
function stripScripts(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=".*?"/gi, "");
}

/* =========================
   SAFE HTML (light)
========================= */
function sanitizeHTML(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =========================
   EMAIL SAFE NORMALIZE
========================= */
function sanitizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/* =========================
   PHONE CLEAN
========================= */
function sanitizePhone(phone) {
  if (typeof phone !== "string") return "";
  return phone.replace(/[^0-9+]/g, "");
}

/* =========================
   TEXT FIELD SAFE (GENERAL)
========================= */
function sanitizeText(value) {
  if (typeof value !== "string") return "";

  return stripScripts(value)
    .replace(/[<>]/g, "")
    .trim();
}

/* =========================
   OBJECT SANITIZER (Firestore safe)
========================= */
function sanitizeObject(obj = {}) {
  const clean = {};

  for (const key in obj) {
    const value = obj[key];

    if (typeof value === "string") {
      clean[key] = sanitizeText(value);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

/* =========================
   FILE NAME CLEAN
========================= */
function sanitizeFileName(name) {
  if (typeof name !== "string") return "";

  return name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .trim();
}

/* =========================
   EXPORT
========================= */
export {
  sanitizeString,
  sanitizeText,
  sanitizeHTML,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  sanitizeFileName
};
