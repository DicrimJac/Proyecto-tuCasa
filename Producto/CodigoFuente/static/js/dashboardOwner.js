// ========== DASHBOARD ARRENDADOR ==========

let ownerProperties = [];

let receivedRequests = [];
let propertyRatings = [];
let recentActivity = [];

const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

function getLoggedOwnerKey() {
    const savedData = localStorage.getItem("userData") || localStorage.getItem("userProfile");
    if (savedData) {
        try {
            const user = JSON.parse(savedData);
            return (user.mail || user.email || user.correo || user.id_usuario || user.id || "owner").toString().trim().toLowerCase();
        } catch (error) {
            console.error("Error leyendo usuario logueado:", error);
        }
    }

    return (localStorage.getItem("userEmail") || "owner").trim().toLowerCase();
}

function getOwnerPropertyIds() {
    try {
        const allOwners = JSON.parse(localStorage.getItem("ownerPropertyIds") || "{}");
        return new Set((allOwners[getLoggedOwnerKey()] || []).map(String));
    } catch (error) {
        console.error("Error leyendo propiedades del usuario:", error);
        return new Set();
    }
}

function removeOwnerPropertyId(propertyId) {
    const allOwners = JSON.parse(localStorage.getItem("ownerPropertyIds") || "{}");
    const ownerKey = getLoggedOwnerKey();
    const ids = new Set((allOwners[ownerKey] || []).map(String));
    ids.delete(String(propertyId));
    allOwners[ownerKey] = [...ids];
    localStorage.setItem("ownerPropertyIds", JSON.stringify(allOwners));
}

function getCachedPropertyImage(propertyId) {
    try {
        const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
        return cache[propertyId] || "";
    } catch (error) {
        console.error("Error leyendo cache de imagenes:", error);
        return "";
    }
}

function getPropertyImage(property, propertyId) {
    const photos = property.fotos || property.photos || property.imagenes || [];
    return photos[0]?.url_foto
        || photos[0]?.url
        || property.url_foto
        || property.image
        || property.imagen
        || getCachedPropertyImage(propertyId)
        || DEFAULT_PROPERTY_IMAGE;
}

function removeCachedPropertyImage(propertyId) {
    const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
    delete cache[String(propertyId)];
    localStorage.setItem("propertyImageCache", JSON.stringify(cache));
}

