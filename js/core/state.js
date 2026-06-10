// /js/core/state.js

import { APP_CONFIG, STORAGE_KEYS } from "./constants.js";
import {
  getLocal,
  setLocal,
  removeLocal
} from "../../utils/storage.js";

/* =========================
   GLOBAL STATE
========================= */

const state = {
  user: null,
  profile: null,

  ui: {
    loading: false,
    modal: null,
    sidebarOpen: false,
    toast: null
  },

  orderDraft: null,

  app: {
    language: APP_CONFIG.defaultLanguage,
    currency: APP_CONFIG.defaultCurrency,
    theme: "dark"
  }
};

/* =========================
   LOAD FROM STORAGE
========================= */

function loadState() {
  const saved = getLocal(STORAGE_KEYS.USER);

  if (saved) {
    state.user = saved.user || null;
    state.profile = saved.profile || null;
  }

  const draft = getLocal(STORAGE_KEYS.ORDER_DRAFT);

  if (draft) {
    state.orderDraft = draft;
  }

  const app = getLocal(STORAGE_KEYS.APP_STATE);

  if (app) {
    state.app = {
      ...state.app,
      ...app
    };
  }
}

/* =========================
   SAVE STATE
========================= */

function saveUser() {
  setLocal(STORAGE_KEYS.USER, {
    user: state.user,
    profile: state.profile
  });
}

function saveOrderDraft() {
  if (state.orderDraft) {
    setLocal(STORAGE_KEYS.ORDER_DRAFT, state.orderDraft);
    return;
  }

  removeLocal(STORAGE_KEYS.ORDER_DRAFT);
}

function saveAppState() {
  setLocal(STORAGE_KEYS.APP_STATE, state.app);
}

/* =========================
   SETTERS
========================= */

function setUser(user, profile = null) {
  state.user = user;
  state.profile = profile;
  saveUser();
}

function clearUser() {
  state.user = null;
  state.profile = null;
  removeLocal(STORAGE_KEYS.USER);
}

function setLoading(value) {
  state.ui.loading = Boolean(value);
}

function setModal(value) {
  state.ui.modal = value;
}

function setSidebar(open) {
  state.ui.sidebarOpen = Boolean(open);
}

function setOrderDraft(draft) {
  state.orderDraft = draft;
  saveOrderDraft();
}

function updateApp(config) {
  state.app = {
    ...state.app,
    ...config
  };
  saveAppState();
}

/* =========================
   GETTERS
========================= */

function getState() {
  return state;
}

function getUser() {
  return state.user;
}

function getProfile() {
  return state.profile;
}

function getOrderDraft() {
  return state.orderDraft;
}

/* =========================
   INIT
========================= */

loadState();

/* =========================
   EXPORT
========================= */

export {
  state,

  setUser,
  clearUser,

  setLoading,
  setModal,
  setSidebar,

  setOrderDraft,
  updateApp,

  getState,
  getUser,
  getProfile,
  getOrderDraft
};
