// ===================== ADMIN PANEL =====================

// Datos simulados - Usuarios
let adminUsers = [
    { id: 1, name: "María González", email: "maria@example.com", phone: "+56 9 1234 5678", joined: "2024-01-15", status: "active" },
    { id: 2, name: "Carlos Rodríguez", email: "carlos@example.com", phone: "+56 9 8765 4321", joined: "2024-02-20", status: "active" },
    { id: 3, name: "Ana Martínez", email: "ana@example.com", phone: "+56 9 1122 3344", joined: "2024-03-10", status: "inactive" },
    { id: 4, name: "Pedro Silva", email: "pedro@example.com", phone: "+56 9 5566 7788", joined: "2024-04-05", status: "active" },
    { id: 5, name: "Laura Fernández", email: "laura@example.com", phone: "+56 9 9988 7766", joined: "2024-05-12", status: "active" }
];

// Datos simulados - Propiedades
let adminProperties = [
    { id: 1, title: "Casa en Santiago Centro", location: "Santiago Centro", owner: "María González", ownerId: 1, price: 500000, date: "2024-03-15", status: "active" },
    { id: 2, title: "Departamento Moderno", location: "Providencia", owner: "Carlos Rodríguez", ownerId: 2, price: 350000, date: "2024-03-20", status: "pending" },
    { id: 3, title: "Casa Familiar", location: "Las Condes", owner: "Ana Martínez", ownerId: 3, price: 600000, date: "2024-04-01", status: "active" },
    { id: 4, title: "Loft Industrial", location: "Ñuñoa", owner: "María González", ownerId: 1, price: 420000, date: "2024-04-10", status: "rejected" },
    { id: 5, title: "Oficina El Golf", location: "Las Condes", owner: "Pedro Silva", ownerId: 4, price: 800000, date: "2024-05-01", status: "pending" }
];

// Datos simulados - Evaluaciones/Reseñas
let adminReviews = [
    { 
        id: 1, 
        propertyId: 1, 
        propertyTitle: "Casa en Santiago Centro", 
        userName: "Juan Pérez", 
        userId: 101,
        date: "2024-05-10",
        rating: 4.5,
        categories: { limpieza: 5, ubicacion: 4, precio: 4, comunicacion: 5 },
        comment: "Excelente propiedad, muy bien ubicada. El dueño fue muy amable y atento. Totalmente recomendable.",
        status: "pending"
    },
    { 
        id: 2, 
        propertyId: 1, 
        propertyTitle: "Casa en Santiago Centro", 
        userName: "Marcela Rojas", 
        userId: 102,
        date: "2024-05-12",
        rating: 5.0,
        categories: { limpieza: 5, ubicacion: 5, precio: 5, comunicacion: 5 },
        comment: "Una maravilla de casa, superó mis expectativas. Muy limpia y acogedora.",
        status: "approved"
    },
    { 
        id: 3, 
        propertyId: 2, 
        propertyTitle: "Departamento Moderno", 
        userName: "Felipe González", 
        userId: 103,
        date: "2024-05-14",
        rating: 3.0,
        categories: { limpieza: 4, ubicacion: 3, precio: 2, comunicacion: 3 },
        comment: "El departamento es bonito pero el precio me pareció un poco alto para lo que ofrece.",
        status: "pending"
    },
    { 
        id: 4, 
        propertyId: 3, 
        propertyTitle: "Casa Familiar", 
        userName: "Claudia Méndez", 
        userId: 104,
        date: "2024-05-15",
        rating: 5.0,
        categories: { limpieza: 5, ubicacion: 5, precio: 5, comunicacion: 5 },
        comment: "Casa espectacular, muy amplia y con todas las comodidades. El jardín es hermoso.",
        status: "approved"
    },
    { 
        id: 5, 
        propertyId: 4, 
        propertyTitle: "Loft Industrial", 
        userName: "Andrés Castro", 
        userId: 105,
        date: "2024-05-16",
        rating: 2.0,
        categories: { limpieza: 2, ubicacion: 1, precio: 2, comunicacion: 3 },
        comment: "El loft no estaba en las mejores condiciones. La ubicación no es tan buena como decía.",
        status: "rejected"
    }
];

