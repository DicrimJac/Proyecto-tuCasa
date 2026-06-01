// ========== VARIABLES GLOBALES ==========
let allRequests = [];
let filteredRequests = [];
let currentPage = 1;
const itemsPerPage = 10;
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function normalizeStatus(status) {
  if (Number(status) === 1) return "pendiente";
  if (Number(status) === 2) return "aprobada";
  if (Number(status) === 3) return "rechazada";
  if (Number(status) === 4) return "finalizada";

  const aliases = {
    pending: "pendiente",
    approved: "aprobada",
    rejected: "rechazada",
    completed: "finalizada",
    pendiente: "pendiente",
    aprobada: "aprobada",
    rechazada: "rechazada",
    finalizada: "finalizada",
  };

  return aliases[normalizeText(status)] || "pendiente";
}

function getMessageValue(message, label) {
  const normalizedLabel = normalizeText(label);
  const line = String(message || "")
    .split(/\r?\n/)
    .find((value) => normalizeText(value).startsWith(`${normalizedLabel}:`));

  return line ? line.slice(line.indexOf(":") + 1).trim() : "";
}

function getPropertyLocation(property = {}) {
  const address = property.direccion || property.address || {};
  const parts = [
    property.location,
    property.ubicacion,
    address.street && address.number
      ? `${address.street} ${address.number}`
      : "",
    address.comuna,
    address.city,
    address.state,
  ].filter(Boolean);

  return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getPropertyPrice(property = {}) {
  const characteristic = property.caracteristica || property.characteristic ||
    {};
  return Number(characteristic.price ?? property.price ?? property.precio ?? 0);
}

function getPropertyImage(property = {}) {
  const photos = property.fotos || property.photos || property.imagenes || [];
  return photos[0]?.url_foto ||
    photos[0]?.url ||
    property.url_foto ||
    property.image ||
    property.imagen ||
    DEFAULT_PROPERTY_IMAGE;
}

function getUserName(user = {}) {
  const names = [
    user.first_name,
    user.second_name,
    user.first_last_name,
    user.second_last_name,
  ].filter(Boolean);

  return names.join(" ") || user.name || user.fullName || "No informado";
}

function getUserEmail(user = {}) {
  return user.mail || user.email || user.correo || "";
}

function normalizeApiRequest(request, direction) {
  const property = request.propiedad || request.property || {};
  const user = request.usuario || request.user || {};
  const message = request.message || "";
  const applicantName = getMessageValue(message, "Nombre") || getUserName(user);
  const applicantEmail = getMessageValue(message, "Correo") ||
    getUserEmail(user);
  const propertyId = request.id_propi || property.id_propi || property.id || "";

  return {
    key: `${direction}-${request.id_request || request.id || propertyId}`,
    id: request.id_request || request.id,
    direction,
    propertyId,
    propertyTitle: property.title || property.titulo || property.name ||
      property.type_desc || "Propiedad",
    propertyLocation: getPropertyLocation(property),
    propertyPrice: getPropertyPrice(property),
    propertyImage: getPropertyImage(property),
    fullName: applicantName,
    rut: getMessageValue(message, "RUT") || "No informado",
    email: applicantEmail || "No informado",
    phone: getMessageValue(message, "Telefono") ||
      getMessageValue(message, "Teléfono") ||
      "No informado",
    startDate: getMessageValue(message, "Fecha de inicio deseada") ||
      request.start_date ||
      request.startDate ||
      request.date,
    duration: request.contract_time
      ? `${Number(request.contract_time)} meses`
      : getMessageValue(message, "Duracion") ||
        getMessageValue(message, "Duración") ||
        "No informada",
    occupants: request.qty_person
      ? `${Number(request.qty_person)} persona${
        Number(request.qty_person) === 1 ? "" : "s"
      }`
      : getMessageValue(message, "Ocupantes") || "No informado",
    pets: getMessageValue(message, "Mascotas") || "No informado",
    employment: request.work_situation_desc ||
      getMessageValue(message, "Situacion laboral") ||
      getMessageValue(message, "Situación laboral") ||
      "No informada",
    income: Number(
      request.income || getMessageValue(message, "Ingreso mensual") || 0,
    ),
    message,
    status: normalizeStatus(
      request.status_nbr || request.status_desc || request.status,
    ),
    date: request.date || request.created_at || request.date_register,
  };
}

async function fetchRequests(url) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || result?.error ||
        "No se pudieron cargar las solicitudes",
    );
  }

  return Array.isArray(result.data) ? result.data : [];
}

