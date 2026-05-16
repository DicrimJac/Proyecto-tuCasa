// ========== DASHBOARD ARRENDADOR ==========

// Datos simulados
let ownerProperties = [
    { id: 1, title: "Casa en Santiago Centro", location: "Santiago Centro", price: 500000, image: "assets/image/casa1.png" },
    { id: 2, title: "Departamento Moderno", location: "Providencia", price: 350000, image: "assets/image/casa2.png" }
];

let receivedRequests = [
    { id: 1, propertyId: 1, propertyTitle: "Casa en Santiago Centro", applicant: "María González", email: "maria@email.com", phone: "912345678", date: "2024-05-10", status: "pendiente", message: "Me interesa la propiedad" },
    { id: 2, propertyId: 1, propertyTitle: "Casa en Santiago Centro", applicant: "Juan Pérez", email: "juan@email.com", phone: "987654321", date: "2024-05-08", status: "aprobada", message: "¿Podría visitar?" }
];

let propertyRatings = [
    { propertyId: 1, rating: 5, comment: "Excelente arrendatario", date: "2024-05-01" },
    { propertyId: 1, rating: 4, comment: "Buen trato", date: "2024-04-15" }
];

let recentActivity = [
    { id: 1, type: "solicitud", title: "Nueva solicitud para Casa en Santiago Centro", date: "2024-05-10T10:30:00" },
    { id: 2, type: "solicitud", title: "Solicitud aprobada para Casa en Santiago Centro", date: "2024-05-09T15:20:00" },
    { id: 3, type: "calificacion", title: "Recibiste una calificación de 5 estrellas", date: "2024-05-08T09:45:00" }
];

// ========== ACTUALIZAR ESTADÍSTICAS ==========
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

function updateRequestStatus(requestId, newStatus) {
    const request = receivedRequests.find(r => r.id === requestId);
    if (request) {
        request.status = newStatus;
        
        // Registrar actividad
        recentActivity.unshift({
            id: Date.now(),
            type: "solicitud",
            title: `Solicitud ${newStatus === 'aprobada' ? 'aprobada' : 'rechazada'} para ${request.propertyTitle}`,
            date: new Date().toISOString()
        });
        
        renderRequests();
        renderRecentActivity();
        updateStats();
        showToast(`Solicitud ${newStatus === 'aprobada' ? 'aprobada' : 'rechazada'} correctamente`);
    }
}

function viewRequestDetail(requestId) {
    const request = receivedRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modalBody = document.getElementById('requestModalBody');
    modalBody.innerHTML = `
        <div class="detail-row"><span class="detail-label">Propiedad:</span><span class="detail-value">${request.propertyTitle}</span></div>
        <div class="detail-row"><span class="detail-label">Solicitante:</span><span class="detail-value">${request.applicant}</span></div>
        <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${request.email}</span></div>
        <div class="detail-row"><span class="detail-label">Teléfono:</span><span class="detail-value">${request.phone}</span></div>
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
    
    if (ownerProperties.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-home"></i><p>No hay propiedades publicadas</p></div>';
        return;
    }
    
    container.innerHTML = ownerProperties.map(p => `
        <div class="property-card">
            <div class="property-image"><img src="${p.image}" alt="${p.title}"></div>
            <div class="property-info">
                <h4>${p.title}</h4>
                <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                <div class="property-price">$${p.price.toLocaleString()} /mes</div>
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

function deleteProperty(id) {
    if (confirm('¿Eliminar esta propiedad?')) {
        ownerProperties = ownerProperties.filter(p => p.id !== id);
        renderProperties();
        updateStats();
        showToast('Propiedad eliminada');
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
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
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return formatDate(dateString);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderRecentActivity();
    renderRequests();
    renderProperties();
    
    document.getElementById('requestModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('requestModal')) closeRequestModal();
    });
});

window.updateRequestStatus = updateRequestStatus;
window.viewRequestDetail = viewRequestDetail;
window.closeRequestModal = closeRequestModal;
window.editProperty = editProperty;
window.deleteProperty = deleteProperty;