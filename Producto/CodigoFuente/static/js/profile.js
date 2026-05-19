// // ===================== DATOS SIMULADOS =====================
// let userProperties = [
//     { id: 1, title: "Casa en Santiago Centro", location: "Santiago Centro", price: 500000, rooms: 3, image: "assets/image/casa1.png", favorite: true, createdAt: "2024-03-15" },
//     { id: 2, title: "Departamento Moderno", location: "Providencia", price: 350000, rooms: 2, image: "assets/image/casa2.png", favorite: false, createdAt: "2024-03-20" },
//     { id: 3, title: "Casa Familiar", location: "Las Condes", price: 600000, rooms: 4, image: "assets/image/casa3.png", favorite: false, createdAt: "2024-04-01" },
//     { id: 4, title: "Loft Industrial", location: "Ñuñoa", price: 420000, rooms: 1, image: "assets/image/casa4.png", favorite: false, createdAt: "2024-04-10" },
//     { id: 5, title: "Casa en Vitacura", location: "Vitacura", price: 800000, rooms: 5, image: "assets/image/casa1.png", favorite: false, createdAt: "2024-04-15" }
// ];

// // Cargar desde localStorage
// if (localStorage.getItem('userProperties')) {
//     userProperties = JSON.parse(localStorage.getItem('userProperties'));
// } else {
//     localStorage.setItem('userProperties', JSON.stringify(userProperties));
// }

// // Mensajes simulados
// let userMessages = [
//     { id: 1, name: "Juan Pérez", date: "Hace 2 horas", subject: "Interesado en la propiedad", message: "Hola, estoy interesado en la propiedad de Santiago Centro. ¿Podríamos coordinar una visita?", unread: true },
//     { id: 2, name: "María López", date: "Ayer", subject: "Consulta disponibilidad", message: "Me gustaría saber si la propiedad aún está disponible para arriendo.", unread: true },
//     { id: 3, name: "Carlos Ruiz", date: "Hace 3 días", subject: "Precio negociable", message: "¿El precio es negociable? Me interesa mucho la propiedad.", unread: true }
// ];

// // Variables de paginación
// let currentPageDashboard = 1;
// let currentPageProperties = 1;
// const itemsPerPage = 6;
// let filteredDashboardProperties = [...userProperties];

// // ===================== ACTUALIZAR ESTADÍSTICAS =====================
// function updateStats() {
//     const totalProperties = userProperties.length;
//     const totalMessages = userMessages.length;
//     const unreadMessages = userMessages.filter(m => m.unread).length;

//     const statProperties = document.getElementById('statProperties');
//     const statMessages = document.getElementById('statMessages');
//     const totalPropertiesEl = document.getElementById('totalProperties');
//     const totalMessagesEl = document.getElementById('totalMessages');
//     const unreadBadge = document.getElementById('unreadBadge');

//     if (statProperties) statProperties.innerText = totalProperties;
//     if (statMessages) statMessages.innerText = totalMessages;
//     if (totalPropertiesEl) totalPropertiesEl.innerText = totalProperties;
//     if (totalMessagesEl) totalMessagesEl.innerText = totalMessages;

//     if (unreadBadge) {
//         unreadBadge.innerText = unreadMessages;
//         unreadBadge.style.display = unreadMessages > 0 ? 'inline-block' : 'none';
//     }
// }

// // ===================== VALIDAR TELÉFONO (SOLO NÚMEROS) =====================
// function validatePhoneNumber(input) {
//     // Guardar el valor actual
//     let value = input.value;

//     // Remover cualquier caracter que NO sea número (solo dígitos 0-9)
//     value = value.replace(/[^0-9]/g, '');

//     // Limitar longitud máxima a 15 dígitos
//     if (value.length > 15) {
//         value = value.slice(0, 15);
//     }

//     // Formatear el teléfono (opcional: agregar +56 si es necesario)
//     if (value.length === 9 && !value.startsWith('9')) {
//         value = '9' + value;
//     }

//     // Actualizar el input
//     input.value = value;
// }

// // ===================== RENDERIZAR DASHBOARD =====================
// function renderDashboard() {
//     const grid = document.getElementById('propertiesGrid');
//     if (!grid) return;

//     const searchTerm = document.getElementById('searchFilter')?.value.toLowerCase() || '';
//     const maxPrice = parseInt(document.getElementById('priceFilter')?.value) || Infinity;
//     const minRooms = parseInt(document.getElementById('filterRooms')?.value) || 0;

