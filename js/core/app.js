// /js/core/app.js

import { app } from "../../firebase/firebaseConfig.js";
import { initSession } from "../auth/session.js";
import { APP_CONFIG, ROUTES, resolvePath } from "./constants.js";

export async function initCore() {
  void app;

  if (APP_CONFIG.maintenanceMode) {
    window.location.href = resolvePath(ROUTES.public.maintenance);
    return false;
  }

  await initSession();

  return true;
}
