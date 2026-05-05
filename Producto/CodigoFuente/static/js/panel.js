// ===================== DATOS SIMULADOS =====================
let userProperties = [
    { id: 1, title: "Casa en Santiago Centro", location: "Santiago Centro", price: 500000, rooms: 3, image: "assets/image/casa1.png", favorite: false, createdAt: "2024-03-15" },
    { id: 2, title: "Departamento Moderno", location: "Providencia", price: 350000, rooms: 2, image: "assets/image/casa2.png", favorite: false, createdAt: "2024-03-20" },
    { id: 3, title: "Casa Familiar", location: "Las Condes", price: 600000, rooms: 4, image: "assets/image/casa3.png", favorite: false, createdAt: "2024-04-01" },
    { id: 4, title: "Loft Industrial", location: "Ñuñoa", price: 420000, rooms: 1, image: "assets/image/casa4.png", favorite: false, createdAt: "2024-04-10" },
    { id: 5, title: "Casa en Vitacura", location: "Vitacura", price: 800000, rooms: 5, image: "assets/image/casa1.png", favorite: false, createdAt: "2024-04-15" }
];

// Cargar desde localStorage
if (localStorage.getItem('userProperties')) {
    userProperties = JSON.parse(localStorage.getItem('userProperties'));
} else {
    localStorage.setItem('userProperties', JSON.stringify(userProperties));
}

// Mensajes simulados
let userMessages = [
    { id: 1, name: "Juan Pérez", date: "Hace 2 horas", subject: "Interesado en la propiedad", message: "Hola, estoy interesado en la propiedad de Santiago Centro. ¿Podríamos coordinar una visita?", unread: true },
    { id: 2, name: "María López", date: "Ayer", subject: "Consulta disponibilidad", message: "Me gustaría saber si la propiedad aún está disponible para arriendo.", unread: false },
    { id: 3, name: "Carlos Ruiz", date: "Hace 3 días", subject: "Precio negociable", message: "¿El precio es negociable? Me interesa mucho la propiedad.", unread: false }
];

// Variables de paginación
let currentPageDashboard = 1;
let currentPageProperties = 1;
const itemsPerPage = 6;
let filteredDashboardProperties = [...userProperties];

// ===================== ACTUALIZAR ESTADÍSTICAS =====================
function updateStats() {
    const totalProperties = userProperties.length;
    const totalMessages = userMessages.length;
    const unreadMessages = userMessages.filter(m => m.unread).length;
    
    const statProperties = document.getElementById('statProperties');
    const statMessages = document.getElementById('statMessages');
    const totalPropertiesEl = document.getElementById('totalProperties');
    const totalMessagesEl = document.getElementById('totalMessages');
    const unreadBadge = document.getElementById('unreadBadge');
    
    if (statProperties) statProperties.innerText = totalProperties;
    if (statMessages) statMessages.innerText = totalMessages;
    if (totalPropertiesEl) totalPropertiesEl.innerText = totalProperties;
    if (totalMessagesEl) totalMessagesEl.innerText = totalMessages;
    
    if (unreadBadge) {
        unreadBadge.innerText = unreadMessages;
        unreadBadge.style.display = unreadMessages > 0 ? 'inline-block' : 'none';
    }
}

