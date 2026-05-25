// ========== SEARCH PAGE - RECIBIR FILTROS DE HOME ==========

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
allProperties = [];

// Variables de estado
let currentPage = 1;
let filteredProperties = [];
let searchFilters = null;
const itemsPerPage = 6;
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

// Mapeo de categorías
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

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();
}

function getPropertyCategory(property) {
    const typeText = normalizeText(property.type_desc || property.category || property.categoria);
    if (typeText.includes("departamento")) return "departamento";
    if (typeText.includes("pieza")) return "pieza";
    if (typeText.includes("suite")) return "suite";
    if (typeText.includes("mansion")) return "mansion";
    if (typeText.includes("bodega")) return "bodega";
    return "casa";
}

function getPropertyCondition(property) {
    const typeText = normalizeText(property.type_desc || property.condition || property.condicion);
    return typeText.includes("nueva") || typeText.includes("nuevo") ? "nueva" : "usada";
}

function getPropertyLocation(property) {
    const address = property.direccion || property.address || {};
    const parts = [
        property.location,
        property.ubicacion,
        address.comuna,
        address.city,
    ].filter(Boolean);

    return [...new Set(parts)].join(", ") || "Sin ubicación";
}

function normalizeProperty(property, index) {
    const characteristic = property.caracteristica || property.characteristic || {};
    const id = property.id_propi || property.id || property.property_id || index + 1;
    const category = getPropertyCategory(property);

    return {
        id,
        title: property.title || property.titulo || property.name || property.type_desc || `Propiedad ${id}`,
        location: getPropertyLocation(property),
        price: Number(characteristic.price ?? property.price ?? property.precio ?? 0),
        type: normalizeText(property.operation_desc || property.operation || property.type_operation).includes("venta") ? "venta" : "arriendo",
        category,
        condition: getPropertyCondition(property),
        rooms: Number(characteristic.qty_room ?? property.rooms ?? property.habitaciones ?? 0),
        bathrooms: Number(characteristic.qty_bath ?? property.bathrooms ?? property.banos ?? 0),
        area: Number(characteristic.total_mtr ?? property.area ?? property.superficie ?? 0),
        image: property.image || property.imagen || DEFAULT_PROPERTY_IMAGE,
        favorite: false,
        date: property.date_register || property.created_at || property.createdAt || property.date_created || property.date || "",
        raw: property,
    };
}

async function loadPropertiesFromDatabase() {
    const grid = document.getElementById('propertiesGrid');
    if (grid) {
        grid.innerHTML = `<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><h3>Cargando propiedades</h3></div>`;
    }

    const response = await fetch("/api/properties", {
        method: "GET",
        credentials: "same-origin",
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result?.message || result?.error || "No se pudieron cargar las propiedades");
    }

    const properties = Array.isArray(result.data) ? result.data : [];
    allProperties = properties.map(normalizeProperty);
}

// ========== CARGAR FILTROS DESDE LOCALSTORAGE ==========
function loadFiltersFromStorage() {
    const savedFilters = localStorage.getItem('searchFilters');
    console.log('Filtros guardados:', savedFilters);
    
    if (savedFilters) {
        searchFilters = JSON.parse(savedFilters);
        
        // Aplicar filtros
        filteredProperties = allProperties.filter(prop => {
            // Filtro ubicación
            if (searchFilters.location && !prop.location.toLowerCase().includes(searchFilters.location)) {
                return false;
            }
            // Filtro precio mínimo
            if (searchFilters.priceMin && prop.price < searchFilters.priceMin) {
                return false;
            }
            // Filtro precio máximo
            if (searchFilters.priceMax && prop.price > searchFilters.priceMax) {
                return false;
            }
            // Filtro habitaciones
            if (searchFilters.rooms && prop.rooms < parseInt(searchFilters.rooms)) {
                return false;
            }
            // Filtro baños
            if (searchFilters.bathrooms && prop.bathrooms < parseInt(searchFilters.bathrooms)) {
                return false;
            }
            // Filtro categoría
            if (searchFilters.category && prop.category !== searchFilters.category) {
                return false;
            }
            // Filtro condición
            if (searchFilters.condition && prop.condition !== searchFilters.condition) {
                return false;
            }
            return true;
        });
        
        console.log('Propiedades filtradas:', filteredProperties.length);
        
        // Limpiar localStorage después de usarlo
        localStorage.removeItem('searchFilters');
    } else {
        // Si no hay filtros, mostrar todas las propiedades
        filteredProperties = [...allProperties];
    }
    
    // Aplicar ordenamiento por defecto
    applySorting();
}

