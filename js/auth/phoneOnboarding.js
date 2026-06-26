// /js/auth/phoneOnboarding.js

import { waitForSession } from "./session.js";
import { COLLECTIONS, ADMIN_ROLES } from "../core/constants.js";
import { sanitizePhone, sanitizeText } from "../../utils/sanitizer.js";
import { isPhone } from "../../utils/validators.js";

let modalVisible = false;

function isAdminRole(role) {
  return Object.values(ADMIN_ROLES).includes(role);
}

function needsPhoneCapture(session) {
  if (!session?.auth?.uid || !session?.data) {
    return false;
  }

  if (isAdminRole(session.data.role)) {
    return false;
  }

  const phone = sanitizeText(session.data.phone || "");
  return !isPhone(phone);
}

function showFormError(errorEl, message) {
  if (!errorEl) {
    return;
  }

  errorEl.textContent = sanitizeText(message);
  errorEl.hidden = false;
}

function clearFormError(errorEl) {
  if (!errorEl) {
    return;
  }

  errorEl.textContent = "";
  errorEl.hidden = true;
}

function renderPhoneModal(modalRoot, session, onSuccess) {
  modalRoot.replaceChildren();

  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop modal-backdrop-blocking";
  backdrop.id = "phone-onboarding-backdrop";
  backdrop.setAttribute("role", "presentation");

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = "phone-onboarding-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "phone-onboarding-title");

  const header = document.createElement("div");
  header.className = "modal-header";
  header.id = "phone-onboarding-header";

  const title = document.createElement("h2");
  title.className = "modal-title";
  title.id = "phone-onboarding-title";
  title.textContent = "Compléter votre profil";

  header.appendChild(title);

  const body = document.createElement("div");
  body.className = "modal-body";
  body.id = "phone-onboarding-body";

  const intro = document.createElement("p");
  intro.className = "text-muted";
  intro.id = "phone-onboarding-intro";
  intro.textContent = "Ajoutez votre numéro de téléphone pour recevoir les notifications de commande et le support client.";

  const form = document.createElement("form");
  form.id = "phone-onboarding-form";
  form.setAttribute("novalidate", "");

  const group = document.createElement("div");
  group.className = "form-group";
  group.id = "phone-onboarding-group";

  const label = document.createElement("label");
  label.className = "form-label";
  label.id = "phone-onboarding-label";
  label.setAttribute("for", "phone-onboarding-input");
  label.textContent = "Téléphone";

  const input = document.createElement("input");
  input.type = "tel";
  input.id = "phone-onboarding-input";
  input.name = "phone";
  input.className = "form-input";
  input.placeholder = "+243 XXX XXX XXX";
  input.autocomplete = "tel";
  input.required = true;

  const hint = document.createElement("p");
  hint.className = "form-hint";
  hint.id = "phone-onboarding-hint";
  hint.textContent = "Format international recommandé, 7 à 15 chiffres.";

  const error = document.createElement("p");
  error.className = "form-error";
  error.id = "phone-onboarding-error";
  error.setAttribute("role", "alert");
  error.hidden = true;

  group.appendChild(label);
  group.appendChild(input);
  group.appendChild(hint);

  const footer = document.createElement("div");
  footer.className = "modal-footer";
  footer.id = "phone-onboarding-footer";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "btn btn-primary";
  submit.id = "phone-onboarding-submit";
  submit.textContent = "Enregistrer";

  footer.appendChild(submit);

  form.appendChild(group);
  form.appendChild(error);
  form.appendChild(footer);

  body.appendChild(intro);
  body.appendChild(form);

  modal.appendChild(header);
  modal.appendChild(body);

  backdrop.appendChild(modal);
  modalRoot.appendChild(backdrop);

  document.body.classList.add("modal-open");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFormError(error);

    const cleanPhone = sanitizePhone(input.value);

    if (!isPhone(cleanPhone)) {
      showFormError(error, "Numéro de téléphone invalide.");
      return;
    }

    submit.disabled = true;

    try {
      const { updateDocument } = await import("../../firebase/firestore.js");
      const { refreshCurrentUserData } = await import("../../firebase/auth.js");

      await updateDocument(COLLECTIONS.USERS, session.auth.uid, {
        phone: cleanPhone,
        phoneVerified: false
      });

      await refreshCurrentUserData();
      modalVisible = false;
      modalRoot.replaceChildren();
      document.body.classList.remove("modal-open");
      onSuccess();
    } catch (saveError) {
      console.error("PHONE ONBOARDING ERROR:", saveError);
      showFormError(error, "Impossible d'enregistrer le numéro. Réessayez.");
      submit.disabled = false;
    }
  });

  input.focus();
}

function tryShowPhoneModal(modalRoot, session) {
  if (modalVisible || !needsPhoneCapture(session)) {
    return;
  }

  modalVisible = true;

  renderPhoneModal(modalRoot, session, () => {
    const event = new CustomEvent("phone-onboarding-complete");
    document.dispatchEvent(event);
  });
}

export async function initPhoneOnboarding() {
  if (!document.body.classList.contains("page-dashboard")) {
    return;
  }

  const modalRoot = document.getElementById("modal-root");

  if (!modalRoot) {
    return;
  }

  const session = await waitForSession();
  tryShowPhoneModal(modalRoot, session);
}