// ===================== RENDERIZAR DASHBOARD =====================
function renderDashboard() {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    const searchTerm = document.getElementById('filterSearch')?.value.toLowerCase() || '';
    const maxPrice = parseInt(document.getElementById('filterPrice')?.value) || Infinity;
    const minRooms = parseInt(document.getElementById('filterRooms')?.value) || 0;
    
    filteredDashboardProperties = userProperties.filter(prop => {
        const matchSearch = prop.title.toLowerCase().includes(searchTerm) || prop.location.toLowerCase().includes(searchTerm);
        const matchPrice = prop.price <= maxPrice;
        const matchRooms = prop.rooms >= minRooms;
        return matchSearch && matchPrice && matchRooms;
    });
    
    const totalPages = Math.ceil(filteredDashboardProperties.length / itemsPerPage);
    const start = (currentPageDashboard - 1) * itemsPerPage;
    const paginated = filteredDashboardProperties.slice(start, start + itemsPerPage);
    
    if (paginated.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-5">
            <i class="bi bi-building fs-1"></i>
            <p>No se encontraron propiedades</p>
        </div>`;
        const paginationControls = document.getElementById('paginationControls');
        if (paginationControls) paginationControls.innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginated.map(prop => `
        <div class="col-md-6 col-lg-4">
            <div class="property-card">
                <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img" alt="${prop.title}">
                <div class="property-body">
                    <h5 class="property-title">${prop.title}</h5>
                    <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
                    <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
                    <div class="property-actions">
                        <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
                            <i class="bi bi-heart${prop.favorite ? '-fill' : ''}"></i> ${prop.favorite ? 'Favorito' : 'Favoritos'}
                        </button>
                        <button class="btn-sm-outline" onclick="editProperty(${prop.id})"><i class="bi bi-pencil"></i> Editar</button>
                        <button class="btn-sm-danger" onclick="deleteProperty(${prop.id})"><i class="bi bi-trash"></i> Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    let paginationHtml = `<ul class="pagination">`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<li class="page-item ${i === currentPageDashboard ? 'active' : ''}"><button class="page-link" data-page-dash="${i}">${i}</button></li>`;
    }
    paginationHtml += `</ul>`;
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) paginationControls.innerHTML = paginationHtml;
    
    document.querySelectorAll('[data-page-dash]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPageDashboard = parseInt(e.target.dataset.pageDash);
            renderDashboard();
        });
    });
}

// ===================== RENDERIZAR MIS PROPIEDADES =====================
function renderAllProperties() {
    const grid = document.getElementById('allPropertiesGrid');
    if (!grid) return;
    
    const totalPages = Math.ceil(userProperties.length / itemsPerPage);
    const start = (currentPageProperties - 1) * itemsPerPage;
    const paginated = userProperties.slice(start, start + itemsPerPage);
    
    if (paginated.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No tienes propiedades publicadas</div>`;
        const allPaginationControls = document.getElementById('allPaginationControls');
        if (allPaginationControls) allPaginationControls.innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginated.map(prop => `
        <div class="col-md-6 col-lg-4">
            <div class="property-card">
                <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img">
                <div class="property-body">
                    <h5 class="property-title">${prop.title}</h5>
                    <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
                    <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
                    <div class="property-actions">
                        <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
                            <i class="bi bi-heart${prop.favorite ? '-fill' : ''}"></i> ${prop.favorite ? 'Favorito' : 'Favoritos'}
                        </button>
                        <button class="btn-sm-outline" onclick="editProperty(${prop.id})">Editar</button>
                        <button class="btn-sm-danger" onclick="deleteProperty(${prop.id})">Eliminar</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    let paginationHtml = `<ul class="pagination">`;
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `<li class="page-item ${i === currentPageProperties ? 'active' : ''}"><button class="page-link" data-page-prop="${i}">${i}</button></li>`;
    }
    paginationHtml += `</ul>`;
    const allPaginationControls = document.getElementById('allPaginationControls');
    if (allPaginationControls) allPaginationControls.innerHTML = paginationHtml;
    
    document.querySelectorAll('[data-page-prop]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPageProperties = parseInt(e.target.dataset.pageProp);
            renderAllProperties();
        });
    });
}

// ===================== RENDERIZAR FAVORITOS =====================
function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    
    const favorites = userProperties.filter(prop => prop.favorite === true);
    
    if (favorites.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-heart fs-1"></i>
                <p>No tienes propiedades favoritas aún</p>
                <p class="small">Explora tus propiedades y haz clic en el corazón para agregarlas aquí</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = favorites.map(prop => `
        <div class="col-md-6 col-lg-4">
            <div class="property-card">
                <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img">
                <div class="property-body">
                    <h5 class="property-title">${prop.title}</h5>
                    <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
                    <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
                    <div class="property-actions">
                        <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
                            <i class="bi bi-heart-fill"></i> Quitar de favoritos
                        </button>
                        <button class="btn-sm-outline" onclick="editProperty(${prop.id})">Ver detalles</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===================== TOGGLE FAVORITO =====================
window.toggleFavorite = function(id) {
    const property = userProperties.find(p => p.id === id);
    if (property) {
        property.favorite = !property.favorite;
        localStorage.setItem('userProperties', JSON.stringify(userProperties));
        
        // Actualizar solo la vista actual
        const activeSection = document.querySelector('.panel-section.active');
        if (activeSection) {
            if (activeSection.id === 'dashboard-section') {
                renderDashboard();
            } else if (activeSection.id === 'properties-section') {
                renderAllProperties();
            } else if (activeSection.id === 'favorites-section') {
                renderFavorites();
            }
        }
        
        const message = property.favorite ? 'Agregado a favoritos' : 'Eliminado de favoritos';
        showToast(message);
    }
};

// ===================== AGREGAR PROPIEDAD =====================
const addPropertyForm = document.getElementById('addPropertyForm');
if (addPropertyForm) {
    addPropertyForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newProp = {
            id: Date.now(),
            title: document.getElementById('propTitle').value,
            location: document.getElementById('propLocation').value,
            price: parseInt(document.getElementById('propPrice').value),
            rooms: parseInt(document.getElementById('propRooms').value) || 2,
            description: document.getElementById('propDesc').value,
            image: 'assets/image/default-house.jpg',
            favorite: false,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        userProperties.unshift(newProp);
        localStorage.setItem('userProperties', JSON.stringify(userProperties));
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
        if (modal) modal.hide();
        
        addPropertyForm.reset();
        
        // Actualizar solo la vista actual
        const activeSection = document.querySelector('.panel-section.active');
        if (activeSection) {
            if (activeSection.id === 'dashboard-section') {
                renderDashboard();
            } else if (activeSection.id === 'properties-section') {
                renderAllProperties();
            }
        }
        updateStats();
        showToast('Propiedad publicada correctamente');
    });
}

// ===================== ELIMINAR PROPIEDAD =====================
window.deleteProperty = function(id) {
    if (confirm('¿Eliminar esta propiedad permanentemente?')) {
        userProperties = userProperties.filter(p => p.id !== id);
        localStorage.setItem('userProperties', JSON.stringify(userProperties));
        
        const activeSection = document.querySelector('.panel-section.active');
        if (activeSection) {
            if (activeSection.id === 'dashboard-section') {
                renderDashboard();
            } else if (activeSection.id === 'properties-section') {
                renderAllProperties();
            } else if (activeSection.id === 'favorites-section') {
                renderFavorites();
            }
        }
        updateStats();
        showToast('Propiedad eliminada');
    }
};

window.editProperty = function(id) {
    showToast('Funcionalidad de edición próximamente');
};

// ===================== FILTROS =====================
function initFilters() {
    const searchInput = document.getElementById('filterSearch');
    const priceSelect = document.getElementById('filterPrice');
    const roomsSelect = document.getElementById('filterRooms');
    const clearBtn = document.getElementById('clearFilters');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => { 
            currentPageDashboard = 1; 
            renderDashboard(); 
        });
    }
    if (priceSelect) {
        priceSelect.addEventListener('change', () => { 
            currentPageDashboard = 1; 
            renderDashboard(); 
        });
    }
    if (roomsSelect) {
        roomsSelect.addEventListener('change', () => { 
            currentPageDashboard = 1; 
            renderDashboard(); 
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (priceSelect) priceSelect.value = '';
            if (roomsSelect) roomsSelect.value = '';
            currentPageDashboard = 1;
            renderDashboard();
        });
    }
}

