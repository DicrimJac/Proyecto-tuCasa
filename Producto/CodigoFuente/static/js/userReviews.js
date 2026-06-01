let currentTab = "all";
let allReviews = [];
let groupedReviews = {
  tenant: [],
  landlord: [],
  property: [],
};

const reviewsList = document.getElementById("reviewsList");
const reviewsTotal = document.getElementById("reviewsTotal");
const tenantAverage = document.getElementById("tenantAverage");
const landlordAverage = document.getElementById("landlordAverage");
const propertyAverage = document.getElementById("propertyAverage");

function getStoredJson(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);
    return fallback;
  }
}

function getStoredUser() {
  return getStoredJson("userData") || getStoredJson("userProfile") || {};
}

function getUserIdFromUser(user = {}) {
  return user.id_usuario || user.id || user.id_user || user.user_id || "";
}

async function getCurrentUser() {
  const storedUser = getStoredUser();
  if (getUserIdFromUser(storedUser)) return storedUser;

  try {
    const response = await fetch("/api/users/me", {
      method: "GET",
      credentials: "include",
    });
    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message || result?.error ||
          "No se pudo obtener el usuario actual",
      );
    }

    const user = result.data || {};
    localStorage.setItem(
      "userData",
      JSON.stringify({ ...storedUser, ...user }),
    );
    return { ...storedUser, ...user };
  } catch (error) {
    console.error("Error cargando usuario actual:", error);
    return storedUser;
  }
}

function getScore(review, fields = []) {
  const score = Number(
    fields.map((field) => review?.[field]).find((value) =>
      value !== undefined
    ) || 0,
  );
  return Number.isFinite(score) ? score : 0;
}

function formatDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CL");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function generateStars(score) {
  const rounded = Math.round(Number(score || 0));
  return "★".repeat(rounded) + "☆".repeat(Math.max(0, 5 - rounded));
}

function calculateAverage(reviews) {
  const valid = reviews.filter((review) =>
    Number.isFinite(review.rating) && review.rating > 0
  );
  if (!valid.length) return "0.0";
  const total = valid.reduce((sum, review) => sum + review.rating, 0);
  return (total / valid.length).toFixed(1);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error || "No se pudieron cargar las reseñas",
    );
  }

  return Array.isArray(result.data) ? result.data : [];
}

async function loadTenantReviews(userId) {
  if (!userId) return [];
  const reviews = await fetchJson(
    `/api/tenant-reviews?id_usuario=${encodeURIComponent(userId)}`,
  );
  return reviews.map((review, index) => ({
    id: `tenant-${review.id_review || index}`,
    type: "tenant",
    title: "Evaluación como arrendatario",
    subtitle: "Reseña recibida por tu comportamiento como arrendatario",
    rating: getScore(review, ["total_rank"]),
    date: review.date_review,
    comment: review.comment || "Sin comentario",
  }));
}

async function loadLandlordReviews(userId) {
  if (!userId) return [];
  const reviews = await fetchJson(
    `/api/landlord-reviews?id_usuario=${encodeURIComponent(userId)}`,
  );
  return reviews.map((review, index) => ({
    id: `landlord-${review.id_landlord || index}`,
    type: "landlord",
    title: "Evaluación como arrendador",
    subtitle: "Reseña recibida por tu gestión como arrendador",
    rating: getScore(review, ["total_point"]),
    date: review.date,
    comment: review.descr || review.comment || "Sin comentario",
  }));
}

function normalizeOwnedProperty(property = {}) {
  return {
    id: property.id_propi || property.id || property.property_id || "",
    title: property.title || property.titulo || property.name ||
      property.type_desc || "Propiedad",
  };
}

async function loadOwnedProperties() {
  try {
    const properties = await fetchJson("/api/properties/mine");
    return properties.map(normalizeOwnedProperty).filter((property) =>
      property.id
    );
  } catch (error) {
    console.error("Error cargando propiedades del usuario:", error);
    return [];
  }
}

async function loadPropertyReviews() {
  const properties = await loadOwnedProperties();
  const reviewsByProperty = await Promise.all(
    properties.map(async (property) => {
      try {
        const reviews = await fetchJson(
          `/api/property-reviews?id_propi=${encodeURIComponent(property.id)}`,
        );
        return reviews.map((review, index) => ({
          id: `property-${property.id}-${review.id_evalupropi || index}`,
          type: "property",
          title: property.title,
          subtitle: "Evaluación recibida por una de tus propiedades",
          rating: getScore(review, ["total_point"]),
          date: review.date_register,
          comment: review.description || review.comment || "Sin comentario",
        }));
      } catch (error) {
        console.error(
          `Error cargando reseñas de propiedad ${property.id}:`,
          error,
        );
        return [];
      }
    }),
  );

  return reviewsByProperty.flat();
}

