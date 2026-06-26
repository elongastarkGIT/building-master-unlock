// /js/core/constants.js

/* =========================
   APP CONFIG
========================= */

export const APP_CONFIG = {
  name: "MASTER UNLOCKER",
  version: "1.0.0",

  defaultCurrency: "USD",
  multiCurrency: true,

  defaultLanguage: "fr",

  dateFormat: "DD/MM/YYYY",

  paginationLimit: 20,

  maintenanceMode: false
};


/* =========================
   USER ROLES (FIRESTORE users.role)
========================= */

export const USER_ROLES = {
  USER: "user",
  SUPPORT: "support",
  OPERATOR: "operator",
  MANAGER: "manager",
  SUPERADMIN: "superadmin"
};

export const ADMIN_ROLES = {
  SUPPORT: "support",
  OPERATOR: "operator",
  MANAGER: "manager",
  SUPERADMIN: "superadmin"
};


/* =========================
   USER STATUS (users.status)
========================= */

export const USER_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  BANNED: "banned",
  PENDING: "pending"
};


/* =========================
   ORDER STATUS (orders.status)
========================= */

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded"
};

export const ORDER_PROCESSING_STATUS = {
  WAITING: "waiting",
  IN_PROGRESS: "in_progress",
  DONE: "done"
};


/* =========================
   PAYMENT STATUS (payments.status)
========================= */

export const PAYMENT_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled"
};


/* =========================
   NOTIFICATIONS TYPES
========================= */

export const NOTIFICATION_TYPES = {
  ORDER: "order",
  PAYMENT: "payment",
  SYSTEM: "system"
};


/* =========================
   TICKET SYSTEM
========================= */

export const TICKET_STATUS = {
  OPEN: "open",
  PENDING: "pending",
  CLOSED: "closed"
};

export const TICKET_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
};


/* =========================
   UPLOAD TYPES
========================= */

export const UPLOAD_TYPES = {
  PROOF: "proof",
  SCREENSHOT: "screenshot",
  RESULT: "result"
};


/* =========================
   PROVIDERS
========================= */

export const PAYMENT_PROVIDERS = {
  CINETPAY: "cinetpay",
  FLUTTERWAVE: "flutterwave"
};

export const PAYMENT_METHODS = {
  MOMO: "momo",
  CARD: "card"
};


/* =========================
   ROLES PERMISSIONS MAP
========================= */

export const ROLE_PERMISSIONS = {
  user: ["read_services", "create_order"],
  support: ["read_orders", "reply_tickets"],
  operator: ["process_orders"],
  manager: ["manage_all"],
  superadmin: ["all"]
};


/* =========================
   BASE PATH (GitHub Pages / sous-dossier)
========================= */

function detectBasePathFromPathname() {
  const path = window.location.pathname;
  const appRoots = ["/pages/", "/dashboard/", "/admin/"];

  for (const root of appRoots) {
    const idx = path.indexOf(root);
    if (idx > 0) {
      return path.slice(0, idx);
    }
  }

  if (path.endsWith("/index.html")) {
    const base = path.slice(0, -"/index.html".length);
    return base === "/" ? "" : base;
  }

  if (path.endsWith("/") && path.length > 1) {
    return path.slice(0, -1);
  }

  return "";
}

function detectBasePathFromScript() {
  const scripts = document.querySelectorAll("script[src]");

  for (const script of scripts) {
    const src = script.getAttribute("src");
    if (!src) continue;

    try {
      const url = new URL(src, window.location.href);
      const jsIdx = url.pathname.lastIndexOf("/js/");
      if (jsIdx > 0) {
        return url.pathname.slice(0, jsIdx);
      }
    } catch {
      continue;
    }
  }

  return "";
}

export function detectBasePath() {
  if (typeof window === "undefined") return "";
  return detectBasePathFromScript() || detectBasePathFromPathname();
}