// ===================== MENSAJES =====================
function loadMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    if (userMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-envelope fs-1"></i>
                <p>No tienes mensajes</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = userMessages.map(msg => `
        <div class="message-item ${msg.unread ? 'unread' : ''}" onclick="markAsRead(${msg.id})">
            <div class="message-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <strong>${msg.name}</strong>
                    <span class="message-date">${msg.date}</span>
                </div>
                <div class="message-subject">${msg.subject}</div>
                <div class="message-preview">${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</div>
            </div>
        </div>
    `).join('');
}

// Marcar mensaje como leído
window.markAsRead = function(id) {
    const message = userMessages.find(m => m.id === id);
    if (message && message.unread) {
        message.unread = false;
        updateStats();
        loadMessages();
        showToast(`Mensaje de ${message.name} marcado como leído`);
    }
};

// ===================== CONFIGURACIÓN =====================
function initSettings() {
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPass = document.getElementById('newPass').value;
            const confirm = document.getElementById('confirmPass').value;
            
            if (newPass !== confirm) {
                showToast('Las contraseñas no coinciden', true);
            } else if (newPass.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres', true);
            } else {
                showToast('Contraseña actualizada correctamente');
                passwordForm.reset();
            }
        });
    }
    
    const saveSettings = document.getElementById('saveSettingsBtn');
    if (saveSettings) {
        saveSettings.addEventListener('click', () => {
            const prefs = {
                email: document.getElementById('notifyEmail').checked,
                push: document.getElementById('notifyPush').checked,
                sms: document.getElementById('notifySMS').checked
            };
            localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
            showToast('Preferencias guardadas');
        });
    }
    
    const savedPrefs = localStorage.getItem('notificationPrefs');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        const notifyEmail = document.getElementById('notifyEmail');
        const notifyPush = document.getElementById('notifyPush');
        const notifySMS = document.getElementById('notifySMS');
        if (notifyEmail) notifyEmail.checked = prefs.email;
        if (notifyPush) notifyPush.checked = prefs.push;
        if (notifySMS) notifySMS.checked = prefs.sms;
    }
}

