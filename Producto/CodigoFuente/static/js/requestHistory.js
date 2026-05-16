// ========== VARIABLES GLOBALES ==========
let allRequests = [];
let filteredRequests = [];
let currentPage = 1;
const itemsPerPage = 10;

// ========== CARGAR SOLICITUDES ==========
function loadRequests() {
    const storedRequests = localStorage.getItem('rentRequests');
    if (storedRequests) {
        allRequests = JSON.parse(storedRequests);
    } else {
        // Datos de ejemplo para demostración
        allRequests = [
            {
                id: 1,
                propertyId: 1,
                propertyTitle: "Casa en Santiago Centro",
                propertyLocation: "Santiago Centro, Santiago",
                propertyPrice: 500000,
                propertyImage: "assets/image/casa1.png",
                fullName: "María González",
                rut: "12.345.678-9",
                email: "maria@ejemplo.com",
                phone: "912345678",
                startDate: "2024-06-01",
                duration: "12 meses",
                occupants: "2 personas",
                pets: "no",
                employment: "Trabajador dependiente",
                income: 1200000,
                message: "Me interesa mucho la propiedad",
                status: "pendiente",
                date: "2024-05-10T10:30:00.000Z"
            },
            {
                id: 2,
                propertyId: 2,
                propertyTitle: "Departamento Moderno",
                propertyLocation: "Providencia, Santiago",
                propertyPrice: 350000,
                propertyImage: "assets/image/casa2.png",
                fullName: "Juan Pérez",
                rut: "11.111.111-1",
                email: "juan@ejemplo.com",
                phone: "987654321",
                startDate: "2024-05-15",
                duration: "6 meses",
                occupants: "1 persona",
                pets: "si",
                employment: "Trabajador independiente",
                income: 800000,
                message: "",
                status: "aprobada",
                date: "2024-05-05T15:20:00.000Z"
            }
        ];
        localStorage.setItem('rentRequests', JSON.stringify(allRequests));
    }
    
    applyFilters();
}

// ========== APLICAR FILTROS ==========
function applyFilters() {
    const status = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchFilter').value.toLowerCase().trim();
    
    filteredRequests = allRequests.filter(request => {
        if (status !== 'todos' && request.status !== status) return false;
        if (searchTerm && !request.propertyTitle.toLowerCase().includes(searchTerm)) return false;
        return true;
    });
    
    currentPage = 1;
    renderRequests();
}

// ========== RENDERIZAR SOLICITUDES ==========
function renderRequests() {
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filteredRequests.slice(start, start + itemsPerPage);
    
    const container = document.getElementById('requestsList');
    const emptyState = document.getElementById('emptyState');
    const paginationDiv = document.getElementById('pagination');
    
    if (paginated.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        paginationDiv.innerHTML = '';
        return;
    }
    
    emptyState.style.display = 'none';
    
    container.innerHTML = paginated.map(request => `
        <div class="request-card" onclick="openDetailModal(${request.id})">
            <div class="request-header">
                <div class="request-title">
                    <img src="${request.propertyImage || 'assets/image/default-house.jpg'}" alt="${request.propertyTitle}" class="request-image">
                    <div class="request-info">
                        <h3>${request.propertyTitle}</h3>
                        <div class="request-location">
                            <i class="fas fa-map-marker-alt"></i> ${request.propertyLocation}
                        </div>
                    </div>
                </div>
                <span class="request-status ${request.status}">
                    ${getStatusText(request.status)}
                </span>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Inicio: ${formatDate(request.startDate)}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-clock"></i>
                    <span>Duración: ${request.duration}</span>
                </div>
                <div class="request-detail">
                    <i class="fas fa-dollar-sign"></i>
                    <span>$${request.propertyPrice.toLocaleString()}/mes</span>
                </div>
            </div>
            <div class="request-footer">
                <span class="request-date">
                    <i class="fas fa-clock"></i> Solicitud: ${formatRelativeDate(request.date)}
                </span>
                <button class="btn-view-detail" onclick="event.stopPropagation(); openDetailModal(${request.id})">
                    Ver detalles <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationDiv = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHtml = '';
    
    paginationHtml += `<button class="page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Anterior
    </button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHtml += `<span class="page-dots">...</span>`;
        }
    }
    
    paginationHtml += `<button class="page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Siguiente <i class="fas fa-chevron-right"></i>
    </button>`;
    
    paginationDiv.innerHTML = paginationHtml;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderRequests();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

// ========== MODAL DE DETALLES ==========
function openDetailModal(requestId) {
    const request = allRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Propiedad:</span>
            <span class="detail-value">${request.propertyTitle}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ubicación:</span>
            <span class="detail-value">${request.propertyLocation}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Valor mensual:</span>
            <span class="detail-value">$${request.propertyPrice.toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Solicitante:</span>
            <span class="detail-value">${request.fullName}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">RUT:</span>
            <span class="detail-value">${request.rut}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Correo:</span>
            <span class="detail-value">${request.email}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span class="detail-value">${request.phone}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Fecha inicio:</span>
            <span class="detail-value">${formatDate(request.startDate)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Duración:</span>
            <span class="detail-value">${request.duration}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ocupantes:</span>
            <span class="detail-value">${request.occupants}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Mascotas:</span>
            <span class="detail-value">${request.pets === 'si' ? 'Sí' : 'No'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Situación laboral:</span>
            <span class="detail-value">${request.employment}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Ingreso mensual:</span>
            <span class="detail-value">$${parseInt(request.income).toLocaleString()}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="detail-value" style="font-weight: 600; color: ${getStatusColor(request.status)}">
                ${getStatusText(request.status)}
            </span>
        </div>
        ${request.message ? `
        <div class="detail-row">
            <span class="detail-label">Mensaje:</span>
            <span class="detail-value">${request.message}</span>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('active');
}

function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.classList.remove('active');
}

// ========== FUNCIONES UTILITARIAS ==========
function getStatusText(status) {
    const statusMap = {
        'pendiente': 'Pendiente',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada',
        'finalizada': 'Finalizada'
    };
    return statusMap[status] || status;
}

function getStatusColor(status) {
    const colorMap = {
        'pendiente': '#856404',
        'aprobada': '#155724',
        'rechazada': '#721c24',
        'finalizada': '#6c7f8b'
    };
    return colorMap[status] || '#1F3B4C';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast.querySelector('.toast-header');
    
    if (toastMessage) toastMessage.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#dc3545';
        const icon = toastHeader?.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-exclamation-triangle-fill';
            icon.style.color = '#dc3545';
        }
        const strong = toastHeader?.querySelector('strong');
        if (strong) strong.textContent = 'Error';
    } else {
        toast.style.borderLeftColor = '#2C5A6E';
        const icon = toastHeader?.querySelector('i');
        if (icon) {
            icon.className = 'bi bi-check-circle-fill';
            icon.style.color = '#2C5A6E';
        }
        const strong = toastHeader?.querySelector('strong');
        if (strong) strong.textContent = 'Éxito';
    }
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    loadRequests();
    
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('searchFilter').addEventListener('input', applyFilters);
    document.getElementById('clearFiltersBtn').addEventListener('click', function() {
        document.getElementById('statusFilter').value = 'todos';
        document.getElementById('searchFilter').value = '';
        applyFilters();
        showToast('Filtros limpiados');
    });
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeDetailModal();
        }
    });
});