//     filteredDashboardProperties = userProperties.filter(prop => {
//         const matchSearch = prop.title.toLowerCase().includes(searchTerm) || prop.location.toLowerCase().includes(searchTerm);
//         const matchPrice = prop.price <= maxPrice;
//         const matchRooms = prop.rooms >= minRooms;
//         return matchSearch && matchPrice && matchRooms;
//     });

//     const totalPages = Math.ceil(filteredDashboardProperties.length / itemsPerPage);
//     const start = (currentPageDashboard - 1) * itemsPerPage;
//     const paginated = filteredDashboardProperties.slice(start, start + itemsPerPage);

//     if (paginated.length === 0) {
//         grid.innerHTML = `<div class="col-12 text-center text-muted py-5">
//             <i class="bi bi-building fs-1"></i>
//             <p>No se encontraron propiedades</p>
//         </div>`;
//         const paginationControls = document.getElementById('paginationControls');
//         if (paginationControls) paginationControls.innerHTML = '';
//         return;
//     }

//     grid.innerHTML = paginated.map(prop => `
//         <div class="col-md-6 col-lg-4">
//             <div class="property-card">
//                 <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img" alt="${prop.title}">
//                 <div class="property-body">
//                     <h5 class="property-title">${prop.title}</h5>
//                     <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
//                     <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
//                     <div class="property-actions">
//                         <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
//                             <i class="bi bi-heart${prop.favorite ? '-fill' : ''}"></i> ${prop.favorite ? 'Favorito' : 'Favoritos'}
//                         </button>
//                         <button class="btn-sm-outline" onclick="editProperty(${prop.id})"><i class="bi bi-pencil"></i> Editar</button>
//                         <button class="btn-sm-danger" onclick="deleteProperty(${prop.id})"><i class="bi bi-trash"></i> Eliminar</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     let paginationHtml = `<ul class="pagination">`;
//     for (let i = 1; i <= totalPages; i++) {
//         paginationHtml += `<li class="page-item ${i === currentPageDashboard ? 'active' : ''}"><button class="page-link" data-page-dash="${i}">${i}</button></li>`;
//     }
//     paginationHtml += `</ul>`;
//     const paginationControls = document.getElementById('paginationControls');
//     if (paginationControls) paginationControls.innerHTML = paginationHtml;

//     document.querySelectorAll('[data-page-dash]').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             currentPageDashboard = parseInt(e.target.dataset.pageDash);
//             renderDashboard();
//         });
//     });
// }

// // ===================== RENDERIZAR MIS PROPIEDADES =====================
// function renderAllProperties() {
//     const grid = document.getElementById('allPropertiesGrid');
//     if (!grid) return;

//     const totalPages = Math.ceil(userProperties.length / itemsPerPage);
//     const start = (currentPageProperties - 1) * itemsPerPage;
//     const paginated = userProperties.slice(start, start + itemsPerPage);

//     if (paginated.length === 0) {
//         grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No tienes propiedades publicadas</div>`;
//         const allPaginationControls = document.getElementById('allPaginationControls');
//         if (allPaginationControls) allPaginationControls.innerHTML = '';
//         return;
//     }

//     grid.innerHTML = paginated.map(prop => `
//         <div class="col-md-6 col-lg-4">
//             <div class="property-card">
//                 <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img">
//                 <div class="property-body">
//                     <h5 class="property-title">${prop.title}</h5>
//                     <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
//                     <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
//                     <div class="property-actions">
//                         <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
//                             <i class="bi bi-heart${prop.favorite ? '-fill' : ''}"></i> ${prop.favorite ? 'Favorito' : 'Favoritos'}
//                         </button>
//                         <button class="btn-sm-outline" onclick="editProperty(${prop.id})">Editar</button>
//                         <button class="btn-sm-danger" onclick="deleteProperty(${prop.id})">Eliminar</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');

//     let paginationHtml = `<ul class="pagination">`;
//     for (let i = 1; i <= totalPages; i++) {
//         paginationHtml += `<li class="page-item ${i === currentPageProperties ? 'active' : ''}"><button class="page-link" data-page-prop="${i}">${i}</button></li>`;
//     }
//     paginationHtml += `</ul>`;
//     const allPaginationControls = document.getElementById('allPaginationControls');
//     if (allPaginationControls) allPaginationControls.innerHTML = paginationHtml;

