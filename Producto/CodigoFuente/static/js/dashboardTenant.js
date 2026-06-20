// ========== DASHBOARD ARRENDATARIO ==========

let userRequests = [];
let userRentals = [];
let userRatings = getStoredJson("tenantRatings", []);
let receivedTenantReviews = [];
let userNotifications = [];

function getStoredJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);
    return fallback;
  }
}

function getCurrentUserEmail() {
  const savedData = localStorage.getItem("userData") ||
    localStorage.getItem("userProfile");
  if (savedData) {
    try {
      const user = JSON.parse(savedData);
      return String(user.mail || user.email || user.correo || "").trim()
        .toLowerCase();
    } catch (error) {
      console.error("Error leyendo usuario logueado:", error);
    }
  }

  return String(localStorage.getItem("userEmail") || "").trim().toLowerCase();
}

function getCurrentUserIdFromStorage() {
  const savedData = localStorage.getItem("userData") ||
    localStorage.getItem("userProfile");
  if (savedData) {
    try {
      const user = JSON.parse(savedData);
      return user.id_usuario || user.id || user.id_user || user.user_id || "";
    } catch (error) {
      console.error("Error leyendo id de usuario logueado:", error);
    }
  }

  return "";
}

async function getCurrentUserId() {
  const storedId = getCurrentUserIdFromStorage();
  if (storedId) return storedId;

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
    const userId = user.id_usuario || user.id || user.id_user || user.user_id ||
      "";
    if (userId) {
      const currentUser = getStoredJson("userData", {});
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...currentUser, ...user }),
      );
    }
    return userId;
  } catch (error) {
    console.error("Error obteniendo usuario actual:", error);
    return "";
  }
}

