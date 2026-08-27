// /js/reviews/submitReview.js

import { COLLECTIONS, ROUTES } from "../core/constants.js";
import { waitForSession } from "../auth/session.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import { navigate } from "../core/router.js";

function showMessage(el, message, hidden = false) {
  if (!el) {
    return;
  }

  el.textContent = sanitizeText(message || "");
  el.hidden = hidden || !message;
}

function starsFromRating(rating) {
  const value = Math.max(1, Math.min(5, Number(rating) || 0));
  return "★".repeat(value) + "☆".repeat(5 - value);
}

export function formatReviewStars(rating) {
  return starsFromRating(rating);
}

export async function initReviewForm() {
  const form = document.getElementById("review-form");

  if (!form) {
    return;
  }

  const errorEl = document.getElementById("review-error");
  const successEl = document.getElementById("review-success");
  const submitBtn = document.getElementById("review-submit");
  const ratingSelect = document.getElementById("review-rating");
  const orderInput = document.getElementById("review-order-id");
  const commentInput = document.getElementById("review-comment");

  const session = await waitForSession();

  if (!session?.auth?.uid) {
    showMessage(errorEl, "Connexion requise pour laisser un avis.");
    if (submitBtn) {
      submitBtn.disabled = true;
    }

    window.setTimeout(() => {
      navigate(`${ROUTES.public.login}?redirect=reviews`);
    }, 1200);
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    showMessage(errorEl, "", true);
    if (successEl) {
      successEl.hidden = true;
    }

    const rating = Number(ratingSelect?.value || 0);
    const comment = sanitizeText(commentInput?.value || "");
    const orderId = sanitizeText(orderInput?.value || "");

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      showMessage(errorEl, "Choisissez une note entre 1 et 5.");
      return;
    }

    if (comment.length < 10) {
      showMessage(errorEl, "Le commentaire doit contenir au moins 10 caracteres.");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
    }

    try {
      const { createDocument } = await import("../../firebase/firestore.js");

      await createDocument(COLLECTIONS.REVIEWS, {
        uid: session.auth.uid,
        orderId,
        rating,
        comment,
        approved: false
      });

      form.reset();
      if (successEl) {
        successEl.hidden = false;
      }
    } catch (error) {
      console.error("REVIEW SUBMIT ERROR:", error);
      showMessage(errorEl, "Impossible d'envoyer l'avis. Reessayez.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });
}

export async function loadApprovedReviews(limitCount = 3) {
  try {
    const { getCollection } = await import("../../firebase/firestore.js");
    const reviews = await getCollection(COLLECTIONS.REVIEWS);

    return reviews
      .filter((review) => review.approved === true)
      .sort((a, b) => {
        const aMs = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const bMs = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return bMs - aMs;
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error("LOAD APPROVED REVIEWS ERROR:", error);
    return [];
  }
}