function getPropertyLocation(property) {
    const address = property.direccion || property.address || {};
    const parts = [
        property.location,
        property.ubicacion,
        address.comuna,
        address.city,
    ].filter(Boolean);

    return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function normalizePropertyStatus(property) {
    const stateNumber = property.state_nbr ?? property.status_nbr;
    const stateText = String(property.state_desc || property.status_desc || property.estado || property.status || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();

    if (Number(stateNumber) === 0) return false;
    if (["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText)) {
        return false;
    }

    return true;
}

function normalizeProperty(property, index) {
    const characteristic = property.caracteristica || property.characteristic || {};
    const id = property.id_propi || property.id || property.property_id || index + 1;

    return {
        id,
        title: property.title || property.titulo || property.name || property.type_desc || `Propiedad ${id}`,
        location: getPropertyLocation(property),
        price: Number(characteristic.price ?? property.price ?? property.precio ?? 0),
        image: getPropertyImage(property, id),
        active: normalizePropertyStatus(property),
        raw: property,
    };
}

function getStoredRentRequests() {
    try {
        return JSON.parse(localStorage.getItem("rentRequests") || "[]");
    } catch (error) {
        console.error("Error leyendo solicitudes de arriendo:", error);
        return [];
    }
}

function normalizeRequestStatus(status) {
    return {
        pending: "pendiente",
        approved: "aprobada",
        rejected: "rechazada",
    }[status] || status || "pendiente";
}

function normalizeRequest(request) {
    return {
        ...request,
        propertyId: String(request.propertyId || ""),
        applicant: request.applicant || request.fullName || "Solicitante",
        status: normalizeRequestStatus(request.status),
        message: request.message || "Sin mensaje",
    };
}

function loadReceivedRequests() {
    const ownerPropertyIds = new Set(ownerProperties.map((property) => String(property.id)));
    const storedRequests = getStoredRentRequests().map(normalizeRequest);

    receivedRequests = ownerPropertyIds.size > 0
        ? storedRequests.filter((request) => ownerPropertyIds.has(request.propertyId))
        : storedRequests;

    recentActivity = receivedRequests.map((request) => ({
        type: "solicitud",
        title: `Nueva solicitud: ${request.propertyTitle}`,
        date: request.date,
    }));
}

function refreshReceivedRequests() {
    loadReceivedRequests();
    renderRecentActivity();
    renderRequests();
    updateStats();
}

async function loadOwnerProperties() {
    const response = await fetch("/api/properties/mine", {
        method: "GET",
        credentials: "include",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result?.message || result?.error || "No se pudieron cargar tus propiedades");
    }

    const properties = Array.isArray(result.data) ? result.data : [];
    ownerProperties = properties.map(normalizeProperty);
}

// ========== ACTUALIZAR ESTADISTICAS ==========
function updateStats() {
    const totalProps = ownerProperties.length;
    const totalReqs = receivedRequests.length;
    const approvedReqs = receivedRequests.filter(r => r.status === 'aprobada').length;
    const acceptanceRate = totalReqs > 0 ? Math.round((approvedReqs / totalReqs) * 100) : 0;
    
    let avgRating = 0;
    if (propertyRatings.length > 0) {
        const sum = propertyRatings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = (sum / propertyRatings.length).toFixed(1);
    }
    
    document.getElementById('totalProperties').textContent = totalProps;
    document.getElementById('totalRequests').textContent = totalReqs;
    document.getElementById('acceptanceRate').textContent = `${acceptanceRate}%`;
    document.getElementById('avgRating').textContent = avgRating;
}

// ========== ACTIVIDAD RECIENTE ==========
function renderRecentActivity() {
    const container = document.getElementById('recentActivityList');
    if (!container) return;
    const sorted = [...recentActivity].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recent = sorted.slice(0, 5);
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-day"></i><p>No hay actividad reciente</p></div>';
        return;
    }
    
    container.innerHTML = recent.map(a => `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-${a.type === 'solicitud' ? 'envelope' : 'star'}"></i></div>
            <div class="activity-content">
                <div class="activity-title">${a.title}</div>
                <div class="activity-date">${formatRelativeDate(a.date)}</div>
            </div>
        </div>
    `).join('');
}

// ========== SOLICITUDES ==========
function renderRequests() {
    const container = document.getElementById('requestsList');
    if (!container) return;
    
    if (receivedRequests.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay solicitudes</p></div>';
        return;
    }
    
    container.innerHTML = receivedRequests.map(r => `
        <div class="request-item">
            <div class="request-info">
                <h4>${r.propertyTitle}</h4>
                <p>Solicitante: ${r.applicant}</p>
                <span class="request-status status-${r.status}">${getStatusText(r.status)}</span>
            </div>
            <div class="request-actions">
                <button class="btn-view" onclick="viewRequestDetail(${r.id})">Ver</button>
                ${r.status === 'pendiente' ? `
                    <button class="btn-approve" onclick="updateRequestStatus(${r.id}, 'aprobada')">Aprobar</button>
                    <button class="btn-reject" onclick="updateRequestStatus(${r.id}, 'rechazada')">Rechazar</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    return { pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' }[status] || status;
}

function viewRequestDetail(requestId) {
    const request = receivedRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modalBody = document.getElementById('requestModalBody');
    modalBody.innerHTML = `
        <div class="detail-row"><span class="detail-label">Propiedad:</span><span class="detail-value">${request.propertyTitle}</span></div>
        <div class="detail-row"><span class="detail-label">Solicitante:</span><span class="detail-value">${request.applicant}</span></div>
        <div class="detail-row"><span class="detail-label">RUT:</span><span class="detail-value">${request.rut || 'No informado'}</span></div>
        <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${request.email}</span></div>
        <div class="detail-row"><span class="detail-label">Telefono:</span><span class="detail-value">${request.phone}</span></div>
        <div class="detail-row"><span class="detail-label">Fecha solicitud:</span><span class="detail-value">${formatDate(request.date)}</span></div>
        <div class="detail-row"><span class="detail-label">Inicio deseado:</span><span class="detail-value">${formatDate(request.startDate)}</span></div>
        <div class="detail-row"><span class="detail-label">Duracion:</span><span class="detail-value">${request.duration || 'No informada'}</span></div>
        <div class="detail-row"><span class="detail-label">Ocupantes:</span><span class="detail-value">${request.occupants || 'No informado'}</span></div>
        <div class="detail-row"><span class="detail-label">Mascotas:</span><span class="detail-value">${request.pets === 'si' ? 'Si' : 'No'}</span></div>
        <div class="detail-row"><span class="detail-label">Situacion laboral:</span><span class="detail-value">${request.employment || 'No informada'}</span></div>
        <div class="detail-row"><span class="detail-label">Ingreso mensual:</span><span class="detail-value">$${Number(request.income || 0).toLocaleString()}</span></div>
        <div class="detail-row"><span class="detail-label">Mensaje:</span><span class="detail-value">${request.message}</span></div>
        <div class="detail-row"><span class="detail-label">Estado:</span><span class="detail-value">${getStatusText(request.status)}</span></div>
    `;
    
    document.getElementById('requestModal').classList.add('active');
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
}

async function disablePropertyAfterApproval(propertyId) {
    if (!propertyId) return;

    const property = ownerProperties.find((item) => String(item.id) === String(propertyId));
    if (property && !property.active) return;

    if (property) {
        property.active = false;
        renderProperties();
    }

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: false }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo deshabilitar la propiedad");
        }

        if (property) {
            property.raw = result.data || property.raw;
            property.active = normalizePropertyStatus(result.data || property.raw);
            renderProperties();
        }
    } catch (error) {
        console.error("Error deshabilitando propiedad aprobada:", error);
        if (property) {
            property.active = true;
            renderProperties();
        }
        showToast(error.message || "Solicitud aprobada, pero no se pudo deshabilitar la propiedad", true);
    }
}

async function updateRequestStatus(requestId, nextStatus) {
    const validStatuses = new Set(['aprobada', 'rechazada']);
    if (!validStatuses.has(nextStatus)) return;

    const storedRequests = getStoredRentRequests();
    const requestIndex = storedRequests.findIndex((request) => Number(request.id) === Number(requestId));
    if (requestIndex === -1) {
        showToast('No se encontro la solicitud', true);
        return;
    }

    storedRequests[requestIndex].status = nextStatus;
    storedRequests[requestIndex].statusUpdatedAt = new Date().toISOString();
    localStorage.setItem('rentRequests', JSON.stringify(storedRequests));
    refreshReceivedRequests();

    if (nextStatus === 'aprobada') {
        await disablePropertyAfterApproval(storedRequests[requestIndex].propertyId);
    }

    showToast(`Solicitud ${getStatusText(nextStatus).toLowerCase()}`);
}

// ========== PROPIEDADES ==========
function renderProperties() {
    const container = document.getElementById('propertiesList');
    if (!container) return;
    
    if (ownerProperties.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><p>No hay propiedades publicadas</p></div>';
        return;
    }
    
    container.innerHTML = ownerProperties.map(p => `
        <div class="property-card ${p.active ? '' : 'property-disabled'}">
            <div class="property-image"><img src="${p.image}" alt="${p.title}" onerror="this.src='${DEFAULT_PROPERTY_IMAGE}'"></div>
            <div class="property-info">
                <div class="property-title-row">
                    <h4>${p.title}</h4>
                    <span class="property-status ${p.active ? 'status-active' : 'status-inactive'}">${p.active ? 'Habilitada' : 'Deshabilitada'}</span>
                </div>
                <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                <div class="property-price">$${Number(p.price || 0).toLocaleString()} /mes</div>
                <div class="property-actions">
                    <button class="btn-action btn-toggle-status ${p.active ? 'is-active' : 'is-inactive'}" type="button" title="${p.active ? 'Deshabilitar propiedad' : 'Habilitar propiedad'}" aria-label="${p.active ? 'Deshabilitar propiedad' : 'Habilitar propiedad'}" onclick="togglePropertyStatus(${p.id})">
                        <i class="bi bi-${p.active ? 'toggle-on' : 'toggle-off'}"></i>
                    </button>
                    <button class="btn-edit" onclick="editProperty(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteProperty(${p.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editProperty(id) {
    window.location.href = `publishProperty.html?id=${encodeURIComponent(id)}&mode=edit`;
}

async function togglePropertyStatus(id) {
    const property = ownerProperties.find(p => p.id === id);
    if (!property) return;

    const nextActive = !property.active;
    const previousActive = property.active;
    property.active = nextActive;
    renderProperties();

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(id)}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ active: nextActive }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo actualizar el estado");
        }

        property.raw = result.data || property.raw;
        property.active = normalizePropertyStatus(result.data || property.raw);
        renderProperties();
        showToast(`Propiedad ${property.active ? 'habilitada' : 'deshabilitada'}`);
    } catch (error) {
        console.error("Error actualizando estado de propiedad:", error);
        property.active = previousActive;
        renderProperties();
        showToast(error.message || "No se pudo actualizar el estado", true);
    }
}

async function deleteProperty(id) {
    if (!confirm('Eliminar esta propiedad?')) return;

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
            method: "DELETE",
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo eliminar la propiedad");
        }

        ownerProperties = ownerProperties.filter(p => p.id !== id);
        removeOwnerPropertyId(id);
        removeCachedPropertyImage(id);
        renderProperties();
        updateStats();
        showToast('Propiedad eliminada');
    } catch (error) {
        console.error("Error eliminando propiedad:", error);
        showToast(error.message || "No se pudo eliminar la propiedad", true);
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatDate(date) {
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleDateString('es-ES');
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Hace unos segundos';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return formatDate(dateString);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.style.borderLeftColor = isError ? '#dc3545' : '#2C5A6E';
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// ========== INICIALIZACION ==========
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadOwnerProperties();
    } catch (error) {
        console.error("Error cargando propiedades del arrendador:", error);
        showToast(error.message || "No se pudieron cargar tus propiedades", true);
    }

    refreshReceivedRequests();
    renderProperties();
    
    document.getElementById('requestModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('requestModal')) closeRequestModal();
    });

    window.addEventListener('focus', refreshReceivedRequests);
    window.addEventListener('storage', (event) => {
        if (event.key === 'rentRequests') refreshReceivedRequests();
    });
});

window.viewRequestDetail = viewRequestDetail;
window.closeRequestModal = closeRequestModal;
window.updateRequestStatus = updateRequestStatus;
window.editProperty = editProperty;
window.togglePropertyStatus = togglePropertyStatus;
window.deleteProperty = deleteProperty;
