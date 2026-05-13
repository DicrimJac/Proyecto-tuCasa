// ========== SEARCH PAGE - DATOS SIMULADOS ==========
let allProperties = [
    {
        id: 1,
        title: "Casa en Santiago Centro",
        location: "Santiago Centro, Santiago",
        price: 500000,
        type: "arriendo",
        category: "casa",
        condition: "usada",
        rooms: 3,
        bathrooms: 2,
        area: 120,
        image: "assets/image/casa1.png",
        favorite: false,
        date: "2024-03-15"
    },
    {
        id: 2,
        title: "Departamento Moderno",
        location: "Providencia, Santiago",
        price: 350000,
        type: "arriendo",
        category: "departamento",
        condition: "nueva",
        rooms: 2,
        bathrooms: 1,
        area: 75,
        image: "assets/image/casa2.png",
        favorite: false,
        date: "2024-03-20"
    },
    {
        id: 3,
        title: "Casa Familiar",
        location: "Las Condes, Santiago",
        price: 600000,
        type: "arriendo",
        category: "casa",
        condition: "usada",
        rooms: 4,
        bathrooms: 3,
        area: 180,
        image: "assets/image/casa3.png",
        favorite: false,
        date: "2024-04-01"
    },
    {
        id: 4,
        title: "Loft Industrial",
        location: "Ñuñoa, Santiago",
        price: 420000,
        type: "arriendo",
        category: "departamento",
        condition: "nueva",
        rooms: 1,
        bathrooms: 1,
        area: 55,
        image: "assets/image/casa4.png",
        favorite: false,
        date: "2024-04-10"
    },
    {
        id: 5,
        title: "Casa en Vitacura",
        location: "Vitacura, Santiago",
        price: 800000,
        type: "arriendo",
        category: "casa",
        condition: "usada",
        rooms: 5,
        bathrooms: 4,
        area: 250,
        image: "assets/image/casa1.png",
        favorite: false,
        date: "2024-04-15"
    },
    {
        id: 6,
        title: "Pieza en Casa Compartida",
        location: "La Reina, Santiago",
        price: 200000,
        type: "arriendo",
        category: "pieza",
        condition: "usada",
        rooms: 1,
        bathrooms: 1,
        area: 15,
        image: "assets/image/casa2.png",
        favorite: false,
        date: "2024-04-20"
    },
    {
        id: 7,
        title: "Suite Premium",
        location: "Vitacura, Santiago",
        price: 450000,
        type: "arriendo",
        category: "suite",
        condition: "nueva",
        rooms: 1,
        bathrooms: 1,
        area: 40,
        image: "assets/image/casa3.png",
        favorite: false,
        date: "2024-04-25"
    },
    {
        id: 8,
        title: "Mansión en Lo Barnechea",
        location: "Lo Barnechea, Santiago",
        price: 2500000,
        type: "arriendo",
        category: "mansion",
        condition: "nueva",
        rooms: 6,
        bathrooms: 5,
        area: 500,
        image: "assets/image/casa4.png",
        favorite: false,
        date: "2024-04-28"
    },
    {
        id: 9,
        title: "Bodega Industrial",
        location: "Quilicura, Santiago",
        price: 800000,
        type: "arriendo",
        category: "bodega",
        condition: "usada",
        rooms: 0,
        bathrooms: 1,
        area: 200,
        image: "assets/image/casa1.png",
        favorite: false,
        date: "2024-05-01"
    },
    {
        id: 10,
        title: "Casa Nueva en Venta",
        location: "Las Condes, Santiago",
        price: 150000000,
        type: "venta",
        category: "casa",
        condition: "nueva",
        rooms: 4,
        bathrooms: 3,
        area: 200,
        image: "assets/image/casa2.png",
        favorite: false,
        date: "2024-05-05"
    },
    {
        id: 11,
        title: "Departamento Usado en Venta",
        location: "Providencia, Santiago",
        price: 85000000,
        type: "venta",
        category: "departamento",
        condition: "usada",
        rooms: 3,
        bathrooms: 2,
        area: 85,
        image: "assets/image/casa3.png",
        favorite: false,
        date: "2024-05-10"
    }
];

// Variables de estado
let currentPage = 1;
let filteredProperties = [...allProperties];
const itemsPerPage = 6;

// Mapeo de categorías para mostrar en español
const categoryNames = {
    'casa': 'Casa',
    'departamento': 'Departamento',
    'pieza': 'Pieza',
    'suite': 'Suite',
    'mansion': 'Mansión',
    'bodega': 'Bodega'
};

const conditionNames = {
    'nueva': 'Nueva',
    'usada': 'Usada'
};

// ========== FUNCIONES PRINCIPALES ==========
function loadProperties() {
    // Cargar favoritos desde localStorage
    const savedFavorites = localStorage.getItem('favoriteProperties');
    if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        allProperties.forEach(prop => {
            prop.favorite = favorites.includes(prop.id);
        });
        filteredProperties.forEach(prop => {
            prop.favorite = favorites.includes(prop.id);
        });
    }
    
    applyFilters();
}

