// /utils/helpers.js

/* =========================
   SLEEP
========================= */
function sleep(ms = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/* =========================
   DEBOUNCE
========================= */
function debounce(callback, delay = 300) {

  let timeoutId = null;

  return (...args) => {

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

  };

}

/* =========================
   THROTTLE
========================= */
function throttle(callback, delay = 300) {

  let waiting = false;

  return (...args) => {

    if (waiting) {
      return;
    }

    callback(...args);

    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, delay);

  };

}

/* =========================
   RANDOM ID
========================= */
function randomId(length = 20) {

  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const values = new Uint32Array(length);

  crypto.getRandomValues(values);

  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[values[i] % chars.length];
  }

  return result;

}

/* =========================
   CAPITALIZE
========================= */
function capitalize(value = "") {

  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() +
    value.slice(1);

}

/* =========================
   TRUNCATE TEXT
========================= */
function truncate(value = "", max = 100) {

  const text = String(value);

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max)}...`;

}

/* =========================
   IS EMPTY
========================= */
function isEmpty(value) {

  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }

  return false;

}

/* =========================
   DEEP CLONE
========================= */
function deepClone(data) {

  return structuredClone(data);

}

/* =========================
   SAFE JSON PARSE
========================= */
function safeParseJSON(value, fallback = null) {

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }

}

/* =========================
   COPY TO CLIPBOARD
========================= */
async function copyToClipboard(value = "") {

  if (!navigator.clipboard) {
    return false;
  }

  await navigator.clipboard.writeText(
    String(value)
  );

  return true;

}

/* =========================
   DOWNLOAD FILE
========================= */
function downloadFile(url, filename = "download") {

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

}

/* =========================
   RETRY ASYNC
========================= */
async function retryAsync(
  callback,
  retries = 3,
  delay = 1000
) {

  let lastError = null;

  for (let i = 0; i < retries; i++) {

    try {

      return await callback();

    } catch (error) {

      lastError = error;

      if (i < retries - 1) {
        await sleep(delay);
      }

    }

  }

  throw lastError;

}

/* =========================
   EXPORTS
========================= */
export {
  sleep,

  debounce,
  throttle,

  randomId,

  capitalize,
  truncate,

  isEmpty,
  deepClone,

  safeParseJSON,

  copyToClipboard,
  downloadFile,

  retryAsync
};