//     document.querySelectorAll('[data-page-prop]').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             currentPageProperties = parseInt(e.target.dataset.pageProp);
//             renderAllProperties();
//         });
//     });
// }

// // ===================== RENDERIZAR FAVORITOS =====================
// function renderFavorites() {
//     const grid = document.getElementById('favoritesGrid');
//     if (!grid) return;

//     const favorites = userProperties.filter(prop => prop.favorite === true);

//     if (favorites.length === 0) {
//         grid.innerHTML = `
//             <div class="col-12 text-center text-muted py-5">
//                 <i class="bi bi-heart fs-1"></i>
//                 <p>No tienes propiedades favoritas aún</p>
//                 <p class="small">Explora tus propiedades y haz clic en el corazón para agregarlas aquí</p>
//             </div>
//         `;
//         return;
//     }

//     grid.innerHTML = favorites.map(prop => `
//         <div class="col-md-6 col-lg-4">
//             <div class="property-card">
//                 <img src="${prop.image || 'assets/image/default-house.jpg'}" class="property-img">
//                 <div class="property-body">
//                     <h5 class="property-title">${prop.title}</h5>
//                     <div class="property-location"><i class="bi bi-geo-alt"></i> ${prop.location}</div>
//                     <div class="property-price">$${prop.price.toLocaleString()} <span>/mes</span></div>
//                     <div class="property-actions">
//                         <button class="btn-sm-outline" onclick="toggleFavorite(${prop.id})">
//                             <i class="bi bi-heart-fill"></i> Quitar de favoritos
//                         </button>
//                         <button class="btn-sm-outline" onclick="editProperty(${prop.id})">Ver detalles</button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// // ===================== TOGGLE FAVORITO =====================
// window.toggleFavorite = function (id) {
//     const property = userProperties.find(p => p.id === id);
//     if (property) {
//         property.favorite = !property.favorite;
//         localStorage.setItem('userProperties', JSON.stringify(userProperties));

//         const activeSection = document.querySelector('.panel-section.active');
//         if (activeSection) {
//             if (activeSection.id === 'dashboard-section') {
//                 renderDashboard();
//             } else if (activeSection.id === 'properties-section') {
//                 renderAllProperties();
//             } else if (activeSection.id === 'favorites-section') {
//                 renderFavorites();
//             }
//         }

//         const message = property.favorite ? 'Agregado a favoritos' : 'Eliminado de favoritos';
//         showToast(message);
//     }
// };

// // ===================== AGREGAR PROPIEDAD =====================
// const addPropertyForm = document.getElementById('addPropertyForm');
// if (addPropertyForm) {
//     addPropertyForm.addEventListener('submit', function (e) {
//         e.preventDefault();

//         const newProp = {
//             id: Date.now(),
//             title: document.getElementById('propTitle').value,
//             location: document.getElementById('propLocation').value,
//             price: parseInt(document.getElementById('propPrice').value),
//             rooms: parseInt(document.getElementById('propRooms').value) || 2,
//             description: document.getElementById('propDesc').value,
//             image: 'assets/image/default-house.jpg',
//             favorite: false,
//             createdAt: new Date().toISOString().split('T')[0]
//         };

//         userProperties.unshift(newProp);
//         localStorage.setItem('userProperties', JSON.stringify(userProperties));

//         const modal = bootstrap.Modal.getInstance(document.getElementById('addPropertyModal'));
//         if (modal) modal.hide();

//         addPropertyForm.reset();

//         const activeSection = document.querySelector('.panel-section.active');
//         if (activeSection) {
//             if (activeSection.id === 'dashboard-section') {
//                 renderDashboard();
//             } else if (activeSection.id === 'properties-section') {
//                 renderAllProperties();
//             }
//         }
//         updateStats();
//         showToast('Propiedad publicada correctamente');
//     });
// }

// // ===================== ELIMINAR PROPIEDAD =====================
// window.deleteProperty = function (id) {
//     if (confirm('¿Eliminar esta propiedad permanentemente?')) {
//         userProperties = userProperties.filter(p => p.id !== id);
//         localStorage.setItem('userProperties', JSON.stringify(userProperties));

