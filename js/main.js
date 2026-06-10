import { initCore } from "./core/app.js";
import { initRouter, setActiveLinks } from "./core/router.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initCore();

    initRouter();

    setActiveLinks();

    window.addEventListener("popstate", setActiveLinks);

  } catch (e) {
    console.error("INIT ERROR:", e);
  }
});