// ========== ORDENAMIENTO ==========
function applySorting() {
    const sortBy = document.getElementById('sortBy')?.value || 'relevance';
    
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
            filteredProperties.sort((a, b) => a.id - b.id);
            break;
    }
    
    currentPage = 1;
    renderResults();
}

// ========== RENDERIZAR RESULTADOS ==========
function renderResults() {
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedProperties = filteredProperties.slice(start, start + itemsPerPage);
    
    const resultsCount = document.getElementById('resultsCount');
    resultsCount.textContent = `${filteredProperties.length} propiedades encontradas`;
    
    const grid = document.getElementById('propertiesGrid');
    
    if (paginatedProperties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>No se encontraron propiedades</h3>
                <p>Intenta con otros filtros de búsqueda</p>
                <a href="home.html" class="btn-primary" style="margin-top: 1rem; display: inline-block; background: linear-gradient(135deg, #1F3B4C, #2C5A6E); color: white; padding: 0.5rem 1rem; border-radius: 2rem; text-decoration: none;">Volver al inicio</a>
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    grid.innerHTML = paginatedProperties.map(prop => {
        const condicionClass = prop.condition === 'nueva' ? 'nueva' : 'usada';
        return `
            <div class="property-card" onclick="viewPropertyDetail(${prop.id})">
                <div class="property-image">
                    <img src="${prop.image || DEFAULT_PROPERTY_IMAGE}" alt="${prop.title}" onerror="this.src='${DEFAULT_PROPERTY_IMAGE}'">
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
                    </div>
                    <div class="card-tags" style="margin: 0.5rem 0; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                        <span class="categoria" style="background: #eef2f5; color: #2C5A6E; padding: 0.2rem 0.6rem; border-radius: 2rem; font-size: 0.7rem;"><i class="fas fa-building"></i> ${categoryNames[prop.category] || prop.category}</span>
                        <span class="condicion ${condicionClass}" style="padding: 0.2rem 0.6rem; border-radius: 2rem; font-size: 0.7rem; ${prop.condition === 'nueva' ? 'background: #d4edda; color: #155724;' : 'background: #f8f9fa; color: #6c7f8b;'}"><i class="fas fa-star"></i> ${conditionNames[prop.condition] || prop.condition}</span>
                    </div>
                    <div class="property-footer">
                        <span class="property-date">${formatDate(prop.date)}</span>
                        <button class="btn-contact" onclick="contactProperty(event, ${prop.id})">
                            <i class="fas fa-envelope"></i> Contactar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
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

// ========== FAVORITOS ==========
function toggleFavorite(event, propertyId) {
    event.stopPropagation();
    
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        property.favorite = !property.favorite;
        
        const favorites = allProperties.filter(p => p.favorite).map(p => p.id);
        localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
        
        // Actualizar en filteredProperties también
        const propIndex = filteredProperties.findIndex(p => p.id === propertyId);
        if (propIndex !== -1) {
            filteredProperties[propIndex].favorite = property.favorite;
        }
        
        renderResults();
        
        const message = property.favorite ? 'Agregado a favoritos ❤️' : 'Eliminado de favoritos 💔';
        showToast(message);
    }
}

// ========== VER DETALLE ==========
function viewPropertyDetail(propertyId) {
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        localStorage.removeItem('selectedProperty');
        localStorage.setItem('selectedProperty', JSON.stringify(property));
        window.location.href = `detail.html?id=${encodeURIComponent(propertyId)}&t=${Date.now()}`;
    }
}

function contactProperty(event, propertyId) {
    event.stopPropagation();
    const property = allProperties.find(p => p.id === propertyId);
    if (property) {
        showToast(`Contactando a propietario de: ${property.title}`);
    }
}

// ========== FUNCIONES AUXILIARES ==========
function formatDate(dateString) {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');
    
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

// ========== CARGAR FAVORITOS ==========
function loadFavorites() {
    const savedFavorites = localStorage.getItem('favoriteProperties');
    if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        allProperties.forEach(prop => {
            prop.favorite = favorites.includes(prop.id);
        });
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadPropertiesFromDatabase();

        // Cargar favoritos
        loadFavorites();
        
        // Cargar filtros y aplicar
        loadFiltersFromStorage();
        
        // Event listener para ordenamiento
        const sortBySelect = document.getElementById('sortBy');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', applySorting);
        }
        
        console.log('Search page initialized');
    } catch (error) {
        console.error("Error inicializando busqueda:", error);
        filteredProperties = [];
        renderResults();
        showToast(error.message || "No se pudieron cargar las propiedades", true);
    }
});