//         const activeSection = document.querySelector('.panel-section.active');
//         if (activeSection) {
//             if (activeSection.id === 'dashboard-section') {
//                 renderDashboard();
//             } else if (activeSection.id === 'properties-section') {
//                 renderAllProperties();
//             } else if (activeSection.id === 'favorites-section') {
//                 renderFavorites();
//             }
//         }
//         updateStats();
//         showToast('Propiedad eliminada');
//     }
// };

// // ===================== EDITAR PROPIEDAD =====================
// window.editProperty = function (id) {
//     showToast('Funcionalidad de edición próximamente');
// };

// // ===================== FILTROS =====================
// function initFilters() {
//     const searchInput = document.getElementById('filterSearch');
//     const priceSelect = document.getElementById('filterPrice');
//     const roomsSelect = document.getElementById('filterRooms');
//     const clearBtn = document.getElementById('clearFilters');

//     if (searchInput) {
//         searchInput.addEventListener('input', () => {
//             currentPageDashboard = 1;
//             renderDashboard();
//         });
//     }
//     if (priceSelect) {
//         priceSelect.addEventListener('change', () => {
//             currentPageDashboard = 1;
//             renderDashboard();
//         });
//     }
//     if (roomsSelect) {
//         roomsSelect.addEventListener('change', () => {
//             currentPageDashboard = 1;
//             renderDashboard();
//         });
//     }

//     if (clearBtn) {
//         clearBtn.addEventListener('click', () => {
//             if (searchInput) searchInput.value = '';
//             if (priceSelect) priceSelect.value = '';
//             if (roomsSelect) roomsSelect.value = '';
//             currentPageDashboard = 1;
//             renderDashboard();
//         });
//     }
// }

// // ===================== MENSAJES =====================
// function loadMessages() {
//     const messagesList = document.getElementById('messagesList');
//     if (!messagesList) return;

//     if (userMessages.length === 0) {
//         messagesList.innerHTML = `
//             <div class="text-center text-muted py-5">
//                 <i class="bi bi-envelope fs-1"></i>
//                 <p>No tienes mensajes</p>
//             </div>
//         `;
//         return;
//     }

//     messagesList.innerHTML = userMessages.map(msg => `
//         <div class="message-item ${msg.unread ? 'unread' : ''}" onclick="markAsRead(${msg.id})">
//             <div class="message-avatar">
//                 <i class="bi bi-person-circle"></i>
//             </div>
//             <div class="message-content">
//                 <div class="message-header">
//                     <strong>${msg.name}</strong>
//                     <span class="message-date">${msg.date}</span>
//                 </div>
//                 <div class="message-subject">${msg.subject}</div>
//                 <div class="message-preview">${msg.message.substring(0, 100)}${msg.message.length > 100 ? '...' : ''}</div>
//             </div>
//         </div>
//     `).join('');
// }

// // Marcar mensaje como leído
// window.markAsRead = function (id) {
//     const message = userMessages.find(m => m.id === id);
//     if (message && message.unread) {
//         message.unread = false;
//         updateStats();
//         loadMessages();
//         showToast(`Mensaje de ${message.name} marcado como leído`);
//     }
// };

// // ===================== MOSTRAR/OCULTAR FILTROS =====================
// function toggleFilters() {
//     const currentSection = document.querySelector('.panel-section.active');
//     const filtrosSticky = document.getElementById('filtrosSticky');

//     if (filtrosSticky) {
//         if (currentSection && (currentSection.id === 'dashboard-section' || currentSection.id === 'properties-section')) {
//             filtrosSticky.style.display = 'block';
//         } else {
//             filtrosSticky.style.display = 'none';
//         }
//     }
// }

// // ===================== NAVEGACIÓN ENTRE SECCIONES =====================
// function initNavigation() {
//     const navLinks = document.querySelectorAll('.nav-link[data-section]');
//     const sections = document.querySelectorAll('.panel-section');

//     sections.forEach(section => {
//         section.classList.remove('active');
//     });

//     const dashboardSection = document.getElementById('dashboard-section');
//     if (dashboardSection) dashboardSection.classList.add('active');

//     const dashboardLink = document.querySelector('.nav-link[data-section="dashboard"]');
//     if (dashboardLink) dashboardLink.classList.add('active');

//     navLinks.forEach(link => {
//         link.addEventListener('click', (e) => {
//             e.preventDefault();

//             const sectionId = link.getAttribute('data-section');
//             const targetSection = document.getElementById(`${sectionId}-section`);