async function loadRequests() {
  const container = document.getElementById("requestsList");
  if (container) {
    container.innerHTML =
      '<div class="empty-state">Cargando solicitudes...</div>';
  }

  const results = await Promise.allSettled([
    fetchRequests("/api/requests/mine"),
    fetchRequests("/api/requests/received"),
  ]);
  const [mineResult, receivedResult] = results;

  const mineRequests = mineResult.status === "fulfilled"
    ? mineResult.value.map((request) => normalizeApiRequest(request, "sent"))
    : [];
  const receivedRequests = receivedResult.status === "fulfilled"
    ? receivedResult.value.map((request) =>
      normalizeApiRequest(request, "received")
    )
    : [];

  results
    .filter((result) => result.status === "rejected")
    .forEach((result) =>
      console.error("Error cargando solicitudes:", result.reason)
    );

  allRequests = [...mineRequests, ...receivedRequests]
    .filter((request) => request.id)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  if (results.some((result) => result.status === "rejected")) {
    showToast("Algunas solicitudes no se pudieron cargar", true);
  }

  applyFilters();
}

function getSelectedStatus() {
  const value = document.getElementById("statusFilter").value;
  return value === "all" ? "all" : normalizeStatus(value);
}

function applyFilters() {
  const status = getSelectedStatus();
  const searchTerm = normalizeText(
    document.getElementById("searchFilter").value,
  );

  filteredRequests = allRequests.filter((request) => {
    if (status !== "all" && request.status !== status) return false;
    if (searchTerm) {
      const haystack = normalizeText([
        request.propertyTitle,
        request.propertyLocation,
        request.fullName,
        request.email,
        getDirectionText(request.direction),
      ].join(" "));
      if (!haystack.includes(searchTerm)) return false;
    }
    return true;
  });

  currentPage = 1;
  renderRequests();
}

function renderRequests() {
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filteredRequests.slice(start, start + itemsPerPage);

  const container = document.getElementById("requestsList");
  const emptyState = document.getElementById("emptyState");
  const paginationDiv = document.getElementById("pagination");

  if (paginated.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    paginationDiv.innerHTML = "";
    return;
  }

  emptyState.style.display = "none";

  container.innerHTML = paginated.map((request) => `
        <div class="request-card" onclick="openDetailModal('${request.key}')">
            <div class="request-header">
                <div class="request-title">
                    <img src="${escapeHtml(request.propertyImage)}" alt="${
    escapeHtml(request.propertyTitle)
  }" class="request-image" onerror="this.src='${DEFAULT_PROPERTY_IMAGE}'">
                    <div class="request-info">
                        <h3>${escapeHtml(request.propertyTitle)}</h3>
                        <div class="request-location">
                            <i class="fas fa-map-marker-alt"></i> ${
    escapeHtml(request.propertyLocation)
  }
                        </div>
                    </div>
                </div>
                <div class="request-badges">
                    <span class="request-direction ${request.direction}">
                        ${getDirectionText(request.direction)}
                    </span>
                    <span class="request-status ${request.status}">
                        ${getStatusText(request.status)}
                    </span>
                </div>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Inicio: ${formatDate(request.startDate)}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-clock"></i>
                    <span>Duracion: ${escapeHtml(request.duration)}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${
    Number(request.propertyPrice || 0).toLocaleString()
  }/mes</span>
                </div>
            </div>
            <div class="request-footer">
                <span class="request-date">
                    <i class="fas fa-clock"></i> Solicitud: ${
    formatRelativeDate(request.date)
  }
                </span>
                <button class="btn-view-detail" onclick="event.stopPropagation(); openDetailModal('${request.key}')">
                    Ver detalles <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationDiv = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationDiv.innerHTML = "";
    return;
  }

  let paginationHtml = "";

  paginationHtml += `<button class="page-btn ${
    currentPage === 1 ? "disabled" : ""
  }" onclick="changePage(${currentPage - 1})" ${
    currentPage === 1 ? "disabled" : ""
  }>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      paginationHtml += `<button class="page-btn ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      paginationHtml += `<span class="page-dots">...</span>`;
    }
  }

  paginationHtml += `<button class="page-btn ${
    currentPage === totalPages ? "disabled" : ""
  }" onclick="changePage(${currentPage + 1})" ${
    currentPage === totalPages ? "disabled" : ""
  }>
        Siguiente <i class="fas fa-chevron-right"></i>
    </button>`;

  paginationDiv.innerHTML = paginationHtml;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderRequests();
  window.scrollTo({ top: 400, behavior: "smooth" });
}

function openDetailModal(requestKey) {
  const request = allRequests.find((item) => item.key === requestKey);
  if (!request) return;

  const modal = document.getElementById("detailModal");
  const modalBody = document.getElementById("modalBody");

  modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">${
    getDirectionText(request.direction)
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Propiedad:</span>
            <span class="detail-value">${
    escapeHtml(request.propertyTitle)
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ubicacion:</span>
            <span class="detail-value">${
    escapeHtml(request.propertyLocation)
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Valor mensual:</span>
            <span class="detail-value">$${
    Number(request.propertyPrice || 0).toLocaleString()
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Solicitante:</span>
            <span class="detail-value">${escapeHtml(request.fullName)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">RUT:</span>
            <span class="detail-value">${escapeHtml(request.rut)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Correo:</span>
            <span class="detail-value">${escapeHtml(request.email)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Telefono:</span>
            <span class="detail-value">${escapeHtml(request.phone)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Fecha inicio:</span>
            <span class="detail-value">${formatDate(request.startDate)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Duracion:</span>
            <span class="detail-value">${escapeHtml(request.duration)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ocupantes:</span>
            <span class="detail-value">${escapeHtml(request.occupants)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mascotas:</span>
            <span class="detail-value">${escapeHtml(request.pets)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Situacion laboral:</span>
            <span class="detail-value">${escapeHtml(request.employment)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ingreso mensual:</span>
            <span class="detail-value">$${
    Number(request.income || 0).toLocaleString()
  }</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value" style="font-weight: 600; color: ${
    getStatusColor(request.status)
  }">
                ${getStatusText(request.status)}
            </span>
        </div>
        ${
    request.message
      ? `
        <div class="detail-row">
            <span class="detail-label">Mensaje:</span>
            <span class="detail-value">${escapeHtml(request.message)}</span>
        </div>
        `
      : ""
  }
    `;

  modal.classList.add("active");
}