// ===================== MOSTRAR/OCULTAR FILTROS =====================
function toggleFilters() {
    const currentSection = document.querySelector('.panel-section.active');
    const filtrosSticky = document.getElementById('filtrosSticky');
    
    if (filtrosSticky) {
        if (currentSection && (currentSection.id === 'dashboard-section' || currentSection.id === 'properties-section')) {
            filtrosSticky.style.display = 'block';
        } else {
            filtrosSticky.style.display = 'none';
        }
    }
}

// ===================== USUARIO =====================
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    const userName = userProfile.fullName || userData.firstName || 'Usuario';
    const userEmail = userProfile.email || userData.email || 'usuario@ejemplo.com';
    
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    if (userNameEl) userNameEl.innerText = userName;
    if (userEmailEl) userEmailEl.innerText = userEmail;
}

// ===================== TOAST =====================
function showToast(message, isError = false) {
    let toast = document.getElementById('customToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.className = 'toast-custom';
        toast.innerHTML = `
            <div class="toast-header">
                <i class="bi bi-info-circle-fill"></i>
                <strong>Información</strong>
            </div>
            <div class="toast-body"></div>
        `;
        document.body.appendChild(toast);
        
        if (!document.getElementById('toastStyles')) {
            const style = document.createElement('style');
            style.id = 'toastStyles';
            style.textContent = `
                .toast-custom {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    z-index: 2000;
                    min-width: 280px;
                    background: white;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    border-left: 4px solid #2C5A6E;
                    padding: 1rem;
                    display: none;
                }
                .toast-custom .toast-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 5px;
                    font-weight: 600;
                    color: #1F3B4C;
                }
                @media (max-width: 576px) {
                    .toast-custom {
                        bottom: 20px;
                        right: 20px;
                        left: 20px;
                        min-width: auto;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const toastBody = toast.querySelector('.toast-body');
    const toastHeader = toast.querySelector('.toast-header');
    
    if (toastBody) toastBody.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#dc3545';
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-exclamation-triangle-fill';
                icon.style.color = '#dc3545';
            }
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Error';
        }
    } else {
        toast.style.borderLeftColor = '#2C5A6E';
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-check-circle-fill';
                icon.style.color = '#2C5A6E';
            }
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Éxito';
        }
    }
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.panel-section');
    
    // Ocultar todas las secciones inicialmente
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar solo Dashboard al inicio
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) dashboardSection.classList.add('active');
    
    // Marcar Dashboard como activo en el menú
    const dashboardLink = document.querySelector('.nav-link[data-section="dashboard"]');
    if (dashboardLink) dashboardLink.classList.add('active');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}-section`);
            
            if (!targetSection) return;
            
            // Ocultar todas las secciones
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            // Mostrar la sección seleccionada
            targetSection.classList.add('active');
            
            // Actualizar clase active en el menú
            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            // Cargar datos específicos según la sección
            switch(sectionId) {
                case 'favorites':
                    renderFavorites();
                    break;
                case 'messages':
                    loadMessages();
                    break;
                case 'properties':
                    renderAllProperties();
                    break;
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'settings':
                    // No necesita carga adicional
                    break;
            }
            
            // Mostrar/ocultar filtros según la sección
            toggleFilters();
        });
    });
}

// ===================== CERRAR SESIÓN =====================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('¿Cerrar sesión?')) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });
}

// ===================== INICIALIZAR =====================
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateStats();
    renderDashboard();
    renderAllProperties();
    initFilters();
    initNavigation();
    initSettings();
    toggleFilters();
});
// ===================== CARGAR HEADER Y FOOTER =====================
function loadHeaderFooter() {
    // Cargar header
    fetch('components/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header').innerHTML = data;
            
            // Inicializar header
            const navToggle = document.getElementById('navToggle');
            if (navToggle) {
                navToggle.addEventListener('click', () => {
                    const navMenu = document.getElementById('navMenu');
                    if (navMenu) navMenu.classList.toggle('active');
                });
            }
            
            const userData = localStorage.getItem('userData');
            const userProfile = localStorage.getItem('userProfile');
            const isLoggedIn = userData || userProfile;
            
            const registerBtn = document.querySelector('.btn-register-nav');
            const loginBtn = document.querySelector('.btn-login-nav');
            const profileBtn = document.getElementById('profileBtn');
            
            if (isLoggedIn) {
                if (registerBtn) registerBtn.style.display = 'none';
                if (loginBtn) loginBtn.style.display = 'none';
                if (profileBtn) profileBtn.style.display = 'flex';
            } else {
                if (registerBtn) registerBtn.style.display = 'flex';
                if (loginBtn) loginBtn.style.display = 'flex';
                if (profileBtn) profileBtn.style.display = 'none';
            }
        })
        .catch(error => console.error('Error cargando header:', error));
    
    // Cargar footer
    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error cargando footer:', error));
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadHeaderFooter();
    // ... el resto de tu código de inicialización
});