//             if (!targetSection) return;

//             sections.forEach(section => {
//                 section.classList.remove('active');
//             });

//             targetSection.classList.add('active');

//             navLinks.forEach(nav => nav.classList.remove('active'));
//             link.classList.add('active');

//             switch (sectionId) {
//                 case 'favorites':
//                     renderFavorites();
//                     break;
//                 case 'messages':
//                     loadMessages();
//                     break;
//                 case 'properties':
//                     renderAllProperties();
//                     break;
//                 case 'dashboard':
//                     renderDashboard();
//                     break;
//             }

//             toggleFilters();
//         });
//     });
// }

// // ===================== FUNCIONES UTILITARIAS DE PERFIL =====================
// function updateProfileDisplay(userData) {
//     document.getElementById('userNameDisplay').textContent = userData.fullName || 'María González';
//     document.getElementById('userEmailDisplay').textContent = userData.email || 'maria.gonzalez@example.com';
//     document.getElementById('fullName').textContent = userData.fullName || 'María González';
//     document.getElementById('email').textContent = userData.email || 'maria.gonzalez@example.com';
//     document.getElementById('phone').textContent = userData.phone || '+56 9 1234 5678';
//     document.getElementById('birthdate').textContent = userData.birthdate || '15/03/1990';
//     document.getElementById('address').textContent = userData.address || 'Av. Los Condes 1234, Santiago';

//     if (userData.avatar) {
//         document.getElementById('avatarImg').src = userData.avatar;
//         document.getElementById('avatarPreview').src = userData.avatar;
//     }
// }

// function loadUserData() {
//     const savedData = localStorage.getItem('userProfile');
//     if (savedData) {
//         const userData = JSON.parse(savedData);
//         updateProfileDisplay(userData);
//     }

//     // También actualizar el nombre en el sidebar si existe
//     const userName = document.getElementById('userName');
//     const userEmail = document.getElementById('userEmail');
//     if (userName) userName.textContent = document.getElementById('userNameDisplay').textContent;
//     if (userEmail) userEmail.textContent = document.getElementById('userEmailDisplay').textContent;
// }

// // ===================== TOAST UNIFICADA =====================
// function showToast(message, isError = false) {
//     const toast = document.getElementById('notificationToast');
//     const toastMessage = document.getElementById('toastMessage');
//     const toastHeader = toast.querySelector('.toast-header');

//     if (toastMessage) toastMessage.textContent = message;

//     if (isError) {
//         toast.style.borderLeftColor = '#dc3545';
//         if (toastHeader) {
//             const icon = toastHeader.querySelector('i');
//             if (icon) {
//                 icon.className = 'bi bi-exclamation-triangle-fill';
//                 icon.style.color = '#dc3545';
//             }
//             const strong = toastHeader.querySelector('strong');
//             if (strong) strong.textContent = 'Error';
//         }
//     } else {
//         toast.style.borderLeftColor = '#2C5A6E';
//         if (toastHeader) {
//             const icon = toastHeader.querySelector('i');
//             if (icon) {
//                 icon.className = 'bi bi-check-circle-fill';
//                 icon.style.color = '#2C5A6E';
//             }
//             const strong = toastHeader.querySelector('strong');
//             if (strong) strong.textContent = 'Éxito';
//         }
//     }

//     toast.style.display = 'block';
//     setTimeout(() => {
//         toast.style.display = 'none';
//         if (toastHeader) {
//             const icon = toastHeader.querySelector('i');
//             if (icon) icon.className = 'bi bi-check-circle-fill';
//             const strong = toastHeader.querySelector('strong');
//             if (strong) strong.textContent = 'Éxito';
//             toast.style.borderLeftColor = '#2C5A6E';
//         }
//     }, 3000);
// }

// // ===================== EDITAR PERFIL =====================
// const editProfileForm = document.getElementById('editProfileForm');
// if (editProfileForm) {
//     editProfileForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         // Validar teléfono antes de guardar
//         const phoneInput = document.getElementById('editPhone');
//         let phoneValue = phoneInput.value;

//         // Verificar que solo contenga números
//         const phoneRegex = /^[0-9]+$/;
//         if (!phoneRegex.test(phoneValue)) {
//             showToast('El teléfono solo puede contener números', true);
//             return;
//         }