async function loadTenantReviews() {
  const userId = await getCurrentUserId();
  if (!userId) {
    receivedTenantReviews = [];
    return;
  }

  try {
    const response = await fetch(
      `/api/tenant-reviews?id_usuario=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );
    const result = await response.json();

    if (!response.ok || !result?.success) {
      throw new Error(
        result?.message || result?.error ||
          "No se pudieron cargar las calificaciones",
      );
    }

    receivedTenantReviews = (Array.isArray(result.data) ? result.data : [])
      .map((review) => ({
        rating: Number(review.total_rank || 0),
        date: review.date_review,
        comment: review.comment || "",
      }))
      .filter((review) => Number.isFinite(review.rating) && review.rating > 0);
  } catch (error) {
    console.error("Error cargando calificaciones de arrendatario:", error);
    receivedTenantReviews = [];
  }
}

function normalizeRequestStatus(status) {
  if (Number(status) === 1) return "pendiente";
  if (Number(status) === 2) return "aprobada";
  if (Number(status) === 3) return "rechazada";
  if (Number(status) === 4) return "finalizada";

  return {
    pending: "pendiente",
    approved: "aprobada",
    rejected: "rechazada",
    completed: "finalizada",
    Pendiente: "pendiente",
    Aprobada: "aprobada",
    Rechazada: "rechazada",
    Finalizada: "finalizada",
  }[status] || normalizeText(status) || "pendiente";
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getPropertyLocation(rawProperty = {}) {
  const address = rawProperty.direccion || rawProperty.address || {};
  const parts = [
    rawProperty.location,
    rawProperty.ubicacion,
    address.street && address.number
      ? `${address.street} ${address.number}`
      : "",
    address.comuna,
    address.city,
    address.state,
  ].filter(Boolean);

  return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getPropertyPrice(rawProperty = {}) {
  const characteristic = rawProperty.caracteristica ||
    rawProperty.characteristic || {};
  return Number(
    characteristic.price ?? rawProperty.price ?? rawProperty.precio ?? 0,
  );
}

function getPropertyImage(rawProperty = {}) {
  const photos = rawProperty.fotos || rawProperty.photos ||
    rawProperty.imagenes || [];
  return photos[0]?.url_foto ||
    photos[0]?.url ||
    rawProperty.url_foto ||
    rawProperty.image ||
    rawProperty.imagen ||
    "assets/image/casa1.png";
}

function getMessageValue(message, label) {
  const normalizedLabel = normalizeText(label);
  const line = String(message || "")
    .split(/\r?\n/)
    .find((value) => normalizeText(value).startsWith(`${normalizedLabel}:`));

  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function normalizeApiRequest(request) {
  const property = request.propiedad || {};
  const propertyId = request.id_propi || property.id_propi || "";
  const propertyOwner = property.usuario || property.user || property.owner ||
    {};
  const ownerId = property.id_usuario || property.id_user || property.user_id ||
    property.owner_id || propertyOwner.id_usuario || propertyOwner.id || "";
  const startDate = getMessageValue(request.message, "Fecha de inicio deseada");

  return {
    id: request.id_request,
    propertyId,
    ownerId,
    propertyTitle: property.title || property.titulo || property.name ||
      property.type_desc || "Propiedad",
    propertyLocation: getPropertyLocation(property),
    propertyPrice: getPropertyPrice(property),
    propertyImage: getPropertyImage(property),
    fullName: getMessageValue(request.message, "Nombre"),
    rut: getMessageValue(request.message, "RUT"),
    email: getMessageValue(request.message, "Correo"),
    phone: getMessageValue(request.message, "Telefono"),
    startDate,
    duration: `${Number(request.contract_time || 0)} meses`,
    occupants: `${Number(request.qty_person || 0)} persona${
      Number(request.qty_person || 0) === 1 ? "" : "s"
    }`,
    employment: request.work_situation_desc || "",
    income: Number(request.income || 0),
    message: request.message || "",
    status: normalizeRequestStatus(
      request.status_nbr || request.status_desc || request.status ||
        "pendiente",
    ),
    date: request.date,
  };
}

function getRentRequestsForCurrentTenant() {
  const currentEmail = getCurrentUserEmail();
  const requests = getStoredJson("rentRequests", []);

  return requests
    .map((request) => ({
      ...request,
      status: normalizeRequestStatus(request.status),
      propertyPrice: Number(request.propertyPrice || 0),
    }))
    .filter((request) => {
      if (!currentEmail) return true;
      return String(request.email || "").trim().toLowerCase() === currentEmail;
    });
}

async function getRentRequestsFromApi() {
  const response = await fetch("/api/requests/mine", {
    method: "GET",
    credentials: "include",
  });
  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error ||
        "No se pudieron cargar las solicitudes",
    );
  }

  return (result.data || []).map(normalizeApiRequest);
}

function getRentalEndDate(startDate, durationText) {
  const start = new Date(startDate || Date.now());
  const months = Number(String(durationText || "").match(/\d+/)?.[0] || 12);
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);
  return end.toISOString();
}

function buildNotifications(requests) {
  const readNotificationIds = new Set(
    getStoredJson("tenantReadNotifications", []),
  );

  return requests
    .filter((request) =>
      request.status === "aprobada" || request.status === "rechazada"
    )
    .map((request) => {
      const approved = request.status === "aprobada";
      const id = `${request.id}-${request.status}`;
      return {
        id,
        type: "solicitud",
        title: approved ? "Solicitud aprobada" : "Solicitud rechazada",
        message: approved
          ? `Tu solicitud para ${request.propertyTitle} fue aprobada.`
          : `Tu solicitud para ${request.propertyTitle} fue rechazada.`,
        date: request.statusUpdatedAt || request.date,
        read: readNotificationIds.has(id),
      };
    });
}

async function loadTenantDashboardData() {
  let requests = [];

  try {
    requests = await getRentRequestsFromApi();
  } catch (error) {
    console.error("Error cargando solicitudes desde Supabase:", error);
    requests = getRentRequestsForCurrentTenant();
  }

  userRequests = requests;
  userRentals = requests
    .filter((request) =>
      request.status === "aprobada" || request.status === "finalizada"
    )
    .map((request) => ({
      id: request.id,
      propertyId: request.propertyId,
      ownerId: request.ownerId,
      propertyTitle: request.propertyTitle,
      propertyLocation: request.propertyLocation || "Sin ubicación",
      startDate: request.startDate,
      createdAt: request.date,
      endDate: getRentalEndDate(request.startDate, request.duration),
      status: request.status === "finalizada" ? "finalizado" : "activo",
      rating: 0,
      rated: userRatings.some((rating) =>
        Number(rating.rentalId) === Number(request.id)
      ),
    }));
  userNotifications = buildNotifications(requests);
  await loadTenantReviews();
}

function updateStats() {
  document.getElementById("totalRequests").textContent = userRequests.length;
  document.getElementById("activeRentals").textContent = userRentals.length;

  let avgRating = 0;
  if (receivedTenantReviews.length > 0) {
    const sum = receivedTenantReviews.reduce(
      (acc, r) => acc + Number(r.rating || 0),
      0,
    );
    avgRating = (sum / receivedTenantReviews.length).toFixed(1);
  }

  document.getElementById("avgRating").textContent = avgRating;
  document.getElementById("pendingNotifications").textContent =
    userNotifications.filter((n) => !n.read).length;
}

function renderNotifications() {
  const container = document.getElementById("notificationsList");
  const unread = userNotifications.filter((n) => !n.read);
  const visibleNotifications = unread.slice(0, 3);

  if (unread.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No hay notificaciones</p></div>';
    return;
  }

  container.innerHTML = visibleNotifications.map((n) => `
        <div class="notification-item unread" onclick="markAsRead('${n.id}')">
            <div class="notification-icon"><i class="fas fa-${
    getIcon(n.type)
  }"></i></div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-date">${formatDate(n.date)}</div>
            </div>
        </div>
    `).join("");
}

function getIcon(type) {
  return {
    solicitud: "file-alt",
    recordatorio: "clock",
    mensaje: "envelope",
  }[type] || "bell";
}

function markAsRead(id) {
  userNotifications = userNotifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  const readIds = new Set(getStoredJson("tenantReadNotifications", []));
  readIds.add(String(id));
  localStorage.setItem("tenantReadNotifications", JSON.stringify([...readIds]));
  renderNotifications();
  updateStats();
  showToast("Notificacion marcada como leida");
}

function markAllNotificationsAsRead() {
  userNotifications = userNotifications.map((n) => ({ ...n, read: true }));
  localStorage.setItem(
    "tenantReadNotifications",
    JSON.stringify(userNotifications.map((n) => String(n.id))),
  );
  renderNotifications();
  updateStats();
  showToast("Todas las notificaciones marcadas como leidas");
}

function renderActiveRequests() {
  const container = document.getElementById("activeRequestsList");
  const active = userRequests.filter((r) =>
    r.status === "pendiente" || r.status === "aprobada"
  );

  if (active.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay solicitudes activas</p></div>';
    return;
  }

  container.innerHTML = active.map((r) => `
        <div class="request-card">
            <h4>${r.propertyTitle}</h4>
            <div class="request-location"><i class="fas fa-map-marker-alt"></i> ${r.propertyLocation}</div>
            <div class="request-price">$${
    Number(r.propertyPrice || 0).toLocaleString()
  } /mes</div>
            <span class="status-badge status-${r.status}">${
    r.status === "pendiente" ? "Pendiente" : "Aprobada"
  }</span>
        </div>
    `).join("");
}

function renderActiveRentals() {
  const container = document.getElementById("activeRentalsList");
  if (!container) return;

  if (userRentals.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-home"></i><p>No hay arriendos</p></div>';
    return;
  }

  const latestRentals = [...userRentals]
    .sort((a, b) => {
      const dateA = new Date(a.startDate || a.createdAt || 0).getTime() || 0;
      const dateB = new Date(b.startDate || b.createdAt || 0).getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  container.innerHTML = latestRentals.map((r) => `
        <div class="request-card rental-card">
            <h4>${r.propertyTitle}</h4>
            <div class="request-location"><i class="fas fa-map-marker-alt"></i> ${r.propertyLocation}</div>
            <div class="request-location"><i class="fas fa-calendar-check"></i> Inicio: ${
    formatDate(r.startDate)
  }</div>
            <div class="request-location"><i class="fas fa-calendar-alt"></i> Termino estimado: ${
    formatDate(r.endDate)
  }</div>
            <span class="status-badge status-${
    r.status === "finalizado" ? "finalizada" : "aprobada"
  }">${r.status === "finalizado" ? "Finalizado" : "Activo"}</span>
            <div class="request-actions">
                <button class="btn-outline-sm" onclick="window.location.href='propertyReview.html?id=${
    encodeURIComponent(r.propertyId || r.id)
  }'">Calificar</button>
            </div>
        </div>
    `).join("");
}

function renderHistory() {
  const container = document.getElementById("historyList");
  const history = userRentals.filter((r) => r.status === "finalizado");

  if (history.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No hay historial de arriendos</p></div>';
    return;
  }

  container.innerHTML = history.map((r) => `
        <div class="history-item">
            <div class="history-info">
                <h4>${r.propertyTitle}</h4>
                <p>${formatDate(r.startDate)} - ${formatDate(r.endDate)}</p>
            </div>
            <div class="history-rating">
                <button class="btn-rate" onclick="window.location.href='propertyReview.html?id=${
    encodeURIComponent(r.propertyId || r.id)
  }'">Calificar Propiedad</button>
                <button class="btn-rate btn-rate-owner" onclick="window.location.href='landlordReview.html?id_usuario=${
    encodeURIComponent(r.ownerId || "")
  }'">Calificar Propietario</button>
                <button class="btn-rate btn-rate-tucasa" onclick="window.location.href='surveys.html'">Califica TuCasa</button>
            </div>
        </div>
    `).join("");
}

function generateStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += i <= rating
      ? '<i class="fas fa-star"></i>'
      : '<i class="far fa-star"></i>';
  }
  return stars;
}

let currentRentalId = null;
let selectedRating = 0;

function openRatingModal(rentalId, title) {
  currentRentalId = rentalId;
  selectedRating = 0;
  document.getElementById("rentalTitle").textContent = title;
  document.getElementById("ratingComment").value = "";

  const stars = document.querySelectorAll("#ratingStars i");
  stars.forEach((s) => s.className = "far fa-star");

  document.getElementById("ratingModal").classList.add("active");
}

function closeRatingModal() {
  document.getElementById("ratingModal").classList.remove("active");
  currentRentalId = null;
  selectedRating = 0;
}

function initModalStars() {
  const stars = document.querySelectorAll("#ratingStars i");
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      selectedRating = parseInt(this.dataset.value);
      stars.forEach((s, i) => {
        s.className = i < selectedRating
          ? "fas fa-star selected"
          : "far fa-star";
      });
    });
  });
}

function submitRating() {
  if (selectedRating === 0) {
    showToast("Selecciona una calificacion", true);
    return;
  }

  const comment = document.getElementById("ratingComment").value;
  userRentals = userRentals.map((r) =>
    r.id === currentRentalId ? { ...r, rating: selectedRating, rated: true } : r
  );
  userRatings.push({
    id: Date.now(),
    rentalId: currentRentalId,
    rating: selectedRating,
    comment,
  });
  localStorage.setItem("tenantRatings", JSON.stringify(userRatings));

  closeRatingModal();
  renderHistory();
  updateStats();
  showToast("Gracias por calificar");
}

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("es-ES");
}

function showToast(message, isError = false) {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.style.borderLeftColor = isError ? "#dc3545" : "#2C5A6E";
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 3000);
}

async function refreshDashboard() {
  await loadTenantDashboardData();
  updateStats();
  renderNotifications();
  renderActiveRequests();
  renderActiveRentals();
  renderHistory();
}

document.addEventListener("DOMContentLoaded", () => {
  refreshDashboard();
  initModalStars();

  document.getElementById("ratingModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("ratingModal")) closeRatingModal();
  });

  window.addEventListener("focus", refreshDashboard);
  window.addEventListener("storage", (event) => {
    if (
      ["rentRequests", "tenantReadNotifications", "tenantRatings"].includes(
        event.key,
      )
    ) {
      refreshDashboard();
    }
  });
});

window.markAsRead = markAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.openRatingModal = openRatingModal;
window.closeRatingModal = closeRatingModal;
window.submitRating = submitRating;
