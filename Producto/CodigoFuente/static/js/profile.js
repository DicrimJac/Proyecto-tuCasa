// ===================== DATOS SIMULADOS =====================
let userProperties = [
    { id: 1, title: "Casa en Santiago Centro", location: "Santiago Centro", price: 500000, rooms: 3, image: "assets/image/casa1.png", favorite: true, createdAt: "2024-03-15" },
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
    { id: 2, name: "María López", date: "Ayer", subject: "Consulta disponibilidad", message: "Me gustaría saber si la propiedad aún está disponible para arriendo.", unread: true },
    { id: 3, name: "Carlos Ruiz", date: "Hace 3 días", subject: "Precio negociable", message: "¿El precio es negociable? Me interesa mucho la propiedad.", unread: true }
];

// Variables de paginación
let currentPageDashboard = 1;
let currentPageProperties = 1;
const itemsPerPage = 6;
let filteredDashboardProperties = [...userProperties];

// ===================== FUNCIONES UTILITARIAS =====================
function getStoredJson(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        return null;
    }
}

function getCurrentUser() {
    return getStoredJson("userData") || getStoredJson("userProfile") || null;
}

function valueOrFallback(value, fallback = "No registrado") {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
}

function buildFullName(user) {
    const names = [
        user?.first_name,
        user?.second_name,
        user?.first_last_name,
        user?.second_last_name,
    ].filter(Boolean);

    if (names.length > 0) return names.join(" ");
    return user?.fullName || user?.name || user?.nombre || user?.userName ||
        localStorage.getItem("userName") || "Usuario";
}

function getEmail(user) {
    return user?.mail || user?.email || user?.correo ||
        localStorage.getItem("userEmail") || "Sin correo registrado";
}