//         // Verificar longitud mínima (opcional)
//         if (phoneValue.length < 8) {
//             showToast('El teléfono debe tener al menos 8 dígitos', true);
//             return;
//         }

//         const userData = {
//             fullName: document.getElementById('editFullName').value,
//             email: document.getElementById('editEmail').value,
//             phone: phoneValue,
//             birthdate: document.getElementById('editBirthdate').value,
//             address: document.getElementById('editAddress').value,
//             avatar: document.getElementById('avatarImg').src
//         };

//         if (userData.birthdate) {
//             const date = new Date(userData.birthdate);
//             userData.birthdate = date.toLocaleDateString('es-ES');
//         }

//         updateProfileDisplay(userData);
//         localStorage.setItem('userProfile', JSON.stringify(userData));

//         const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
//         modal.hide();
//         showToast('Perfil actualizado correctamente');
//     });
// }

// // ===================== CAMBIAR CONTRASEÑA =====================
// const passwordChangeForm = document.getElementById('passwordChangeForm');
// if (passwordChangeForm) {
//     passwordChangeForm.addEventListener('submit', function (e) {
//         e.preventDefault();
//         const newPass = document.getElementById('newPass').value;
//         const confirmPass = document.getElementById('confirmNewPass').value;

//         if (newPass !== confirmPass) {
//             showToast('Las contraseñas no coinciden', true);
//             return;
//         }

//         if (newPass.length < 6) {
//             showToast('La contraseña debe tener al menos 6 caracteres', true);
//             return;
//         }

//         showToast('Contraseña actualizada correctamente');
//         this.reset();
//         const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
//         modal.hide();
//     });
// }

// // ===================== NOTIFICACIONES =====================
// const saveNotif = document.getElementById('saveNotif');
// if (saveNotif) {
//     saveNotif.addEventListener('click', function () {
//         const preferences = {
//             email: document.getElementById('emailNotif')?.checked || false,
//             sms: document.getElementById('smsNotif')?.checked || false
//         };
//         localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
//         showToast('Preferencias de notificaciones guardadas');
//         const modal = bootstrap.Modal.getInstance(document.getElementById('notificationsModal'));
//         modal.hide();
//     });
// }

// // ===================== PRIVACIDAD =====================
// const savePrivacy = document.getElementById('savePrivacy');
// if (savePrivacy) {
//     savePrivacy.addEventListener('click', function () {
//         const privacy = {
//             twoFactor: document.getElementById('twoFactorAuth')?.checked || false,
//             activityLog: document.getElementById('activityLog')?.checked || false,
//             dataSharing: document.getElementById('dataSharing')?.checked || false
//         };
//         localStorage.setItem('privacySettings', JSON.stringify(privacy));
//         showToast('Configuración de privacidad guardada');
//         const modal = bootstrap.Modal.getInstance(document.getElementById('privacyModal'));
//         modal.hide();
//     });
// }

// // ===================== AVATAR =====================
// const saveAvatar = document.getElementById('saveAvatar');
// if (saveAvatar) {
//     saveAvatar.addEventListener('click', function () {
//         const fileInput = document.getElementById('avatarUpload');
//         const file = fileInput.files[0];

//         if (file) {
//             if (file.size > 2 * 1024 * 1024) {
//                 showToast('La imagen no debe superar los 2MB', true);
//                 return;
//             }

//             const reader = new FileReader();
//             reader.onload = function (e) {
//                 const avatarUrl = e.target.result;
//                 document.getElementById('avatarImg').src = avatarUrl;
//                 document.getElementById('avatarPreview').src = avatarUrl;

//                 const savedData = localStorage.getItem('userProfile');
//                 if (savedData) {
//                     const userData = JSON.parse(savedData);
//                     userData.avatar = avatarUrl;
//                     localStorage.setItem('userProfile', JSON.stringify(userData));
//                 }

//                 showToast('Foto de perfil actualizada');
//                 const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
//                 modal.hide();
//             };
//             reader.readAsDataURL(file);
//         } else {
//             showToast('Selecciona una imagen primero', true);
//         }
//     });
// }

// const removeAvatar = document.getElementById('removeAvatar');
// if (removeAvatar) {
//     removeAvatar.addEventListener('click', function () {
//         const name = document.getElementById('userNameDisplay').textContent;
//         const defaultAvatar = `https://ui-avatars.com/api/?background=2C5A6E&color=fff&rounded=true&size=120&bold=true&name=${encodeURIComponent(name)}`;
//         document.getElementById('avatarImg').src = defaultAvatar;
//         document.getElementById('avatarPreview').src = defaultAvatar;

