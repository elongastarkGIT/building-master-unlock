// /js/core/app.js

import { app } from "../../firebase/firebaseConfig.js";
import { initSession } from "../auth/session.js";
import { APP_CONFIG } from "./constants.js";

export async function initCore() {
  void app;

  if (APP_CONFIG.maintenanceMode) {
    window.location.href = "/pages/maintenance.html";
    return false;
  }

  await initSession();

  return true;
}
