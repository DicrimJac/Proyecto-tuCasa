// ========== DASHBOARD ARRENDATARIO ==========

// Datos simulados
let userRequests = [
    { id: 1, propertyTitle: "Casa en Santiago Centro", propertyLocation: "Santiago Centro", propertyPrice: 500000, status: "pendiente", date: "2024-05-10" },
    { id: 2, propertyTitle: "Departamento Moderno", propertyLocation: "Providencia", propertyPrice: 350000, status: "aprobada", date: "2024-05-05" }
];

let userRentals = [
    { id: 1, propertyTitle: "Casa en Santiago Centro", startDate: "2024-01-01", endDate: "2024-06-01", status: "finalizado", rating: 0, rated: false },
    { id: 2, propertyTitle: "Casa Familiar", startDate: "2023-07-01", endDate: "2024-01-01", status: "finalizado", rating: 4, rated: true }
];

let userRatings = [
    { id: 1, rentalId: 2, rating: 4, comment: "Buena experiencia" }
];

let userNotifications = [
    { id: 1, type: "solicitud", title: "Solicitud aprobada", message: "Tu solicitud ha sido aprobada", date: "2024-05-12", read: false },
    { id: 2, type: "recordatorio", title: "Pago próximo", message: "El pago del arriendo vence pronto", date: "2024-05-10", read: false }
];

let favoriteProperties = [
    { id: 1, title: "Casa en Vitacura", location: "Vitacura", price: 800000, image: "assets/image/casa1.png" },
    { id: 2, title: "Loft Industrial", location: "Ñuñoa", price: 420000, image: "assets/image/casa2.png" }
];

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function updateStats() {
    document.getElementById('totalRequests').textContent = userRequests.length;
    document.getElementById('activeRentals').textContent = userRentals.filter(r => r.status === 'activo').length;
    
    let avgRating = 0;
    if (userRatings.length > 0) {
        let sum = userRatings.reduce((acc, r) => acc + r.rating, 0);
        avgRating = (sum / userRatings.length).toFixed(1);
    }
    document.getElementById('avgRating').textContent = avgRating;
    document.getElementById('pendingNotifications').textContent = userNotifications.filter(n => !n.read).length;
}

// ========== NOTIFICACIONES ==========
function renderNotifications() {
    const container = document.getElementById('notificationsList');
    const unread = userNotifications.filter(n => !n.read);
    
    if (unread.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-bell-slash"></i><p>No hay notificaciones</p></div>';
        return;
    }
    
    container.innerHTML = unread.map(n => `
        <div class="notification-item unread" onclick="markAsRead(${n.id})">
            <div class="notification-icon"><i class="fas fa-${getIcon(n.type)}"></i></div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-message">${n.message}</div>
                <div class="notification-date">${formatDate(n.date)}</div>
            </div>
        </div>
    `).join('');
}

function getIcon(type) {
    return { solicitud: 'file-alt', recordatorio: 'clock', mensaje: 'envelope' }[type] || 'bell';
}

function markAsRead(id) {
    userNotifications = userNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    renderNotifications();
    updateStats();
    showToast('Notificación marcada como leída');
}

function markAllNotificationsAsRead() {
    userNotifications = userNotifications.map(n => ({ ...n, read: true }));
    renderNotifications();
    updateStats();
    showToast('Todas las notificaciones marcadas como leídas');
}

// ========== SOLICITUDES ACTIVAS ==========
function renderActiveRequests() {
    const container = document.getElementById('activeRequestsList');
    const active = userRequests.filter(r => r.status === 'pendiente' || r.status === 'aprobada');
    
    if (active.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No hay solicitudes activas</p></div>';
        return;
    }
    
    container.innerHTML = active.map(r => `
        <div class="request-card">
            <h4>${r.propertyTitle}</h4>
            <div class="request-location"><i class="fas fa-map-marker-alt"></i> ${r.propertyLocation}</div>
            <div class="request-price">$${r.propertyPrice.toLocaleString()} /mes</div>
            <span class="status-badge status-${r.status}">${r.status === 'pendiente' ? 'Pendiente' : 'Aprobada'}</span>
            <div class="request-actions">
                <button class="btn-outline-sm" onclick="alert('Detalles de ${r.propertyTitle}')">Ver detalles</button>
            </div>
        </div>
    `).join('');
}