//         const savedData = localStorage.getItem('userProfile');
//         if (savedData) {
//             const userData = JSON.parse(savedData);
//             userData.avatar = defaultAvatar;
//             localStorage.setItem('userProfile', JSON.stringify(userData));
//         }

//         showToast('Foto de perfil eliminada');
//         const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
//         modal.hide();
//     });
// }

// // ===================== CERRAR SESIÓN =====================
// const logoutBtn = document.getElementById('logoutBtn');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', function() {
//         window.location.href = 'logout.html';
//     });
// }

// // ===================== PRECARGAR DATOS EN MODAL DE EDICIÓN =====================
// const editProfileModal = document.getElementById('editProfileModal');
// if (editProfileModal) {
//     editProfileModal.addEventListener('show.bs.modal', function() {
//         document.getElementById('editFullName').value = document.getElementById('fullName').textContent;
//         document.getElementById('editEmail').value = document.getElementById('email').textContent;
//         document.getElementById('editPhone').value = document.getElementById('phone').textContent;
//         document.getElementById('editAddress').value = document.getElementById('address').textContent;

//         // ========== AGREGAR VALIDACIÓN AL CAMPO TELÉFONO ==========
//         const phoneInput = document.getElementById('editPhone');
//         // Remover event listener anterior si existe
//         phoneInput.removeEventListener('input', phoneInput._validationHandler);
//         // Crear nuevo handler
//         phoneInput._validationHandler = function() {
//             validatePhoneNumber(this);
//         };
//         phoneInput.addEventListener('input', phoneInput._validationHandler);

//         const birthdateText = document.getElementById('birthdate').textContent;
//         if (birthdateText && birthdateText !== 'No especificada') {
//             const parts = birthdateText.split('/');
//             if (parts.length === 3) {
//                 const date = new Date(parts[2], parts[1] - 1, parts[0]);
//                 if (!isNaN(date.getTime())) {
//                     document.getElementById('editBirthdate').value = date.toISOString().split('T')[0];
//                 }
//             }
//         }
//     });
// }

// // ===================== CARGAR PREFERENCIAS GUARDADAS =====================
// const savedNotifPrefs = localStorage.getItem('notificationPreferences');
// if (savedNotifPrefs) {
//     const notif = JSON.parse(savedNotifPrefs);
//     const emailNotif = document.getElementById('emailNotif');
//     const smsNotif = document.getElementById('smsNotif');
//     if (emailNotif) emailNotif.checked = notif.email;
//     if (smsNotif) smsNotif.checked = notif.sms;
// }

// const savedPrivacySettings = localStorage.getItem('privacySettings');
// if (savedPrivacySettings) {
//     const privacy = JSON.parse(savedPrivacySettings);
//     const twoFactorAuth = document.getElementById('twoFactorAuth');
//     const activityLog = document.getElementById('activityLog');
//     const dataSharing = document.getElementById('dataSharing');
//     if (twoFactorAuth) twoFactorAuth.checked = privacy.twoFactor;
//     if (activityLog) activityLog.checked = privacy.activityLog;
//     if (dataSharing) dataSharing.checked = privacy.dataSharing;
// }

// // Cargar footer dinámicamente
// function loadFooter() {
//     fetch('components/footer.html')
//         .then(response => response.text())
//         .then(data => {
//             document.getElementById('footer-placeholder').innerHTML = data;
//         })
//         .catch(error => console.error('Error cargando footer:', error));
// }

// // Llamar la función
// document.addEventListener('DOMContentLoaded', () => {
//     loadFooter();
// });

// // ===================== INICIALIZAR =====================
// document.addEventListener('DOMContentLoaded', () => {
//     // Cargar datos del perfil
//     loadUserData();

//     // Inicializar panel
//     updateStats();
//     renderDashboard();
//     renderAllProperties();
//     initFilters();
//     initNavigation();
//     toggleFilters();

//     // Asegurar que los mensajes se cargan si es necesario
//     if (document.getElementById('messages-section')) {
//         loadMessages();
//     }
// });

// PROPERTY ID
const params = new URLSearchParams(window.location.search);

const propertyId =
    params.get("id") || "default";

const storageKey =
    `propertyReviews_${propertyId}`;

