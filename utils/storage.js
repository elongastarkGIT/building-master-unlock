// /utils/storage.js

/* =========================
   BROWSER CHECK
========================= */
function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

function hasSessionStorage() {
  try {
    return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
  } catch {
    return false;
  }
}

/* =========================
   LOCAL STORAGE
========================= */
function getLocal(key, fallback = null) {
  if (!hasLocalStorage() || typeof key !== "string" || !key) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setLocal(key, value) {
  if (!hasLocalStorage() || typeof key !== "string" || !key) {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeLocal(key) {
  if (!hasLocalStorage() || typeof key !== "string" || !key) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function clearLocalByPrefix(prefix = "") {
  if (!hasLocalStorage() || typeof prefix !== "string" || !prefix) {
    return false;
  }

  try {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    return true;
  } catch {
    return false;
  }
}

/* =========================
   SESSION STORAGE
========================= */
function getSession(key, fallback = null) {
  if (!hasSessionStorage() || typeof key !== "string" || !key) {
    return fallback;
  }

  try {
    const raw = sessionStorage.getItem(key);

    if (raw === null) {
      return fallback;
    }

    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setSession(key, value) {
  if (!hasSessionStorage() || typeof key !== "string" || !key) {
    return false;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeSession(key) {
  if (!hasSessionStorage() || typeof key !== "string" || !key) {
    return false;
  }

  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function clearSessionByPrefix(prefix = "") {
  if (!hasSessionStorage() || typeof prefix !== "string" || !prefix) {
    return false;
  }

  try {
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);

      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
    });

    return true;
  } catch {
    return false;
  }
}

/* =========================
   EXPORT
========================= */
export {
  getLocal,
  setLocal,
  removeLocal,
  clearLocalByPrefix,

  getSession,
  setSession,
  removeSession,
  clearSessionByPrefix
};
