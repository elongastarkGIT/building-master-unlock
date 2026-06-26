// /js/ui/drawer/drawerStaticLinks.js

const STATIC_DRAWER_LINKS = [
  { href: "./home.html", id: "mobile-nav-home", label: "Accueil" },
  { href: "./brands.html", id: "mobile-nav-brands", label: "Marques" },
  { href: "./tracking.html", id: "mobile-nav-tracking", label: "Suivi Commande" },
  { href: "./faq.html", id: "mobile-nav-faq", label: "FAQ" },
  { href: "./announcements.html", id: "mobile-nav-announcements", label: "Annonces" },
  { href: "./status.html", id: "mobile-nav-status", label: "Statut" },
  { href: "./contact.html", id: "mobile-nav-contact", label: "Contact" }
];

export function buildStaticLinksSection() {
  const wrap = document.createElement("div");
  wrap.className = "mobile-nav-static-links";
  wrap.id = "mobile-nav-static-links";

  STATIC_DRAWER_LINKS.forEach(({ href, id, label }) => {
    const link = document.createElement("a");
    link.href = href;
    link.id = id;
    link.textContent = label;
    link.setAttribute("data-link", "");
    wrap.appendChild(link);
  });

  return wrap;
}
