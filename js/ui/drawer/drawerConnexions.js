// /js/ui/drawer/drawerConnexions.js

export function buildConnexionsSection() {
  const wrap = document.createElement("div");
  wrap.className = "mobile-nav-auth-actions";
  wrap.id = "mobile-nav-auth-actions";

  const loginLink = document.createElement("a");
  loginLink.href = "./login.html";
  loginLink.id = "mobile-nav-login";
  loginLink.className = "mobile-nav-auth-login";
  loginLink.setAttribute("data-link", "");
  loginLink.textContent = "Connexion";

  const registerLink = document.createElement("a");
  registerLink.href = "./register.html";
  registerLink.id = "mobile-nav-register";
  registerLink.className = "mobile-nav-auth-register";
  registerLink.setAttribute("data-link", "");
  registerLink.textContent = "Inscription";

  wrap.appendChild(loginLink);
  wrap.appendChild(registerLink);

  return wrap;
}