// Variables de paginación
let currentUsersPage = 1;
let currentPropertiesPage = 1;
let currentReviewsPage = 1;
const itemsPerPage = 10;

// Variables de filtro
let currentPropertyFilter = "all";
let currentUserSearch = "";
let currentPropertySearch = "";
let currentReviewFilter = "all";
let currentReviewSearch = "";
let currentSelectedReviewId = null;

// ===================== INICIALIZAR =====================
function initAdmin() {
    loadDataFromStorage();
    updateStats();
    renderUsers();
    renderProperties();
    renderRecentProperties();
    renderReviews();
    initNavigation();
    initEventListeners();
}

// Cargar datos desde localStorage
function loadDataFromStorage() {
    if (localStorage.getItem('adminUsers')) {
        adminUsers = JSON.parse(localStorage.getItem('adminUsers'));
    }
    if (localStorage.getItem('adminProperties')) {
        adminProperties = JSON.parse(localStorage.getItem('adminProperties'));
    }
    if (localStorage.getItem('adminReviews')) {
        adminReviews = JSON.parse(localStorage.getItem('adminReviews'));
    }
}

// Guardar datos en localStorage
function saveUsers() {
    localStorage.setItem('adminUsers', JSON.stringify(adminUsers));
}

function saveProperties() {
    localStorage.setItem('adminProperties', JSON.stringify(adminProperties));
}

function saveReviews() {
    localStorage.setItem('adminReviews', JSON.stringify(adminReviews));
}

// ===================== ACTUALIZAR ESTADÍSTICAS =====================
function updateStats() {
    const totalUsers = adminUsers.length;
    const totalProperties = adminProperties.length;
    const pendingReviews = adminReviews.filter(r => r.status === "pending").length;
    
    document.getElementById('statUsers').textContent = totalUsers;
    document.getElementById('statProperties').textContent = totalProperties;
    document.getElementById('statReviews').textContent = pendingReviews;
    
    document.getElementById('usersCount').textContent = totalUsers;
    document.getElementById('propertiesCount').textContent = totalProperties;
    document.getElementById('reviewsCount').textContent = pendingReviews;
}

