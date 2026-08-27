// /js/admin/manageReviews.js

import { COLLECTIONS } from "../core/constants.js";
import { sanitizeText } from "../../utils/sanitizer.js";
import {
  formatFirestoreDate,
  getTimestampMs,
  showAdminToast,
  toggleEmptyState,
  truncateId
} from "./adminHelpers.js";

function formatApprovedStatus(approved) {
  if (approved === true) {
    return "Approuve";
  }

  return "En attente";
}

function renderStars(rating) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return `${"★".repeat(value)}${"☆".repeat(5 - value)} (${value})`;
}

function renderReviewsTable(reviews) {
  const tbody = document.getElementById("admin-reviews-body");

  if (!tbody) {
    return;
  }

  if (!reviews.length) {
    tbody.replaceChildren();
    toggleEmptyState("admin-reviews-empty", true);
    return;
  }

  toggleEmptyState("admin-reviews-empty", false);

  const fragment = document.createDocumentFragment();

  reviews.forEach((review) => {
    const row = document.createElement("tr");
    row.id = `admin-review-row-${review.id}`;

    const idCell = document.createElement("td");
    idCell.textContent = truncateId(review.id, 10);

    const userCell = document.createElement("td");
    userCell.textContent = truncateId(review.uid, 10);

    const ratingCell = document.createElement("td");
    ratingCell.textContent = renderStars(review.rating);

    const commentCell = document.createElement("td");
    const comment = sanitizeText(review.comment || "");
    commentCell.textContent = comment.length > 80 ? `${comment.slice(0, 80)}…` : comment;

    const orderCell = document.createElement("td");
    orderCell.textContent = review.orderId ? truncateId(review.orderId, 10) : "—";

    const statusCell = document.createElement("td");
    statusCell.textContent = formatApprovedStatus(review.approved);

    const dateCell = document.createElement("td");
    dateCell.textContent = formatFirestoreDate(review.createdAt);

    const actionsCell = document.createElement("td");
    actionsCell.className = "table-actions";

    const approveBtn = document.createElement("button");
    approveBtn.type = "button";
    approveBtn.className = "btn btn-primary btn-sm";
    approveBtn.id = `admin-review-approve-${review.id}`;
    approveBtn.textContent = "Approuver";
    approveBtn.disabled = review.approved === true;
    approveBtn.addEventListener("click", async () => {
      try {
        const { updateDocument } = await import("../../firebase/firestore.js");
        await updateDocument(COLLECTIONS.REVIEWS, review.id, { approved: true });
        showAdminToast("Avis approuve.", "success");
      } catch (error) {
        console.error("REVIEW APPROVE ERROR:", error);
        showAdminToast("Impossible d'approuver cet avis.", "error");
      }
    });

    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "btn btn-ghost btn-sm";
    rejectBtn.id = `admin-review-reject-${review.id}`;
    rejectBtn.textContent = "Masquer";
    rejectBtn.disabled = review.approved === false;
    rejectBtn.addEventListener("click", async () => {
      try {
        const { updateDocument } = await import("../../firebase/firestore.js");
        await updateDocument(COLLECTIONS.REVIEWS, review.id, { approved: false });
        showAdminToast("Avis masque.", "success");
      } catch (error) {
        console.error("REVIEW REJECT ERROR:", error);
        showAdminToast("Impossible de masquer cet avis.", "error");
      }
    });

    actionsCell.appendChild(approveBtn);
    actionsCell.appendChild(rejectBtn);

    row.appendChild(idCell);
    row.appendChild(userCell);
    row.appendChild(ratingCell);
    row.appendChild(commentCell);
    row.appendChild(orderCell);
    row.appendChild(statusCell);
    row.appendChild(dateCell);
    row.appendChild(actionsCell);

    fragment.appendChild(row);
  });

  tbody.replaceChildren(fragment);
}

export async function initAdminReviews() {
  const table = document.getElementById("admin-reviews-table");

  if (!table) {
    return;
  }

  let allReviews = [];
  let approvedFilter = "";

  const applyFilters = () => {
    const filtered = allReviews
      .filter((review) => {
        if (approvedFilter === "approved") {
          return review.approved === true;
        }

        if (approvedFilter === "pending" || approvedFilter === "rejected") {
          return review.approved !== true;
        }

        return true;
      })
      .sort((first, second) => getTimestampMs(second.createdAt) - getTimestampMs(first.createdAt));

    renderReviewsTable(filtered);
  };

  const approvedSelect = document.getElementById("admin-reviews-filter-approved");
  const filterButton = document.getElementById("admin-reviews-filter-apply");
  const resetButton = document.getElementById("admin-reviews-filter-reset");

  filterButton?.addEventListener("click", () => {
    approvedFilter = sanitizeText(approvedSelect?.value || "");
    applyFilters();
  });

  resetButton?.addEventListener("click", () => {
    approvedFilter = "";
    if (approvedSelect) {
      approvedSelect.value = "";
    }
    applyFilters();
  });

  try {
    const { listenCollection } = await import("../../firebase/firestore.js");

    listenCollection(COLLECTIONS.REVIEWS, (reviews) => {
      allReviews = reviews;
      applyFilters();
    });
  } catch (error) {
    console.error("ADMIN REVIEWS ERROR:", error);
    showAdminToast("Impossible de charger les avis.", "error");
  }
}