// VARIABLES
const ratings = {};

const starGroups =
    document.querySelectorAll(".star-group");

const submitButton =
    document.getElementById("submitReview");

// ESTRELLAS POR CATEGORÍA
starGroups.forEach((group) => {

    const category =
        group.dataset.category;

    const stars =
        group.querySelectorAll(".star");

    ratings[category] = 0;

    stars.forEach((star) => {

        star.addEventListener("click", () => {

            const value =
                Number(star.dataset.value);

            ratings[category] = value;

            updateStars(group, value);

        });

        star.addEventListener("mouseover", () => {

            const value =
                Number(star.dataset.value);

            updateStars(group, value);

        });

        star.addEventListener("mouseleave", () => {

            updateStars(
                group,
                ratings[category]
            );

        });

    });

});

// ACTUALIZAR ESTRELLAS
function updateStars(group, value) {

    const stars =
        group.querySelectorAll(".star");

    stars.forEach((star) => {

        const starValue =
            Number(star.dataset.value);

        if (starValue <= value) {

            star.classList.add("active");

        } else {

            star.classList.remove("active");

        }

    });

}

// ENVIAR RESEÑA
submitButton.addEventListener("click", () => {

    const comment =
        document.getElementById("reviewComment").value;

    const hasRating =
        Object.values(ratings).some(
            value => value > 0
        );

    if (!hasRating) {

        alert("Debes evaluar al menos una categoría");

        return;

    }

    if (comment.trim() === "") {

        alert("Debes escribir un comentario");

        return;

    }

    // CALCULAR PROMEDIO
    const values =
        Object.values(ratings).filter(
            value => value > 0
        );

    const total =
        values.reduce(
            (acc, value) => acc + value,
            0
        );

    const average =
        (total / values.length).toFixed(1);

    // OBTENER RESEÑAS
    const reviews =
        JSON.parse(localStorage.getItem(storageKey)) || [];

    // NUEVA RESEÑA
    const newReview = {

        user: "María González",

        date:
            new Date().toLocaleDateString("es-CL"),

        ratings: {
            ...ratings
        },

        average: average,

        comment: comment

    };

    // GUARDAR
    reviews.push(newReview);

    localStorage.setItem(
        storageKey,
        JSON.stringify(reviews)
    );

    // LIMPIAR FORM
    document.getElementById("reviewComment").value = "";

    Object.keys(ratings).forEach((key) => {

        ratings[key] = 0;

    });

    starGroups.forEach((group) => {

        updateStars(group, 0);

    });

    // RENDER
    renderReviews();

});

// RENDER REVIEWS
function renderReviews() {

    const reviews =
        JSON.parse(localStorage.getItem(storageKey)) || [];

    const reviewsContainer =
        document.getElementById("reviewsContainer");

    reviewsContainer.innerHTML = "";

    // SIN RESEÑAS
    if (reviews.length === 0) {

        reviewsContainer.innerHTML =
            `<p>No hay reseñas todavía.</p>`;

        document.getElementById("averageScore").textContent =
            "0.0";

        document.getElementById("totalReviews").textContent =
            "0";

        document.getElementById("averageStars").textContent =
            "☆☆☆☆☆";

        return;

    }

    // PROMEDIO GENERAL
    const totalAverage =
        reviews.reduce((acc, review) => {

            return acc + Number(review.average);

        }, 0);

    const finalAverage =
        (totalAverage / reviews.length).toFixed(1);

    document.getElementById("averageScore").textContent =
        finalAverage;

    document.getElementById("totalReviews").textContent =
        reviews.length;

    document.getElementById("averageStars").textContent =
        "★".repeat(Math.round(finalAverage)) +
        "☆".repeat(5 - Math.round(finalAverage));

    // MOSTRAR RESEÑAS
    reviews
        .slice()
        .reverse()
        .forEach((review) => {

            reviewsContainer.innerHTML += `
                <div class="review-card">

                    <div class="review-header">

                        <div>

                            <div class="review-user">
                                ${review.user}
                            </div>

                            <div class="review-date">
                                ${review.date}
                            </div>

                        </div>

                        <div class="review-stars">
                            ${"★".repeat(Math.round(review.average))}
                        </div>

                    </div>

                    <div class="review-comment">
                        ${review.comment}
                    </div>

                </div>
            `;

        });

}

// INIT
renderReviews();