function closeDetailModal() {
  const modal = document.getElementById("detailModal");
  modal.classList.remove("active");
}

function getDirectionText(direction) {
  return direction === "received" ? "Recibida" : "Enviada";
}

function getStatusText(status) {
  const statusMap = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    finalizada: "Finalizada",
  };
  return statusMap[status] || status;
}

function getStatusColor(status) {
  const colorMap = {
    pendiente: "#856404",
    aprobada: "#155724",
    rechazada: "#721c24",
    finalizada: "#6c7f8b",
  };
  return colorMap[status] || "#1F3B4C";
}

function formatDate(dateString) {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : date.toLocaleDateString("es-ES");
}

function formatRelativeDate(dateString) {
  if (!dateString) return "Sin fecha";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message, isError = false) {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastHeader = toast?.querySelector(".toast-header");

  if (!toast || !toastMessage) return;
  toastMessage.textContent = message;

  if (isError) {
    toast.style.borderLeftColor = "#dc3545";
    const icon = toastHeader?.querySelector("i");
    if (icon) {
      icon.className = "bi bi-exclamation-triangle-fill";
      icon.style.color = "#dc3545";
    }
    const strong = toastHeader?.querySelector("strong");
    if (strong) strong.textContent = "Error";
  } else {
    toast.style.borderLeftColor = "#2C5A6E";
    const icon = toastHeader?.querySelector("i");
    if (icon) {
      icon.className = "bi bi-check-circle-fill";
      icon.style.color = "#2C5A6E";
    }
    const strong = toastHeader?.querySelector("strong");
    if (strong) strong.textContent = "Exito";
  }

  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  loadRequests();

  document.getElementById("statusFilter").addEventListener(
    "change",
    applyFilters,
  );
  document.getElementById("searchFilter").addEventListener(
    "input",
    applyFilters,
  );
  document.getElementById("clearFiltersBtn").addEventListener(
    "click",
    function () {
      document.getElementById("statusFilter").value = "all";
      document.getElementById("searchFilter").value = "";
      applyFilters();
      showToast("Filtros limpiados");
    },
  );

  document.getElementById("detailModal").addEventListener(
    "click",
    function (e) {
      if (e.target === this) {
        closeDetailModal();
      }
    },
  );
});

window.changePage = changePage;
window.openDetailModal = openDetailModal;
window.closeDetailModal = closeDetailModal;