// ===================== RENDERIZAR PROPIEDADES RECIENTES =====================
function renderRecentProperties() {
    const container = document.getElementById('recentPropertiesTable');
    if (!container) return;
    
    const recent = [...adminProperties].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    container.innerHTML = recent.map(prop => `
        <tr>
            <td>${prop.title}</td>
            <td>${prop.owner}</td>
            <td>${formatDate(prop.date)}</td>
            <td><span class="status-badge status-${prop.status}">${getStatusText(prop.status)}</span></td>
            <td class="action-btns">
                <button class="btn-icon btn-view" onclick="viewProperty(${prop.id})"><i class="bi bi-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

// ===================== RENDERIZAR USUARIOS =====================
function renderUsers() {
    const container = document.getElementById('usersTable');
    if (!container) return;
    
    let filtered = adminUsers.filter(user => 
        user.name.toLowerCase().includes(currentUserSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(currentUserSearch.toLowerCase())
    );
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentUsersPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    if (paginated.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>`;
        document.getElementById('usersPagination').innerHTML = '';
        return;
    }
    
    container.innerHTML = paginated.map(user => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${formatDate(user.joined)}</td>
            <td><span class="status-badge status-${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td class="action-btns">
                <button class="btn-icon btn-view" onclick="viewUser(${user.id})"><i class="bi bi-eye"></i></button>
                <button class="btn-icon ${user.status === 'active' ? 'btn-block' : 'btn-approve'}" onclick="toggleUserStatus(${user.id})">
                    <i class="bi bi-${user.status === 'active' ? 'ban' : 'check-circle'}"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('usersPagination', totalPages, currentUsersPage, 'users');
}

// ===================== RENDERIZAR PROPIEDADES =====================
function renderProperties() {
    const container = document.getElementById('propertiesTable');
    if (!container) return;
    
    let filtered = adminProperties.filter(prop => {
        const matchFilter = currentPropertyFilter === 'all' || prop.status === currentPropertyFilter;
        const matchSearch = prop.title.toLowerCase().includes(currentPropertySearch.toLowerCase()) ||
                        prop.location.toLowerCase().includes(currentPropertySearch.toLowerCase()) ||
                        prop.owner.toLowerCase().includes(currentPropertySearch.toLowerCase());
        return matchFilter && matchSearch;
    });
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPropertiesPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    if (paginated.length === 0) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">No hay propiedades registradas</td></tr>`;
        document.getElementById('propertiesPagination').innerHTML = '';
        return;
    }
    
    container.innerHTML = paginated.map(prop => `
        <tr>
            <td><strong>${prop.title}</strong></td>
            <td>${prop.location}</td>
            <td>${prop.owner}</td>
            <td>$${prop.price.toLocaleString()}</td>
            <td>${formatDate(prop.date)}</td>
            <td><span class="status-badge status-${prop.status}">${getStatusText(prop.status)}</span></td>
            <td class="action-btns">
                <button class="btn-icon btn-view" onclick="viewProperty(${prop.id})"><i class="bi bi-eye"></i></button>
                ${prop.status === 'pending' ? `
                    <button class="btn-icon btn-approve" onclick="approveProperty(${prop.id})"><i class="bi bi-check-lg"></i></button>
                    <button class="btn-icon btn-reject" onclick="rejectProperty(${prop.id})"><i class="bi bi-x-lg"></i></button>
                ` : ''}
                <button class="btn-icon btn-delete" onclick="deleteProperty(${prop.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('propertiesPagination', totalPages, currentPropertiesPage, 'properties');
}

// ===================== RENDERIZAR EVALUACIONES =====================
function renderReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    let filtered = adminReviews.filter(review => {
        const matchFilter = currentReviewFilter === 'all' || review.status === currentReviewFilter;
        const matchSearch = review.propertyTitle.toLowerCase().includes(currentReviewSearch.toLowerCase()) ||
                        review.userName.toLowerCase().includes(currentReviewSearch.toLowerCase()) ||
                        review.comment.toLowerCase().includes(currentReviewSearch.toLowerCase());
        return matchFilter && matchSearch;
    });
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentReviewsPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    // Actualizar resumen
    const totalReviews = adminReviews.length;
    const pendingReviews = adminReviews.filter(r => r.status === "pending").length;
    const avgRating = (adminReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1);
    
    document.getElementById('totalReviewsCount').textContent = totalReviews;
    document.getElementById('pendingReviewsCount').textContent = pendingReviews;
    document.getElementById('avgRating').textContent = avgRating;
    
    if (paginated.length === 0) {
        container.innerHTML = `<div class="text-center py-5">No hay evaluaciones</div>`;
        document.getElementById('reviewsPagination').innerHTML = '';
        return;
    }
    
    container.innerHTML = paginated.map(review => `
        <div class="review-card ${review.status}" onclick="openReviewModal(${review.id})">
            <div class="review-header">
                <div>
                    <div class="review-property">
                        <i class="bi bi-building"></i> ${review.propertyTitle}
                    </div>
                    <div class="review-user">
                        <i class="bi bi-person-circle"></i> ${review.userName}
                    </div>
                </div>
                <div class="review-stars">
                    ${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))}
                    <span style="color: #4a6272; font-size: 0.8rem;">(${review.rating})</span>
                </div>
            </div>
            <div class="review-categories">
                ${Object.entries(review.categories).map(([cat, val]) => `
                    <div class="category-rating">
                        <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}:</span>
                        <span class="stars">${'★'.repeat(val)}${'☆'.repeat(5 - val)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="review-comment">
                "${review.comment.substring(0, 150)}${review.comment.length > 150 ? '...' : ''}"
            </div>
            <div class="review-footer">
                <span><i class="bi bi-calendar"></i> ${formatDate(review.date)}</span>
                <span class="review-status-badge status-${review.status}-badge">
                    ${review.status === 'pending' ? 'Pendiente' : review.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                </span>
                <div class="review-actions" onclick="event.stopPropagation()">
                    ${review.status === 'pending' ? `
                        <button class="btn-sm-approve" onclick="approveReview(${review.id})"><i class="bi bi-check-lg"></i> Aprobar</button>
                        <button class="btn-sm-reject" onclick="rejectReview(${review.id})"><i class="bi bi-x-lg"></i> Rechazar</button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    renderPagination('reviewsPagination', totalPages, currentReviewsPage, 'reviews');
}

// ===================== FUNCIONES CRUD USUARIOS =====================
window.viewUser = function(id) {
    const user = adminUsers.find(u => u.id === id);
    if (!user) return;
    
    const modalBody = document.getElementById('userModalBody');
    modalBody.innerHTML = `
        <div class="user-details">
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Teléfono:</strong> ${user.phone}</p>
            <p><strong>Miembro desde:</strong> ${formatDate(user.joined)}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></p>
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('userModal')).show();
};

window.toggleUserStatus = function(id) {
    const user = adminUsers.find(u => u.id === id);
    if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        saveUsers();
        renderUsers();
        updateStats();
        showToast(`Usuario ${user.status === 'active' ? 'activado' : 'bloqueado'} correctamente`);
    }
};

window.deleteUser = function(id) {
    if (confirm('¿Eliminar este usuario permanentemente?')) {
        adminUsers = adminUsers.filter(u => u.id !== id);
        saveUsers();
        renderUsers();
        updateStats();
        showToast('Usuario eliminado correctamente');
    }
};

// ===================== FUNCIONES CRUD PROPIEDADES =====================
window.viewProperty = function(id) {
    const property = adminProperties.find(p => p.id === id);
    if (!property) return;
    
    const modalBody = document.getElementById('propertyModalBody');
    modalBody.innerHTML = `
        <div class="property-details">
            <p><strong>Título:</strong> ${property.title}</p>
            <p><strong>Ubicación:</strong> ${property.location}</p>
            <p><strong>Propietario:</strong> ${property.owner}</p>
            <p><strong>Precio:</strong> $${property.price.toLocaleString()}/mes</p>
            <p><strong>Fecha publicación:</strong> ${formatDate(property.date)}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-${property.status}">${getStatusText(property.status)}</span></p>
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('propertyModal')).show();
};