function updateSummary() {
  tenantAverage.textContent = calculateAverage(groupedReviews.tenant);
  landlordAverage.textContent = calculateAverage(groupedReviews.landlord);
  propertyAverage.textContent = calculateAverage(groupedReviews.property);
}

function getVisibleReviews() {
  return currentTab === "all" ? allReviews : groupedReviews[currentTab] || [];
}

function getTypeLabel(type) {
  return {
    tenant: "Arrendatario",
    landlord: "Arrendador",
    property: "Propiedad",
  }[type] || "Reseña";
}

function getTypeIcon(type) {
  return {
    tenant: "fa-user-check",
    landlord: "fa-key",
    property: "fa-building",
  }[type] || "fa-star";
}

function renderReviews() {
  const reviews = getVisibleReviews()
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  reviewsTotal.textContent = `${reviews.length} ${
    reviews.length === 1 ? "reseña" : "reseñas"
  }`;

  if (!reviews.length) {
    reviewsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star-half-alt"></i>
                <p>No hay reseñas para mostrar en esta sección.</p>
            </div>
        `;
    return;
  }

  reviewsList.innerHTML = reviews.map((review) => `
        <article class="review-card">
            <div class="review-icon"><i class="fas ${
    getTypeIcon(review.type)
  }"></i></div>
            <div class="review-content">
                <div class="review-header">
                    <div>
                        <span class="review-type">${
    getTypeLabel(review.type)
  }</span>
                        <h3>${escapeHtml(review.title)}</h3>
                        <p>${escapeHtml(review.subtitle)}</p>
                    </div>
                    <div class="review-score">
                        <strong>${review.rating.toFixed(1)}</strong>
                        <span>${generateStars(review.rating)}</span>
                    </div>
                </div>
                <p class="review-comment">${escapeHtml(review.comment)}</p>
                <div class="review-date"><i class="far fa-calendar"></i> ${
    formatDate(review.date)
  }</div>
            </div>
        </article>
    `).join("");
}

function setLoadingState() {
  reviewsList.innerHTML = '<div class="empty-state">Cargando reseñas...</div>';
  reviewsTotal.textContent = "Cargando...";
}

function showToast(message, isError = false) {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastHeader = toast?.querySelector(".toast-header");
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.style.borderLeftColor = isError ? "#dc3545" : "#2C5A6E";
  const icon = toastHeader?.querySelector("i");
  if (icon) {
    icon.className = isError
      ? "bi bi-exclamation-triangle-fill"
      : "bi bi-check-circle-fill";
  }
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

async function loadReviews() {
  setLoadingState();
  const user = await getCurrentUser();
  const userId = getUserIdFromUser(user);

  if (!userId) {
    reviewsList.innerHTML =
      '<div class="empty-state">No se pudo identificar el usuario logeado.</div>';
    reviewsTotal.textContent = "0 reseñas";
    return;
  }

  const results = await Promise.allSettled([
    loadTenantReviews(userId),
    loadLandlordReviews(userId),
    loadPropertyReviews(),
  ]);
  const [tenantResult, landlordResult, propertyResult] = results;

  groupedReviews = {
    tenant: tenantResult.status === "fulfilled" ? tenantResult.value : [],
    landlord: landlordResult.status === "fulfilled" ? landlordResult.value : [],
    property: propertyResult.status === "fulfilled" ? propertyResult.value : [],
  };
  allReviews = [
    ...groupedReviews.tenant,
    ...groupedReviews.landlord,
    ...groupedReviews.property,
  ];

  results
    .filter((result) => result.status === "rejected")
    .forEach((result) =>
      console.error("Error cargando reseñas:", result.reason)
    );

  updateSummary();
  renderReviews();

  if (results.some((result) => result.status === "rejected")) {
    showToast("Algunas reseñas no se pudieron cargar", true);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((item) =>
        item.classList.remove("active")
      );
      button.classList.add("active");
      currentTab = button.dataset.tab || "all";
      renderReviews();
    });
  });

  loadReviews();
});
