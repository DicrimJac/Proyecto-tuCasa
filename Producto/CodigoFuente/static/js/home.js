// ========== HOME PAGE - CON FILTROS AVANZADOS ==========

// Datos de propiedades
const allProperties = [
  { id: 1, title: "Casa en Santiago", location: "Santiago Centro", price: 500000, rooms: 3, bathrooms: 2, category: "casa", condition: "usada", image: "assets/image/casa1.png", destacada: true, date: "2024-05-15" },
  { id: 2, title: "Departamento moderno", location: "Providencia", price: 350000, rooms: 2, bathrooms: 1, category: "departamento", condition: "nueva", image: "assets/image/casa2.png", destacada: true, date: "2024-05-14" },
  { id: 3, title: "Casa familiar", location: "Las Condes", price: 600000, rooms: 4, bathrooms: 2, category: "casa", condition: "usada", image: "assets/image/casa3.png", destacada: true, date: "2024-05-13" },
  { id: 4, title: "Casa de soltero", location: "Ñuñoa", price: 200000, rooms: 1, bathrooms: 1, category: "casa", condition: "usada", image: "assets/image/casa4.png", destacada: true, date: "2024-05-12" },
  { id: 5, title: "Casa familiar", location: "Vitacura", price: 600000, rooms: 2, bathrooms: 2, category: "casa", condition: "usada", image: "assets/image/casa5.png", destacada: true, date: "2024-05-11" },
  { id: 6, title: "Depto nuevo", location: "La Reina", price: 450000, rooms: 2, bathrooms: 1, category: "departamento", condition: "nueva", image: "assets/image/casa2.png", destacada: false, date: "2024-05-10" },
  { id: 7, title: "Casa amplia", location: "Lo Barnechea", price: 700000, rooms: 4, bathrooms: 3, category: "casa", condition: "usada", image: "assets/image/casa3.png", destacada: false, date: "2024-05-09" },
  { id: 8, title: "Mini departamento", location: "Santiago Centro", price: 300000, rooms: 1, bathrooms: 1, category: "departamento", condition: "usada", image: "assets/image/casa4.png", destacada: false, date: "2024-05-08" },
  { id: 9, title: "Depto nuevo", location: "Providencia", price: 350000, rooms: 2, bathrooms: 1, category: "departamento", condition: "nueva", image: "assets/image/casa2.png", destacada: false, date: "2024-05-07" },
  { id: 10, title: "Casa", location: "Las Condes", price: 650000, rooms: 2, bathrooms: 3, category: "casa", condition: "usada", image: "assets/image/casa3.png", destacada: false, date: "2024-05-06" },
  { id: 11, title: "Departamento pequeño", location: "Ñuñoa", price: 180000, rooms: 1, bathrooms: 1, category: "departamento", condition: "usada", image: "assets/image/casa4.png", destacada: false, date: "2024-05-05" }
];

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

// ========== FUNCIÓN PARA OBTENER FILTROS ==========
function getFilters() {
  return {
    location: document.getElementById('filterLocation').value.toLowerCase().trim(),
    priceMin: parseInt(document.getElementById('priceMin').value) || 0,
    priceMax: parseInt(document.getElementById('priceMax').value) || Infinity,
    rooms: document.getElementById('filterRooms').value,
    bathrooms: document.getElementById('filterBathrooms').value,
    category: document.getElementById('filterCategory').value,
    condition: document.getElementById('filterCondition').value
  };
}

// ========== FUNCIÓN PARA APLICAR FILTROS Y REDIRIGIR ==========
function buscarYRedirigir() {
  const filters = getFilters();
  
  // Guardar filtros en localStorage
  localStorage.setItem('searchFilters', JSON.stringify(filters));
  
  // Redirigir a search.html
  window.location.href = 'search.html';
}

// ========== RENDERIZAR PROPIEDADES EN HOME ==========
function filterPropertiesForHome() {
  const filters = getFilters();
  
  return allProperties.filter(prop => {
    if (filters.location && !prop.location.toLowerCase().includes(filters.location)) return false;
    if (prop.price < filters.priceMin || prop.price > filters.priceMax) return false;
    if (filters.rooms && prop.rooms < parseInt(filters.rooms)) return false;
    if (filters.bathrooms && prop.bathrooms < parseInt(filters.bathrooms)) return false;
    if (filters.category && prop.category !== filters.category) return false;
    if (filters.condition && prop.condition !== filters.condition) return false;
    return true;
  });
}

function renderProperties() {
  const filtered = filterPropertiesForHome();
  
  const destacadas = filtered.filter(p => p.destacada);
  const ultimas = filtered.filter(p => !p.destacada).sort((a, b) => new Date(b.date) - new Date(a.date));

  const destacadasContainer = document.getElementById('propiedadesDestacadas');
  if (destacadas.length === 0) {
    destacadasContainer.innerHTML = '<div class="empty-state">No hay propiedades destacadas</div>';
  } else {
    destacadasContainer.innerHTML = destacadas.map(prop => renderCard(prop)).join('');
  }

  const ultimasContainer = document.getElementById('ultimasPropiedades');
  if (ultimas.length === 0) {
    ultimasContainer.innerHTML = '<div class="empty-state">No hay propiedades disponibles</div>';
  } else {
    ultimasContainer.innerHTML = ultimas.map(prop => renderCard(prop)).join('');
  }
}