window.approveProperty = function(id) {
    const property = adminProperties.find(p => p.id === id);
    if (property && property.status === 'pending') {
        property.status = 'active';
        saveProperties();
        renderProperties();
        renderRecentProperties();
        updateStats();
        showToast('Propiedad aprobada correctamente');
    }
};

window.rejectProperty = function(id) {
    const property = adminProperties.find(p => p.id === id);
    if (property && property.status === 'pending') {
        property.status = 'rejected';
        saveProperties();
        renderProperties();
        renderRecentProperties();
        updateStats();
        showToast('Propiedad rechazada');
    }
};

window.deleteProperty = function(id) {
    if (confirm('¿Eliminar esta propiedad permanentemente?')) {
        adminProperties = adminProperties.filter(p => p.id !== id);
        saveProperties();
        renderProperties();
        renderRecentProperties();
        updateStats();
        showToast('Propiedad eliminada correctamente');
    }
};

// ===================== FUNCIONES CRUD EVALUACIONES =====================
window.openReviewModal = function(id) {
    const review = adminReviews.find(r => r.id === id);
    if (!review) return;
    
    currentSelectedReviewId = id;
    
    const modalBody = document.getElementById('reviewModalBody');
    modalBody.innerHTML = `
        <div class="review-details">
            <p><strong>Propiedad:</strong> ${review.propertyTitle}</p>
            <p><strong>Usuario:</strong> ${review.userName}</p>
            <p><strong>Fecha:</strong> ${formatDate(review.date)}</p>
            <p><strong>Calificación:</strong> ${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))} (${review.rating})</p>
            <div class="review-categories-modal">
                <strong>Categorías:</strong>
                ${Object.entries(review.categories).map(([cat, val]) => `
                    <div>${cat}: ${'★'.repeat(val)}${'☆'.repeat(5 - val)}</div>
                `).join('')}
            </div>
            <p><strong>Comentario:</strong></p>
            <p class="review-full-comment">${review.comment}</p>
            <p><strong>Estado actual:</strong> <span class="review-status-badge status-${review.status}-badge">${review.status}</span></p>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    
    // Configurar botones del modal
    const approveBtn = document.getElementById('approveReviewBtn');
    const rejectBtn = document.getElementById('rejectReviewBtn');
    
    const newApproveBtn = approveBtn.cloneNode(true);
    const newRejectBtn = rejectBtn.cloneNode(true);
    approveBtn.parentNode.replaceChild(newApproveBtn, approveBtn);
    rejectBtn.parentNode.replaceChild(newRejectBtn, rejectBtn);
    
    newApproveBtn.onclick = () => {
        approveReview(id);
        modal.hide();
    };
    
    newRejectBtn.onclick = () => {
        rejectReview(id);
        modal.hide();
    };
    
    modal.show();
};

window.approveReview = function(id) {
    const review = adminReviews.find(r => r.id === id);
    if (review && review.status === 'pending') {
        review.status = 'approved';
        saveReviews();
        renderReviews();
        updateStats();
        showToast('Evaluación aprobada y publicada');
    }
};

window.rejectReview = function(id) {
    const review = adminReviews.find(r => r.id === id);
    if (review && review.status === 'pending') {
        review.status = 'rejected';
        saveReviews();
        renderReviews();
        updateStats();
        showToast('Evaluación rechazada');
    }
};

// ===================== FUNCIONES UTILITARIAS =====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
}

function getStatusText(status) {
    const statusMap = {
        'active': 'Activa',
        'pending': 'Pendiente',
        'rejected': 'Rechazada',
        'inactive': 'Inactivo'
    };
    return statusMap[status] || status;
}

function renderPagination(containerId, totalPages, currentPage, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}" data-type="${type}">${i}</button>`;
    }
    container.innerHTML = html;
    
    document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page);
            if (type === 'users') {
                currentUsersPage = page;
                renderUsers();
            } else if (type === 'properties') {
                currentPropertiesPage = page;
                renderProperties();
            } else if (type === 'reviews') {
                currentReviewsPage = page;
                renderReviews();
            }
        });
    });
}

