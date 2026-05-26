// ===================== ADMIN PANEL =====================
const ADMIN_EMAIL = "admin@duoc.cl";

function getLoggedUserEmail() {
    const savedData = localStorage.getItem("userData") || localStorage.getItem("userProfile");

    if (savedData) {
        try {
            const userData = JSON.parse(savedData);
            return (userData.mail || userData.email || "").trim().toLowerCase();
        } catch (error) {
            console.error("Error parseando datos de usuario admin", error);
        }
    }

    return (localStorage.getItem("userEmail") || "").trim().toLowerCase();
}

function requireAdminSession() {
    if (getLoggedUserEmail() !== ADMIN_EMAIL) {
        window.location.replace("home.html");
        return false;
    }

    return true;
}

function clearAdminSessionData() {
    localStorage.removeItem("userData");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    sessionStorage.removeItem("isLoggedIn");

    document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie.replace(/^ +/, "").replace(
            /=.*/,
            "=;expires=" + new Date().toUTCString() + ";path=/",
        );
    });
}

async function logoutAdmin() {
    try {
        await fetch("/api/users/logout", {
            method: "POST",
            credentials: "same-origin",
        });
    } catch (error) {
        console.error("Error cerrando sesion admin:", error);
    } finally {
        clearAdminSessionData();
        window.location.replace("home.html");
    }
}

// Usuarios cargados desde la base de datos
let adminUsers = [];

// Propiedades cargadas desde la base de datos
let adminProperties = [];

// Evaluaciones cargadas desde la base de datos
let adminReviews = [];

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
let usersLoadError = "";
let propertiesLoadError = "";
let reviewsLoadError = "";

// ===================== DATOS DEL GRÁFICO =====================
// Datos simulados de visualizaciones e interesados por propiedad
let propertyStats = [
    { id: 1, title: "Casa en Santiago Centro", views: 245, interested: 12 },
    { id: 2, title: "Departamento Moderno", views: 189, interested: 8 },
    { id: 3, title: "Casa Familiar", views: 312, interested: 15 },
    { id: 4, title: "Loft Industrial", views: 156, interested: 5 },
    { id: 5, title: "Oficina El Golf", views: 98, interested: 3 }
];

let chartInstance = null;

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getUserFullName(user) {
    const parts = [
        user.first_name,
        user.second_name,
        user.first_last_name,
        user.second_last_name,
    ].filter(Boolean);

    return parts.join(" ").trim() || user.name || user.nombre || "Sin nombre";
}

function normalizeUser(user, index) {
    return {
        raw: user,
        id: user.id_usuario || user.id || user.id_user || user.user_id || index + 1,
        name: getUserFullName(user),
        email: user.mail || user.email || user.correo || "Sin correo",
        phone: user.fono || user.phone || user.telefono || "Sin telefono",
        joined: user.date_register || user.created_at || user.createdAt || user.date_created || user.joined || "",
        status: user.status || user.estado || "active",
    };
}

function showUsersLoading() {
    const container = document.getElementById('usersTable');
    if (container) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">Cargando usuarios...</td></tr>`;
    }
}

async function loadUsersFromDatabase() {
    showUsersLoading();
    usersLoadError = "";

    try {
        const response = await fetch("/api/users", {
            method: "GET",
            credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.error || "No se pudieron obtener los usuarios");
        }

        const users = Array.isArray(result.data) ? result.data : [];
        adminUsers = users.map(normalizeUser);
    } catch (error) {
        console.error("Error cargando usuarios desde la base de datos:", error);
        adminUsers = [];
        usersLoadError = error.message || "No se pudieron cargar los usuarios";
        const container = document.getElementById('usersTable');
        if (container) {
            container.innerHTML = `<tr><td colspan="7" class="text-center">No se pudieron cargar los usuarios registrados</td></tr>`;
        }
        showToast(usersLoadError, true);
    }
}

// ===================== CARGAR PROPIEDADES =====================
function normalizePropertyStatus(status) {
    const normalized = String(status || "Disponible")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();

    if (["pendiente", "pending"].includes(normalized)) return "pending";
    if (["rechazada", "rechazado", "rejected"].includes(normalized)) return "rejected";
    if (["inactiva", "inactivo", "no disponible", "vendida", "vendido", "inactive"].includes(normalized)) return "inactive";
    return "active";
}