function formatPhone(user) {
    const rawPhone = user?.fono || user?.phone || user?.telefono;
    if (!rawPhone) return "No registrado";

    const digits = String(rawPhone).replace(/\D/g, "");
    if (digits.startsWith("56") && digits.length >= 11) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 9) {
        return `+56 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 8) {
        return `+56 ${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return String(rawPhone);
}

function formatDateValue(value) {
    if (!value) return "No registrada";

    if (typeof value === "string") {
        const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoDate) {
            return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function avatarUrl(name, avatar) {
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?background=2C5A6E&color=fff&rounded=true&size=120&bold=true&name=${encodeURIComponent(name)}`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

// ===================== ACTUALIZAR ESTADÍSTICAS =====================
function updateStats() {
    const totalProperties = userProperties.length;
    const totalMessages = userMessages.length;
    const unreadMessages = userMessages.filter(m => m.unread).length;

    const totalPropertiesEl = document.getElementById('totalProperties');
    const totalMessagesEl = document.getElementById('totalMessages');
    const unreadBadge = document.getElementById('unreadBadge');

    if (totalPropertiesEl) totalPropertiesEl.innerText = totalProperties;
    if (totalMessagesEl) totalMessagesEl.innerText = totalMessages;

    if (unreadBadge) {
        unreadBadge.innerText = unreadMessages;
        unreadBadge.style.display = unreadMessages > 0 ? 'inline-block' : 'none';
    }
}

// ===================== VALIDAR TELÉFONO =====================
function validatePhoneNumber(input) {
    let value = input.value;
    value = value.replace(/[^0-9]/g, '');
    if (value.length > 15) {
        value = value.slice(0, 15);
    }
    if (value.length === 9 && !value.startsWith('9')) {
        value = '9' + value;
    }
    input.value = value;
}

// ===================== ACTUALIZAR PERFIL =====================
function updateProfileDisplay(user) {
    const fullName = buildFullName(user);
    const email = getEmail(user);
    const phone = formatPhone(user);
    const birthdate = formatDateValue(user?.date_birth || user?.birthDate || user?.birthdate);
    const address = valueOrFallback(user?.address || user?.direccion);
    const avatar = avatarUrl(fullName, user?.avatar || user?.picture);

    setText("userNameDisplay", fullName);
    setText("userEmailDisplay", email);
    setText("fullName", fullName);
    setText("email", email);
    setText("phone", phone);
    setText("birthdate", birthdate);
    setText("address", address);

    const badge = document.querySelector(".badge-member");
    if (badge) {
        const createdAt = user?.created_at || user?.createdAt || user?.fecha_creacion;
        const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
        badge.innerHTML = `<i class="bi bi-calendar-check me-1"></i> Miembro desde ${Number.isNaN(year) ? new Date().getFullYear() : year}`;
    }

    const avatarImg = document.getElementById("avatarImg");
    const avatarPreview = document.getElementById("avatarPreview");
    if (avatarImg) avatarImg.src = avatar;
    if (avatarPreview) avatarPreview.src = avatar;
}

function loadUserData() {
    const savedData = localStorage.getItem('userProfile') || localStorage.getItem('userData');
    if (savedData) {
        const userData = JSON.parse(savedData);
        updateProfileDisplay(userData);
    }
}

// ===================== RENDERIZAR DASHBOARD =====================
function renderDashboard() {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
    const maxPrice = parseInt(document.getElementById('priceFilter')?.value) || Infinity;
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

    let paginationHtml = `<ul class="pagination justify-content-center">`;
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

    let paginationHtml = `<ul class="pagination justify-content-center">`;
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

function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        // En lugar de cerrar sesión directamente desde el perfil,
        // redirigimos a logout.html, donde está toda la lógica de confirmación
        // y cierre de sesión (js/logout.js).
        logoutBtn.addEventListener("click", () => {
            window.location.href = "logout.html";
        });
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
window.toggleFavorite = function (id) {
    const property = userProperties.find(p => p.id === id);
    if (property) {
        property.favorite = !property.favorite;
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

        const message = property.favorite ? 'Agregado a favoritos' : 'Eliminado de favoritos';
        showToast(message);
    }
};

// ===================== AGREGAR PROPIEDAD =====================
const addPropertyForm = document.getElementById('addPropertyForm');
if (addPropertyForm) {
    addPropertyForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const newProp = {
            id: Date.now(),
            title: document.getElementById('propertyTitle').value,
            location: document.getElementById('propertyLocation').value,
            price: parseInt(document.getElementById('propertyPrice').value),
            rooms: parseInt(document.getElementById('propertyRooms').value) || 2,
            description: document.getElementById('propertyDesc').value,
            image: 'assets/image/default-house.jpg',
            favorite: false,
            createdAt: new Date().toISOString().split('T')[0]
        };

        userProperties.unshift(newProp);
        localStorage.setItem('userProperties', JSON.stringify(userProperties));

        const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
        if (modal) modal.hide();

        addPropertyForm.reset();

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
window.deleteProperty = function (id) {
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

// ===================== EDITAR PROPIEDAD =====================
window.editProperty = function (id) {
    showToast('Funcionalidad de edición próximamente');
};

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
window.markAsRead = function (id) {
    const message = userMessages.find(m => m.id === id);
    if (message && message.unread) {
        message.unread = false;
        updateStats();
        loadMessages();
        showToast(`Mensaje de ${message.name} marcado como leído`);
    }
};

// ===================== NAVEGACIÓN ENTRE SECCIONES =====================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.panel-section');

    sections.forEach(section => {
        section.classList.remove('active');
    });

    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) dashboardSection.classList.add('active');

    const dashboardLink = document.querySelector('.nav-link[data-section="dashboard"]');
    if (dashboardLink) dashboardLink.classList.add('active');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const sectionId = link.getAttribute('data-section');
            const targetSection = document.getElementById(`${sectionId}-section`);

            if (!targetSection) return;

            sections.forEach(section => {
                section.classList.remove('active');
            });

            targetSection.classList.add('active');

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');

            switch (sectionId) {
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
            }
        });
    });
}

// ===================== TOAST UNIFICADA =====================
function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');

    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;

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

// ===================== EDITAR PERFIL =====================
const editProfileForm = document.getElementById('editProfileForm');
if (editProfileForm) {
    editProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const phoneInput = document.getElementById('editPhone');
        let phoneValue = phoneInput.value;

        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(phoneValue)) {
            showToast('El teléfono solo puede contener números', true);
            return;
        }

        if (phoneValue.length < 8) {
            showToast('El teléfono debe tener al menos 8 dígitos', true);
            return;
        }

        const userData = {
            fullName: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phone: phoneValue,
            birthdate: document.getElementById('editBirthdate').value,
            address: document.getElementById('editAddress').value,
            avatar: document.getElementById('avatarImg').src
        };

        if (userData.birthdate) {
            const date = new Date(userData.birthdate);
            userData.birthdate = date.toLocaleDateString('es-ES');
        }

        updateProfileDisplay(userData);
        localStorage.setItem('userProfile', JSON.stringify(userData));

        const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
        if (modal) modal.hide();
        showToast('Perfil actualizado correctamente');
    });
}

// ===================== CAMBIAR CONTRASEÑA =====================
const passwordChangeForm = document.getElementById('passwordChangeForm');
if (passwordChangeForm) {
    passwordChangeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newPass = document.getElementById('newPass').value;
        const confirmPass = document.getElementById('confirmNewPass').value;

        if (newPass !== confirmPass) {
            showToast('Las contraseñas no coinciden', true);
            return;
        }

        if (newPass.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', true);
            return;
        }

        showToast('Contraseña actualizada correctamente');
        this.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
        if (modal) modal.hide();
    });
}

// ===================== NOTIFICACIONES =====================
const saveNotifications = document.getElementById('saveNotifications');
if (saveNotifications) {
    saveNotifications.addEventListener('click', function () {
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const preferences = {
            email: emailNotifications?.checked || false,
            sms: smsNotifications?.checked || false
        };
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        showToast('Preferencias de notificaciones guardadas');
        const modal = bootstrap.Modal.getInstance(document.getElementById('notificationsModal'));
        if (modal) modal.hide();
    });
}

// ===================== AVATAR =====================
const saveAvatar = document.getElementById('saveAvatar');
if (saveAvatar) {
    saveAvatar.addEventListener('click', function () {
        const fileInput = document.getElementById('avatarUpload');
        const file = fileInput.files[0];

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                showToast('La imagen no debe superar los 2MB', true);
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const avatarUrl = e.target.result;
                document.getElementById('avatarImg').src = avatarUrl;
                document.getElementById('avatarPreview').src = avatarUrl;

                const savedData = localStorage.getItem('userProfile');
                if (savedData) {
                    const userData = JSON.parse(savedData);
                    userData.avatar = avatarUrl;
                    localStorage.setItem('userProfile', JSON.stringify(userData));
                }

                showToast('Foto de perfil actualizada');
                const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
                if (modal) modal.hide();
            };
            reader.readAsDataURL(file);
        } else {
            showToast('Selecciona una imagen primero', true);
        }
    });
}

const removeAvatar = document.getElementById('removeAvatar');
if (removeAvatar) {
    removeAvatar.addEventListener('click', function () {
        const name = document.getElementById('userNameDisplay').textContent;
        const defaultAvatar = `https://ui-avatars.com/api/?background=2C5A6E&color=fff&rounded=true&size=120&bold=true&name=${encodeURIComponent(name)}`;
        document.getElementById('avatarImg').src = defaultAvatar;
        document.getElementById('avatarPreview').src = defaultAvatar;

        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            const userData = JSON.parse(savedData);
            userData.avatar = defaultAvatar;
            localStorage.setItem('userProfile', JSON.stringify(userData));
        }

        showToast('Foto de perfil eliminada');
        const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
        if (modal) modal.hide();
    });
}