// ===================== FILTROS =====================
document.getElementById('propertyStatusFilter')?.addEventListener('change', (e) => {
    currentPropertyFilter = e.target.value;
    currentPropertiesPage = 1;
    renderProperties();
});

document.getElementById('searchUser')?.addEventListener('input', (e) => {
    currentUserSearch = e.target.value;
    currentUsersPage = 1;
    renderUsers();
});

document.getElementById('searchProperty')?.addEventListener('input', (e) => {
    currentPropertySearch = e.target.value;
    currentPropertiesPage = 1;
    renderProperties();
});

document.getElementById('reviewStatusFilter')?.addEventListener('change', (e) => {
    currentReviewFilter = e.target.value;
    currentReviewsPage = 1;
    renderReviews();
});

document.getElementById('searchReview')?.addEventListener('input', (e) => {
    currentReviewSearch = e.target.value;
    currentReviewsPage = 1;
    renderReviews();
});

// ===================== NAVEGACIÓN =====================
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = item.getAttribute('data-section');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(`${sectionId}-section`).classList.add('active');
        });
    });
}

function initEventListeners() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'logout.html';
        });
    }
}

// ===================== TOAST =====================
function showToast(message, isError = false) {
    const toast = document.getElementById('adminToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#dc3545';
        if (toastHeader) {
            toastHeader.querySelector('i').className = 'bi bi-exclamation-triangle-fill';
            toastHeader.querySelector('i').style.color = '#dc3545';
            toastHeader.querySelector('strong').textContent = 'Error';
        }
    } else {
        toast.style.borderLeftColor = '#2C5A6E';
        if (toastHeader) {
            toastHeader.querySelector('i').className = 'bi bi-check-circle-fill';
            toastHeader.querySelector('i').style.color = '#2C5A6E';
            toastHeader.querySelector('strong').textContent = 'Éxito';
        }
    }
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ===================== INICIALIZAR =====================
document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});