// ========== HISTORIAL DE ARRIENDOS ==========
function renderHistory() {
    const container = document.getElementById('historyList');
    const history = userRentals.filter(r => r.status === 'finalizado');
    
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-calendar-times"></i><p>No hay historial de arriendos</p></div>';
        return;
    }
    
    container.innerHTML = history.map(r => `
        <div class="history-item">
            <div class="history-info">
                <h4>${r.propertyTitle}</h4>
                <p>${formatDate(r.startDate)} - ${formatDate(r.endDate)}</p>
            </div>
            <div class="history-rating">
                ${r.rated ? `
                    <div class="stars-small">${generateStars(r.rating)}</div>
                    <span class="btn-rated">Calificado</span>
                ` : `
                    <button class="btn-rate" onclick="openRatingModal(${r.id}, '${r.propertyTitle}')">Calificar</button>
                `}
            </div>
        </div>
    `).join('');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

// ========== FAVORITOS ==========
function renderFavorites() {
    const container = document.getElementById('favoritesList');
    
    if (favoriteProperties.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-heart-broken"></i><p>No hay favoritos</p></div>';
        return;
    }
    
    container.innerHTML = favoriteProperties.map(p => `
        <div class="favorite-card">
            <div class="favorite-image"><img src="${p.image}" alt="${p.title}"></div>
            <div class="favorite-info">
                <h4>${p.title}</h4>
                <div class="favorite-location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
                <div class="favorite-price">$${p.price.toLocaleString()} /mes</div>
                <div class="favorite-actions">
                    <button class="btn-outline-sm" onclick="alert('Detalles de ${p.title}')">Ver</button>
                    <button class="btn-outline-sm" onclick="removeFavorite(${p.id})">Quitar</button>
                </div>
            </div>
        </div>
    `).join('');
}

function removeFavorite(id) {
    favoriteProperties = favoriteProperties.filter(p => p.id !== id);
    renderFavorites();
    showToast('Eliminado de favoritos');
}

// ========== MODAL DE CALIFICACIÓN ==========
let currentRentalId = null;
let selectedRating = 0;

function openRatingModal(rentalId, title) {
    currentRentalId = rentalId;
    selectedRating = 0;
    document.getElementById('rentalTitle').textContent = title;
    document.getElementById('ratingComment').value = '';
    
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(s => s.className = 'far fa-star');
    
    document.getElementById('ratingModal').classList.add('active');
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
    currentRentalId = null;
    selectedRating = 0;
}

function initModalStars() {
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.value);
            stars.forEach((s, i) => {
                s.className = i < selectedRating ? 'fas fa-star selected' : 'far fa-star';
            });
        });
    });
}

function submitRating() {
    if (selectedRating === 0) {
        showToast('Selecciona una calificación', true);
        return;
    }
    
    const comment = document.getElementById('ratingComment').value;
    userRentals = userRentals.map(r => r.id === currentRentalId ? { ...r, rating: selectedRating, rated: true } : r);
    userRatings.push({ id: Date.now(), rentalId: currentRentalId, rating: selectedRating, comment });
    
    closeRatingModal();
    renderHistory();
    updateStats();
    showToast('¡Gracias por calificar!');
}

// ========== FUNCIONES AUXILIARES ==========
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES');
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
    renderNotifications();
    renderActiveRequests();
    renderHistory();
    renderFavorites();
    initModalStars();
    
    document.getElementById('ratingModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('ratingModal')) closeRatingModal();
    });
});

window.markAsRead = markAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.openRatingModal = openRatingModal;
window.closeRatingModal = closeRatingModal;
window.submitRating = submitRating;
window.removeFavorite = removeFavorite;