export const BASE_PATH = detectBasePath();

export function resolvePath(path) {
  if (!path || typeof path !== "string") return path;
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}

export function stripBasePath(path) {
  if (!path || typeof path !== "string") return path;
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    const rest = path.slice(BASE_PATH.length);
    return rest || "/";
  }
  return path;
}


/* =========================
   ROUTES (HTML SPA HYBRID)
========================= */

export const ROUTES = {
  public: {
    home: "/pages/home.html",
    services: "/pages/services.html",
    serviceDetails: "/pages/service-details.html",
    login: "/pages/login.html",
    register: "/pages/register.html",
    forgotPassword: "/pages/forgot-password.html",
    checkout: "/pages/checkout.html",
    brands: "/pages/brands.html",
    brandDetails: "/pages/brand-details.html",
    faq: "/pages/faq.html",
    contact: "/pages/contact.html",
    announcements: "/pages/announcements.html",
    status: "/pages/status.html",
    tracking: "/pages/tracking.html",
    maintenance: "/pages/maintenance.html",
    notFound: "/pages/not-found.html"
  },

  user: {
    dashboard: "/dashboard/dashboard.html",
    orders: "/dashboard/orders.html",
    orderDetails: "/dashboard/order-details.html",
    profile: "/dashboard/profile.html",
    payments: "/dashboard/payments.html",
    notifications: "/dashboard/notifications.html",
    tickets: "/dashboard/tickets.html",
    licenses: "/dashboard/licenses.html",
    wallet: "/dashboard/wallet.html",
    settings: "/dashboard/settings.html",
    security: "/dashboard/security.html"
  },

  admin: {
    dashboard: "/admin/dashboard.html",
    orders: "/admin/orders.html",
    orderDetails: "/admin/order-details.html",
    users: "/admin/users.html",
    admins: "/admin/admins.html",
    services: "/admin/services.html",
    categories: "/admin/categories.html",
    serviceEditor: "/admin/service-editor.html",
    payments: "/admin/payments.html",
    tickets: "/admin/tickets.html",
    notifications: "/admin/notifications.html",
    promotions: "/admin/promotions.html",
    providers: "/admin/providers.html",
    reports: "/admin/reports.html",
    settings: "/admin/settings.html",
    status: "/admin/status.html",
    logs: "/admin/logs.html"
  }
};


/* =========================
   STORAGE KEYS (localStorage)
========================= */

export const STORAGE_KEYS = {
  USER: "es_user",
  TOKEN: "es_token",
  THEME: "es_theme",
  LANGUAGE: "es_lang",
  ORDER_DRAFT: "es_order_draft",
  APP_STATE: "es_app_state"
};


/* =========================
   FIRESTORE COLLECTIONS (SAFE MAP)
========================= */

export const COLLECTIONS = {
  USERS: "users",
  ADMINS: "admins",
  SERVICES: "services",
  SERVICE_CATEGORIES: "serviceCategories",
  BRANDS: "brands",
  TOOLS: "tools",
  ORDERS: "orders",
  ORDER_DRAFTS: "orderDrafts",
  PAYMENTS: "payments",
  NOTIFICATIONS: "notifications",
  TICKETS: "tickets",
  REVIEWS: "reviews",
  WALLETS: "wallets",
  TRANSACTIONS: "transactions",
  PROVIDERS: "providers",
  API_INTEGRATIONS: "apiIntegrations",
  TOOL_LICENSES: "toolLicenses",
  ANNOUNCEMENTS: "announcements",
  SETTINGS: "settings",
  LOGS: "logs",
  CURRENCIES: "currencies",
  COUNTRIES: "countries",
  PROMOTIONS: "promotions",
  RESELLERS: "resellers",
  UPLOADS: "uploads",
  REPORTS: "reports",
  SAVED_DEVICES: "savedDevices",
  FAQS: "faqs",
  STATUS_PAGES: "statusPages"
};