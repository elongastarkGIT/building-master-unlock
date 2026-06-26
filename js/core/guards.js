// /js/core/guards.js

import { USER_ROLES, USER_STATUS, ROUTES, resolvePath, ADMIN_ROLES } from "./constants.js";

/* =========================
   CHECK USER STATUS
========================= */
function isActiveUser(userData) {
  return userData && userData.status === USER_STATUS.ACTIVE;
}

/* =========================
   CHECK ROLE ACCESS
========================= */
function hasAccess(userData, allowedRoles = []) {
  if (!userData) return false;
  if (!allowedRoles.length) return true;
  return allowedRoles.includes(userData.role);
}

/* =========================
   REDIRECT SAFE
========================= */
function redirect(url) {
  window.location.href = resolvePath(url);
}

/* =========================
   GUARD PAGE
========================= */
export function guardPage({
  allowRoles = [],
  requireAuth = true,
  redirectTo = ROUTES.public.login
} = {}) {
  import("../auth/session.js").then(({ listenSession, logoutSession, getSession }) => {
    const evaluateAccess = async (session) => {
      if (!session && requireAuth) {
        redirect(redirectTo);
        return;
      }

      const userData = session?.data;

      if (requireAuth && !userData) {
        redirect(redirectTo);
        return;
      }

      if (!userData) {
        return;
      }

      if (!isActiveUser(userData)) {
        await logoutSession();
        redirect(ROUTES.public.login);
        return;
      }

      if (!hasAccess(userData, allowRoles)) {
        if (Object.values(ADMIN_ROLES).includes(userData.role)) {
          redirect(ROUTES.admin.dashboard);
          return;
        }

        redirect(ROUTES.public.notFound);
      }
    };

    const existingSession = getSession();

    if (existingSession) {
      evaluateAccess(existingSession);
    }

    listenSession((session) => {
      evaluateAccess(session);
    });
  });
}

/* =========================
   ADMIN ONLY GUARD
========================= */
export function adminGuard() {
  guardPage({
    allowRoles: [
      USER_ROLES.SUPERADMIN,
      USER_ROLES.MANAGER,
      USER_ROLES.OPERATOR,
      USER_ROLES.SUPPORT
    ],
    redirectTo: ROUTES.public.login
  });
}

/* =========================
   USER ONLY GUARD
========================= */
export function userGuard() {
  guardPage({
    allowRoles: [USER_ROLES.USER],
    redirectTo: ROUTES.public.login
  });
}