// ===================== CERRAR SESIÓN =====================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userData');
            localStorage.removeItem('userProfile');
            window.location.href = 'home.html';
        }
    });
}

// ===================== PRECARGAR DATOS EN MODAL DE EDICIÓN =====================
const editProfileModal = document.getElementById('editProfileModal');
if (editProfileModal) {
    editProfileModal.addEventListener('show.bs.modal', function() {
        document.getElementById('editFullName').value = document.getElementById('fullName').textContent;
        document.getElementById('editEmail').value = document.getElementById('email').textContent;
        document.getElementById('editPhone').value = document.getElementById('phone').textContent;
        document.getElementById('editAddress').value = document.getElementById('address').textContent;

        const phoneInput = document.getElementById('editPhone');
        if (phoneInput) {
            phoneInput.removeEventListener('input', phoneInput._validationHandler);
            phoneInput._validationHandler = function() {
                validatePhoneNumber(this);
            };
            phoneInput.addEventListener('input', phoneInput._validationHandler);
        }

        const birthdateText = document.getElementById('birthdate').textContent;
        if (birthdateText && birthdateText !== 'No especificada') {
            const parts = birthdateText.split('/');
            if (parts.length === 3) {
                const date = new Date(parts[2], parts[1] - 1, parts[0]);
                if (!isNaN(date.getTime())) {
                    document.getElementById('editBirthdate').value = date.toISOString().split('T')[0];
                }
            }
        }
    });
}

// ===================== CARGAR PREFERENCIAS GUARDADAS =====================
const savedNotifPrefs = localStorage.getItem('notificationPreferences');
if (savedNotifPrefs) {
    const notif = JSON.parse(savedNotifPrefs);
    const emailNotif = document.getElementById('emailNotifications');
    const smsNotif = document.getElementById('smsNotifications');
    if (emailNotif) emailNotif.checked = notif.email;
    if (smsNotif) smsNotif.checked = notif.sms;
}

// ===================== INICIALIZAR =====================
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateStats();
    renderDashboard();
    renderAllProperties();
    initNavigation();
    
    if (document.getElementById('messages-section')) {
        loadMessages();
    }
});