function getPropertyLocation(property) {
    const address = property.direccion || property.address || {};
    const parts = [
        property.location,
        property.ubicacion,
        address.comuna,
        address.city,
        address.state,
    ].filter(Boolean);

    return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getPropertyOwner(property) {
    const user = property.usuario || property.user || property.owner || {};
    const parts = [
        user.first_name,
        user.second_name,
        user.first_last_name,
        user.second_last_name,
    ].filter(Boolean);

    return parts.join(" ").trim()
        || property.owner_name
        || property.propietario
        || user.name
        || user.mail
        || "Sin propietario";
}

function normalizeProperty(property, index) {
    const characteristic = property.caracteristica || property.characteristic || {};
    const id = property.id_propi || property.id || property.property_id || index + 1;
    const stateText = property.state_desc || property.status_desc || property.estado || property.status || "Disponible";

    return {
        raw: property,
        id,
        title: property.title || property.titulo || property.name || property.type_desc || `Propiedad ${id}`,
        location: getPropertyLocation(property),
        owner: getPropertyOwner(property),
        price: Number(characteristic.price ?? property.price ?? property.precio ?? 0),
        date: property.date_register || property.created_at || property.createdAt || property.date_created || property.date || "",
        status: normalizePropertyStatus(stateText),
        statusText: stateText,
        type: property.type_desc || "Sin tipo",
        totalMeters: characteristic.total_mtr ?? null,
        usableMeters: characteristic.surface_mtr ?? null,
        rooms: characteristic.qty_room ?? null,
        bathrooms: characteristic.qty_bath ?? null,
    };
}

function showPropertiesLoading() {
    const container = document.getElementById('propertiesTable');
    if (container) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">Cargando propiedades...</td></tr>`;
    }
}

