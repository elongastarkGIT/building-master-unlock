// /js/auth/session.js

import {
  listenAuth,
  logoutUser,
  getCurrentUser,
  getCurrentUserData
} from "../../firebase/auth.js";

import {
  setUser,
  clearUser
} from "../core/state.js";

let activeSession = null;
let authUnsubscribe = null;

/* =========================
   SYNC SESSION → STATE
========================= */
function applySession(session) {
  activeSession = session || null;

  if (session?.auth && session?.data) {
    setUser(session.auth, session.data);
    return;
  }

  clearUser();
}

/* =========================
   INIT SESSION
========================= */
function initSession() {
  return new Promise((resolve) => {
    let settled = false;

    authUnsubscribe = listenAuth((session) => {
      applySession(session);

      if (!settled) {
        settled = true;
        resolve(activeSession);
      }
    });
  });
}

/* =========================
   LISTEN SESSION
========================= */
function listenSession(callback) {
  if (typeof callback !== "function") {
    return () => {};
  }

  return listenAuth((session) => {
    applySession(session);
    callback(session);
  });
}

/* =========================
   GETTERS
========================= */
function getSession() {
  return activeSession;
}

function getSessionUser() {
  return getCurrentUser();
}

function getSessionUserData() {
  return getCurrentUserData();
}

/* =========================
   LOGOUT
========================= */
async function logoutSession() {
  await logoutUser();
  applySession(null);
}

/* =========================
   DESTROY LISTENER
========================= */
function destroySession() {
  if (typeof authUnsubscribe === "function") {
    authUnsubscribe();
    authUnsubscribe = null;
  }

  activeSession = null;
}

/* =========================
   EXPORT
========================= */
export {
  initSession,
  listenSession,
  getSession,
  getSessionUser,
  getSessionUserData,
  logoutSession,
  destroySession
};
