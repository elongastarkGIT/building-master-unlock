import { initCore } from "./core/app.js";
import { initRouter, setActiveLinks, fixAbsoluteLinks } from "./core/router.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    fixAbsoluteLinks();

    await initCore();

    initRouter();

    setActiveLinks();

    window.addEventListener("popstate", setActiveLinks);

  } catch (e) {
    console.error("INIT ERROR:", e);
  }
});