async function loadPropertiesFromDatabase() {
    showPropertiesLoading();
    propertiesLoadError = "";
    adminProperties = [];

    try {
        const response = await fetch("/api/properties", {
            method: "GET",
            credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudieron obtener las propiedades");
        }

        const properties = Array.isArray(result.data) ? result.data : [];
        adminProperties = properties.map(normalizeProperty);
    } catch (error) {
        console.error("Error cargando propiedades desde la base de datos:", error);
        adminProperties = [];
        propertiesLoadError = error.message || "No se pudieron cargar las propiedades";
        const container = document.getElementById('propertiesTable');
        if (container) {
            container.innerHTML = `<tr><td colspan="7" class="text-center">No se pudieron cargar las propiedades registradas</td></tr>`;
        }
        showToast(propertiesLoadError, true);
    }
}

// Función para inicializar el gráfico
function normalizeTenantReview(review) {
    return {
        raw: review,
        id: review.id_review || review.id || Date.now(),
        propertyTitle: "Evaluacion de arrendatario",
        userName: "Arrendatario",
        date: review.date_review || review.date || "",
        rating: Number(review.total_rank || 0),
        categories: {
            pagos: Number(review.pay_rank || 0),
            limpieza: Number(review.clean_rank || 0),
            respeto: Number(review.respect_rank || 0),
            comunicacion: Number(review.comunic_rank || 0),
            ruido: Number(review.noise_rank || 0),
            responsabilidad: Number(review.respons_rank || 0),
            experiencia: Number(review.exp_rank || 0),
        },
        comment: review.comment || "Sin comentario",
        status: "pending",
    };
}

async function loadReviewsFromDatabase() {
    reviewsLoadError = "";
    adminReviews = [];

    try {
        const response = await fetch("/api/tenant-reviews", {
            method: "GET",
            credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudieron obtener las evaluaciones");
        }

        const reviews = Array.isArray(result.data) ? result.data : [];
        adminReviews = reviews.map(normalizeTenantReview);
    } catch (error) {
        console.error("Error cargando evaluaciones desde la base de datos:", error);
        adminReviews = [];
        reviewsLoadError = error.message || "No se pudieron cargar las evaluaciones";
        showToast(reviewsLoadError, true);
    }
}
function initPropertiesChart() {
    const ctx = document.getElementById('propertiesChart');
    if (!ctx) return;
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const savedStats = localStorage.getItem('propertyStats');
    if (savedStats) {
        propertyStats = JSON.parse(savedStats);
    }
    
    const propertyNames = propertyStats.map(stat => stat.title);
    const viewsData = propertyStats.map(stat => stat.views);
    const interestedData = propertyStats.map(stat => stat.interested);
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: propertyNames,
            datasets: [
                {
                    label: 'Visualizaciones',
                    data: viewsData,
                    backgroundColor: '#2C5A6E',
                    borderColor: '#1F3B4C',
                    borderWidth: 1,
                    borderRadius: 8,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                },
                {
                    label: 'Interesados',
                    data: interestedData,
                    backgroundColor: '#ff9800',
                    borderColor: '#e68900',
                    borderWidth: 1,
                    borderRadius: 8,
                    barPercentage: 0.6,
                    categoryPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        usePointStyle: true,
                        boxWidth: 10
                    }
                },
                tooltip: {
                    backgroundColor: '#1F3B4C',
                    titleColor: '#fff',
                    bodyColor: '#e9f0f5',
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let value = context.raw;
                            return `${label}: ${value.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#eef2f5' },
                    title: {
                        display: true,
                        text: 'Cantidad',
                        color: '#6c7f8b'
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

function updatePropertyStats(propertyId, viewsIncrement = 0, interestedIncrement = 0) {
    const property = propertyStats.find(p => p.id === propertyId);
    if (property) {
        if (viewsIncrement) property.views += viewsIncrement;
        if (interestedIncrement) property.interested += interestedIncrement;
        localStorage.setItem('propertyStats', JSON.stringify(propertyStats));
        initPropertiesChart();
    }
}

function simulateRandomData() {
    propertyStats = propertyStats.map(prop => ({
        ...prop,
        views: Math.max(0, prop.views + Math.floor(Math.random() * 20) - 5),
        interested: Math.max(0, prop.interested + Math.floor(Math.random() * 3) - 1)
    }));
    localStorage.setItem('propertyStats', JSON.stringify(propertyStats));
    initPropertiesChart();
}

let intervalSimulation = null;

function startSimulation() {
    if (intervalSimulation) clearInterval(intervalSimulation);
    intervalSimulation = setInterval(() => {
        simulateRandomData();
    }, 30000);
}

function stopSimulation() {
    if (intervalSimulation) {
        clearInterval(intervalSimulation);
        intervalSimulation = null;
    }
}

// ===================== INICIALIZAR =====================
async function initAdmin() {
    initNavigation();
    initEventListeners();
    loadDataFromStorage();
    await Promise.all([
        loadUsersFromDatabase(),
        loadPropertiesFromDatabase(),
        loadReviewsFromDatabase(),
    ]);
    updateStats();
    renderUsers();
    renderProperties();
    renderRecentProperties();
    renderReviews();
    initPropertiesChart(); 
    loadPropertyStats();    
}

function loadPropertyStats() {
    const savedStats = localStorage.getItem('propertyStats');
    if (savedStats) {
        propertyStats = JSON.parse(savedStats);
    } else {
        localStorage.setItem('propertyStats', JSON.stringify(propertyStats));
    }
}

function loadDataFromStorage() {
}

function saveUsers() {
    renderUsers();
    updateStats();
}

function saveProperties() {
    renderProperties();
    renderRecentProperties();
    updateStats();
}

function saveReviews() {
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
            <td>${escapeHtml(prop.title)}</td>
            <td>${escapeHtml(prop.owner)}</td>
            <td>${formatDate(prop.date)}</td>
            <td><span class="status-badge status-${prop.status}">${escapeHtml(prop.statusText || getStatusText(prop.status))}</span></td>
            <td class="action-btns">
                <button class="btn-icon btn-view" onclick="viewProperty(${prop.id})"><i class="bi bi-eye"></i></button>
            </td>
        </tr>
    `).join('');
}

// ===================== RENDERIZAR USUARIOS =====================
// Se eliminó el botón de visualizar (ojo)
function renderUsers() {
    const container = document.getElementById('usersTable');
    if (!container) return;

    if (usersLoadError) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">${escapeHtml(usersLoadError)}</td></tr>`;
        document.getElementById('usersPagination').innerHTML = '';
        return;
    }
    
    let filtered = adminUsers.filter(user => 
        String(user.name || "").toLowerCase().includes(currentUserSearch.toLowerCase()) ||
        String(user.email || "").toLowerCase().includes(currentUserSearch.toLowerCase())
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
            <td>${escapeHtml(user.id)}</td>
            <td><strong>${escapeHtml(user.name)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${escapeHtml(user.phone)}</td>
            <td>${formatDate(user.joined)}</td>
            <td><span class="status-badge status-${user.status}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
            <td class="action-btns">
                <!-- Botón de visualizar ELIMINADO -->
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
// Se eliminaron los botones de aprobar y rechazar
function renderProperties() {
    const container = document.getElementById('propertiesTable');
    if (!container) return;

    if (propertiesLoadError) {
        container.innerHTML = `<tr><td colspan="7" class="text-center">${escapeHtml(propertiesLoadError)}</td></tr>`;
        document.getElementById('propertiesPagination').innerHTML = '';
        return;
    }
    
    let filtered = adminProperties.filter(prop => {
        const matchFilter = currentPropertyFilter === 'all' || prop.status === currentPropertyFilter;
        const search = currentPropertySearch.toLowerCase();
        const matchSearch = String(prop.title || "").toLowerCase().includes(search) ||
                        String(prop.location || "").toLowerCase().includes(search) ||
                        String(prop.owner || "").toLowerCase().includes(search);
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
            <td><strong>${escapeHtml(prop.title)}</strong></td>
            <td>${escapeHtml(prop.location)}</td>
            <td>${escapeHtml(prop.owner)}</td>
            <td>$${Number(prop.price || 0).toLocaleString()}</td>
            <td>${formatDate(prop.date)}</td>
            <td><span class="status-badge status-${prop.status}">${escapeHtml(prop.statusText || getStatusText(prop.status))}</span></td>
            <td class="action-btns">
                <!-- Botones de aprobar y rechazar ELIMINADOS -->
                <button class="btn-icon btn-view" onclick="viewProperty(${prop.id})"><i class="bi bi-eye"></i></button>
                <button class="btn-icon btn-delete" onclick="deleteProperty(${prop.id})"><i class="bi bi-trash"></i></button>
            </td>
        </tr>
    `).join('');
    
    renderPagination('propertiesPagination', totalPages, currentPropertiesPage, 'properties');
}

// ===================== RENDERIZAR EVALUACIONES =====================
// Se eliminaron los botones de aprobar y rechazar
function renderReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;

    if (reviewsLoadError) {
        container.innerHTML = `<div class="text-center py-5">${escapeHtml(reviewsLoadError)}</div>`;
        document.getElementById('reviewsPagination').innerHTML = '';
        document.getElementById('totalReviewsCount').textContent = 0;
        document.getElementById('pendingReviewsCount').textContent = 0;
        document.getElementById('avgRating').textContent = '0.0';
        return;
    }
    
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
    const avgRating = totalReviews > 0 ? (adminReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
    
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
                <div class="review-actions">
                    <span class="review-status-badge status-${review.status}-badge">
                        ${review.status === 'pending' ? 'Pendiente' : review.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </span>
                    <button class="btn-icon btn-delete btn-review-delete" type="button" title="Eliminar evaluacion" aria-label="Eliminar evaluacion" onclick="deleteReview(event, ${review.id})">
                        <i class="bi bi-trash"></i>
                    </button>
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
            <p><strong>Nombre:</strong> ${escapeHtml(user.name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(user.email)}</p>
            <p><strong>Teléfono:</strong> ${escapeHtml(user.phone)}</p>
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

window.deleteUser = async function(id) {
    const user = adminUsers.find(u => u.id === id);
    if (!user) return;
    if (!user.email || user.email === "Sin correo") {
        showToast("Este usuario no tiene correo para eliminarlo desde la base de datos", true);
        return;
    }

    if (confirm('¿Eliminar este usuario permanentemente?')) {
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(user.email)}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result?.error || "No se pudo eliminar el usuario");
            }

            adminUsers = adminUsers.filter(u => u.id !== id);
            renderUsers();
            updateStats();
            showToast('Usuario eliminado correctamente');
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            showToast(error.message || "No se pudo eliminar el usuario", true);
        }
    }
};

// ===================== FUNCIONES CRUD PROPIEDADES =====================
window.viewProperty = function(id) {
    const property = adminProperties.find(p => p.id === id);
    if (!property) return;
    
    const modalBody = document.getElementById('propertyModalBody');
    modalBody.innerHTML = `
        <div class="property-details">
            <p><strong>Título:</strong> ${escapeHtml(property.title)}</p>
            <p><strong>Tipo:</strong> ${escapeHtml(property.type)}</p>
            <p><strong>Ubicación:</strong> ${escapeHtml(property.location)}</p>
            <p><strong>Propietario:</strong> ${escapeHtml(property.owner)}</p>
            <p><strong>Precio:</strong> $${Number(property.price || 0).toLocaleString()}/mes</p>
            <p><strong>Fecha publicación:</strong> ${formatDate(property.date)}</p>
            <p><strong>Estado:</strong> <span class="status-badge status-${property.status}">${escapeHtml(property.statusText || getStatusText(property.status))}</span></p>
            <p><strong>Metros totales:</strong> ${property.totalMeters ?? "Sin informacion"}</p>
            <p><strong>Dormitorios:</strong> ${property.rooms ?? "Sin informacion"}</p>
            <p><strong>Banos:</strong> ${property.bathrooms ?? "Sin informacion"}</p>
        </div>
    `;
    
    new bootstrap.Modal(document.getElementById('propertyModal')).show();
};

window.deleteProperty = async function(id) {
    if (confirm('¿Eliminar esta propiedad permanentemente?')) {
        try {
            const response = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
                method: "DELETE",
                credentials: "same-origin",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result?.message || result?.error || "No se pudo eliminar la propiedad");
            }

            adminProperties = adminProperties.filter(p => p.id !== id);
            saveProperties();
            showToast('Propiedad eliminada correctamente');
        } catch (error) {
            console.error("Error eliminando propiedad:", error);
            showToast(error.message || "No se pudo eliminar la propiedad", true);
        }
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
            <p><strong>Estado actual:</strong> <span class="review-status-badge status-${review.status}-badge">${review.status === 'pending' ? 'Pendiente' : review.status === 'approved' ? 'Aprobada' : 'Rechazada'}</span></p>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    
    // Ocultar botones del modal porque ya no se necesita aprobar/rechazar
    const approveBtn = document.getElementById('approveReviewBtn');
    const rejectBtn = document.getElementById('rejectReviewBtn');
    if (approveBtn) approveBtn.style.display = 'none';
    if (rejectBtn) rejectBtn.style.display = 'none';
    
    modal.show();
};

async function deleteReviewFromDatabase(id) {
    try {
        const response = await fetch(`/api/tenant-reviews/${encodeURIComponent(id)}`, {
            method: "DELETE",
            credentials: "same-origin",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo eliminar la evaluacion");
        }

        adminReviews = adminReviews.filter(r => r.id !== id);
        saveReviews();
        renderReviews();
        updateStats();
        return true;
    } catch (error) {
        console.error("Error eliminando evaluacion:", error);
        showToast(error.message || "No se pudo eliminar la evaluacion", true);
        return false;
    }
}

window.deleteReview = async function(event, id) {
    if (event) {
        event.stopPropagation();
    }

    const review = adminReviews.find(r => r.id === id);
    if (!review) return;

    if (confirm('¿Eliminar esta evaluación?')) {
        if (!(await deleteReviewFromDatabase(id))) return;
        showToast('Evaluación eliminada correctamente');
    }
};

// ===================== FUNCIONES UTILITARIAS =====================
function formatDate(dateString) {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
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
    const adminNav = document.querySelector('.admin-nav');
    if (!adminNav || adminNav.dataset.initialized === 'true') return;

    adminNav.dataset.initialized = 'true';

    const sections = document.querySelectorAll('.admin-section');
    const navItems = adminNav.querySelectorAll('.nav-item');

    adminNav.addEventListener('click', (e) => {
        const item = e.target.closest('.nav-item');
        if (!item || !adminNav.contains(item)) return;

        e.preventDefault();
        const sectionId = item.getAttribute('data-section');
        const targetSection = document.getElementById(`${sectionId}-section`);
        if (!targetSection) return;

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        sections.forEach(section => section.classList.remove('active'));
        targetSection.classList.add('active');
    });
}

function initEventListeners() {
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutAdmin();
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
    if (requireAdminSession()) {
        initAdmin();
    }
});