function applyFilters() {
    const location = document.getElementById('filterLocation').value.toLowerCase().trim();
    const priceMin = parseInt(document.getElementById('priceMin').value) || 0;
    const priceMax = parseInt(document.getElementById('priceMax').value) || Infinity;
    const rooms = document.getElementById('filterRooms').value;
    const bathrooms = document.getElementById('filterBathrooms').value;
    const category = document.getElementById('filterCategory').value;
    const condition = document.getElementById('filterCondition').value;
    const type = document.getElementById('filterType').value;
    
    filteredProperties = allProperties.filter(prop => {
        // Filtro ubicación
        if (location && !prop.location.toLowerCase().includes(location)) return false;
        
        // Filtro precio
        if (prop.price < priceMin || prop.price > priceMax) return false;
        
        // Filtro habitaciones
        if (rooms && prop.rooms < parseInt(rooms)) return false;
        
        // Filtro baños
        if (bathrooms && prop.bathrooms < parseInt(bathrooms)) return false;
        
        // NUEVO: Filtro categoría
        if (category && prop.category !== category) return false;
        
        // NUEVO: Filtro estado (nueva/usada)
        if (condition && prop.condition !== condition) return false;
        
        // Filtro tipo (operación)
        if (type && prop.type !== type) return false;
        
        return true;
    });
    
    applySorting();
}

function applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch(sortBy) {
        case 'price-asc':
            filteredProperties.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filteredProperties.sort((a, b) => b.price - a.price);
            break;
        case 'rooms':
            filteredProperties.sort((a, b) => b.rooms - a.rooms);
            break;
        default:
            // Relevancia: mantener orden original
            break;
    }
    
    renderResults();
}

function renderResults() {
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filteredProperties.slice(start, start + itemsPerPage);
    
    // Actualizar contador
    const resultsCount = document.getElementById('resultsCount');
    resultsCount.textContent = `${filteredProperties.length} propiedades encontradas`;
    
    // Renderizar grid
    const grid = document.getElementById('propertiesGrid');
    
    if (paginatedProperties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>No se encontraron propiedades</h3>
                <p>Intenta con otros filtros de búsqueda</p>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginatedProperties.map(prop => `
        <div class="property-card" onclick="viewPropertyDetail(${prop.id})">
            <div class="property-image">
                <img src="${prop.image || 'assets/image/default-house.jpg'}" alt="${prop.title}">
                <span class="property-type">${prop.type === 'arriendo' ? 'Arriendo' : 'Venta'}</span>
                <div class="property-favorite" onclick="toggleFavorite(event, ${prop.id})">
                    <i class="${prop.favorite ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </div>
            </div>
            <div class="property-info">
                <h3 class="property-title">${prop.title}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i> ${prop.location}
                </div>
                <div class="property-price">
                    $${prop.price.toLocaleString()} ${prop.type === 'arriendo' ? '/mes' : ''}
                </div>
                <div class="property-features">
                    <span><i class="fas fa-bed"></i> ${prop.rooms} hab.</span>
                    <span><i class="fas fa-bath"></i> ${prop.bathrooms} baños</span>
                    <span><i class="fas fa-building"></i> ${categoryNames[prop.category] || prop.category}</span>
                    <span><i class="fas fa-star"></i> ${conditionNames[prop.condition] || prop.condition}</span>
                </div>
                <div class="property-footer">
                    <span class="property-date">Publicado: ${formatDate(prop.date)}</span>
                    <button class="btn-contact" onclick="contactProperty(event, ${prop.id})">
                        <i class="fas fa-envelope"></i> Contactar
                    </button>
                </div>
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
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderResults();
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

function clearFilters() {
    document.getElementById('filterLocation').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('filterRooms').value = '';
    document.getElementById('filterBathrooms').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterCondition').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('sortBy').value = 'relevance';
    
    currentPage = 1;
    applyFilters();
}

function toggleFavorite(event, propertyId) {
    event.stopPropagation();
    
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        property.favorite = !property.favorite;
        
        const favorites = allProperties.filter(p => p.favorite).map(p => p.id);
        localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
        
        applyFilters();
        
        const message = property.favorite ? 'Agregado a favoritos ❤️' : 'Eliminado de favoritos 💔';
        showToast(message);
    }
}

function viewPropertyDetail(propertyId) {
    // Guardar la propiedad seleccionada en localStorage para la página de detalle
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        localStorage.setItem('selectedProperty', JSON.stringify(property));
        window.location.href = `detail.html?id=${propertyId}`;
    }
}

function contactProperty(event, propertyId) {
    event.stopPropagation();
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        showToast(`Contactando a propietario de: ${property.title}`);
    }
}

function formatDate(dateString) {
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
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            if (icon) icon.className = 'bi bi-info-circle-fill';
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Información';
            toast.style.borderLeftColor = '#2C5A6E';
        }
    }, 3000);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    loadProperties();
    
    document.getElementById('searchBtn').addEventListener('click', () => {
        currentPage = 1;
        applyFilters();
    });
    
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('sortBy').addEventListener('change', applySorting);
    
    const inputs = ['filterLocation', 'priceMin', 'priceMax'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentPage = 1;
                applyFilters();
            }
        });
    });
});