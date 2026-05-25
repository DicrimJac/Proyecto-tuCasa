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
        return new Set(allOwners[getLoggedOwnerKey()] || []);
    } catch (error) {
        console.error("Error leyendo propiedades del usuario:", error);
        return new Set();
    }
}

function removeOwnerPropertyId(propertyId) {
    const allOwners = JSON.parse(localStorage.getItem("ownerPropertyIds") || "{}");
    const ownerKey = getLoggedOwnerKey();
    const ids = new Set(allOwners[ownerKey] || []);
    ids.delete(propertyId);
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

function removeCachedPropertyImage(propertyId) {
    const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
    delete cache[propertyId];
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

function normalizeProperty(property, index) {
    const characteristic = property.caracteristica || property.characteristic || {};
    const id = property.id_propi || property.id || property.property_id || index + 1;

    return {
        id,
        title: property.title || property.titulo || property.name || property.type_desc || `Propiedad ${id}`,
        location: getPropertyLocation(property),
        price: Number(characteristic.price ?? property.price ?? property.precio ?? 0),
        image: getCachedPropertyImage(id) || property.image || property.imagen || DEFAULT_PROPERTY_IMAGE,
        raw: property,
    };
}

async function loadOwnerProperties() {
    const response = await fetch("/api/properties", {
        method: "GET",
        credentials: "same-origin",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result?.message || result?.error || "No se pudieron cargar tus propiedades");
    }

    const properties = Array.isArray(result.data) ? result.data : [];
    const ownerIds = getOwnerPropertyIds();
    const normalized = properties.map(normalizeProperty);
    ownerProperties = ownerIds.size > 0
        ? normalized.filter((property) => ownerIds.has(property.id))
        : normalized;
}

// ========== ACTUALIZAR ESTADISTICAS ==========
function updateStats() {
    const totalProps = ownerProperties.length;
    const totalReqs = receivedRequests.length;
    const approvedReqs = receivedRequests.filter(r => r.status === 'approved').length;
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
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    return { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' }[status] || status;
}

function viewRequestDetail(requestId) {
    const request = receivedRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modalBody = document.getElementById('requestModalBody');
    modalBody.innerHTML = `
        <div class="detail-row"><span class="detail-label">Propiedad:</span><span class="detail-value">${request.propertyTitle}</span></div>
        <div class="detail-row"><span class="detail-label">Solicitante:</span><span class="detail-value">${request.applicant}</span></div>
        <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${request.email}</span></div>
        <div class="detail-row"><span class="detail-label">Telefono:</span><span class="detail-value">${request.phone}</span></div>
        <div class="detail-row"><span class="detail-label">Fecha:</span><span class="detail-value">${formatDate(request.date)}</span></div>
        <div class="detail-row"><span class="detail-label">Mensaje:</span><span class="detail-value">${request.message}</span></div>
        <div class="detail-row"><span class="detail-label">Estado:</span><span class="detail-value">${getStatusText(request.status)}</span></div>
    `;
    
    document.getElementById('requestModal').classList.add('active');
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
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
        <div class="property-card">
            <div class="property-image"><img src="${p.image}" alt="${p.title}" onerror="this.src='${DEFAULT_PROPERTY_IMAGE}'"></div>
            <div class="property-info">
                <h4>${p.title}</h4>
                <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                <div class="property-price">$${Number(p.price || 0).toLocaleString()} /mes</div>
                <div class="property-actions">
                    <button class="btn-edit" onclick="editProperty(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="deleteProperty(${p.id})">Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editProperty(id) {
    window.location.href = `publishProperty.html?id=${id}`;
}

async function deleteProperty(id) {
    if (!confirm('Eliminar esta propiedad?')) return;

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
            method: "DELETE",
            credentials: "same-origin",
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
    renderRecentActivity();
    renderRequests();

    try {
        await loadOwnerProperties();
    } catch (error) {
        console.error("Error cargando propiedades del arrendador:", error);
        showToast(error.message || "No se pudieron cargar tus propiedades", true);
    }

    renderProperties();
    updateStats();
    
    document.getElementById('requestModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('requestModal')) closeRequestModal();
    });
});

window.viewRequestDetail = viewRequestDetail;
window.closeRequestModal = closeRequestModal;
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;