function renderCard(prop) {
  const condicionClass = prop.condition === 'nueva' ? 'nueva' : 'usada';
  
  return `
    <div class="card" data-id="${prop.id}" data-precio="${prop.price}" data-habitaciones="${prop.rooms}">
      <img src="${prop.image}" alt="${prop.title}">
      <div class="card-body">
        <h3>${prop.title}</h3>
        <p class="precio">$${prop.price.toLocaleString()} / mes</p>
        <p class="detalle">${prop.rooms} habitaciones · ${prop.bathrooms} baños</p>
        <div class="card-tags">
          <span class="categoria"><i class="fas fa-building"></i> ${categoryNames[prop.category]}</span>
          <span class="condicion ${condicionClass}"><i class="fas fa-star"></i> ${conditionNames[prop.condition]}</span>
        </div>
        <button onclick="verPropiedad(${prop.id})">Ver más</button>
      </div>
    </div>
  `;
}

function clearFilters() {
  document.getElementById('filterLocation').value = '';
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.getElementById('filterRooms').value = '';
  document.getElementById('filterBathrooms').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterCondition').value = '';
  renderProperties();
  showToast('Filtros limpiados');
}

function verPropiedad(id) {
  const propiedad = allProperties.find(p => p.id === id);
  if (propiedad) {
    localStorage.setItem('propiedad', JSON.stringify({
      titulo: propiedad.title,
      precio: propiedad.price,
      habitaciones: propiedad.rooms,
      img: propiedad.image,
      ubicacion: propiedad.location
    }));
    window.location.href = `detail.html?id=${id}`;
  }
}

// ========== CARRUSEL ==========
function initCarousel() {
  const track = document.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevButton = document.querySelector('.prev');
  const nextButton = document.querySelector('.next');
  
  if (!track || slides.length === 0) return;
  
  let currentIndex = 0;
  const slideWidth = slides[0].getBoundingClientRect().width;
  
  function moveToSlide(index) {
    track.style.transform = `translateX(-${index * slideWidth}px)`;
    currentIndex = index;
  }
  
  function updateButtons() {
    if (prevButton) prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
    if (nextButton) nextButton.style.opacity = currentIndex === slides.length - 1 ? '0.5' : '1';
  }
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentIndex > 0) moveToSlide(currentIndex - 1);
      updateButtons();
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) moveToSlide(currentIndex + 1);
      updateButtons();
    });
  }
  
  updateButtons();
  window.addEventListener('resize', () => {
    const newWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * newWidth}px)`;
  });
}

// ========== HEADER ==========
function initHeader() {
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const navMenu = document.getElementById("navMenu");
      if (navMenu) navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }

  const userData = localStorage.getItem("userData");
  const userProfile = localStorage.getItem("userProfile");
  const isLoggedIn = userData || userProfile;

  const registerBtn = document.querySelector(".btn-register-nav");
  const loginBtn = document.querySelector(".btn-login-nav");
  const profileBtn = document.getElementById("profileBtn");
  const greetingSpan = document.getElementById("userGreeting");
  const greetingTextSpan = greetingSpan ? greetingSpan.querySelector(".user-greeting-text") : null;

  if (isLoggedIn) {
    let firstName = "";
    try {
      const data = userData ? JSON.parse(userData) : JSON.parse(userProfile);
      firstName = data.first_name || data.firstName || data.nombre || data.name || "";
    } catch (e) {
      console.error("Error parsing userData", e);
    }

    if (greetingSpan && greetingTextSpan) {
      greetingTextSpan.textContent = firstName ? `Hola! ${firstName}` : "Hola!";
      greetingSpan.style.display = "inline-flex";
    }

    if (registerBtn) registerBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "flex";
  } else {
    if (greetingSpan && greetingTextSpan) {
      greetingSpan.style.display = "none";
    }
    if (registerBtn) registerBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
    if (profileBtn) profileBtn.style.display = "none";
  }
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "home.html";
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

// ========== TOAST ==========
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

// ========== CARGAR COMPONENTES Y EVENTOS ==========
document.addEventListener("DOMContentLoaded", function () {
  // Cargar header
  fetch("components/header.html")
    .then(response => response.ok ? response.text() : Promise.reject('Error loading header'))
    .then(data => {
      document.getElementById("header").innerHTML = data;
      initHeader();
      highlightCurrentPage();
    })
    .catch(error => console.error("Error loading header:", error));

  // Cargar footer
  fetch("components/footer.html")
    .then(response => response.ok ? response.text() : Promise.reject('Error loading footer'))
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(error => console.error("Error loading footer:", error));

  // Inicializar carrusel
  initCarousel();
  
  // Renderizar propiedades
  renderProperties();
  
  // Event listeners
  document.getElementById('searchBtn').addEventListener('click', buscarYRedirigir);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
});