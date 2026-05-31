// ========== HOME PAGE - PROPIEDADES DESDE SUPABASE ==========

let allProperties = [];
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

const categoryNames = {
  casa: "Casa",
  departamento: "Departamento",
  pieza: "Pieza",
  suite: "Suite",
  mansion: "Mansion",
  bodega: "Bodega",
};

const conditionNames = {
  nueva: "Nueva",
  usada: "Usada",
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

  return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getCachedPropertyImage(propertyId) {
  try {
    const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
    return cache[propertyId] || "";
  } catch (error) {
    console.error("Error leyendo cache de imagenes:", error);
    return "";
  }
}

function getPropertyImage(property, propertyId) {
  const photos = property.fotos || property.photos || property.imagenes || [];
  return photos[0]?.url_foto
    || photos[0]?.url
    || property.url_foto
    || property.image
    || property.imagen
    || getCachedPropertyImage(propertyId)
    || DEFAULT_PROPERTY_IMAGE;
}

function isPropertyPublic(property) {
  const stateNumber = property.state_nbr ?? property.status_nbr;
  const stateText = normalizeText(property.state_desc || property.status_desc || property.estado || property.status);

  if (Number(stateNumber) === 0) return false;
  if (["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText)) {
    return false;
  }

  return true;
}

function normalizeProperty(property, index) {
  const characteristic = property.caracteristica || property.characteristic || {};
  const id = property.id_propi || property.id || property.property_id || index + 1;

  return {
    id,
    title: property.title || property.titulo || property.name || property.type_desc || `Propiedad ${id}`,
    location: getPropertyLocation(property),
    price: Number(characteristic.price ?? property.price ?? property.precio ?? 0),
    rooms: Number(characteristic.qty_room ?? property.rooms ?? property.habitaciones ?? 0),
    bathrooms: Number(characteristic.qty_bath ?? property.bathrooms ?? property.banos ?? 0),
    category: getPropertyCategory(property),
    condition: getPropertyCondition(property),
    image: getPropertyImage(property, id),
    destacada: property.destacada ?? property.featured ?? index < 5,
    date: property.date_register || property.created_at || property.createdAt || property.date_created || property.date || "",
    raw: property,
  };
}

async function loadPropertiesFromDatabase() {
  const response = await fetch("/api/properties?public=true", {
    method: "GET",
    credentials: "same-origin",
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result?.message || result?.error || "No se pudieron cargar las propiedades");
  }

  const properties = Array.isArray(result.data) ? result.data : [];
  allProperties = properties
    .filter(isPropertyPublic)
    .map(normalizeProperty);
}

function getFilters() {
  return {
    location: document.getElementById("filterLocation")?.value.toLowerCase().trim() || "",
    priceMin: parseInt(document.getElementById("priceMin")?.value) || 0,
    priceMax: parseInt(document.getElementById("priceMax")?.value) || Infinity,
    rooms: document.getElementById("filterRooms")?.value || "",
    bathrooms: document.getElementById("filterBathrooms")?.value || "",
    category: document.getElementById("filterCategory")?.value || "",
    condition: document.getElementById("filterCondition")?.value || "",
  };
}

function buscarYRedirigir() {
  localStorage.setItem("searchFilters", JSON.stringify(getFilters()));
  window.location.href = "search.html";
}

function filterPropertiesForHome() {
  const filters = getFilters();

  return allProperties.filter((prop) => {
    if (filters.location && !normalizeText(prop.location).includes(normalizeText(filters.location))) return false;
    if (prop.price < filters.priceMin || prop.price > filters.priceMax) return false;
    if (filters.rooms && prop.rooms < parseInt(filters.rooms)) return false;
    if (filters.bathrooms && prop.bathrooms < parseInt(filters.bathrooms)) return false;
    if (filters.category && prop.category !== filters.category) return false;
    if (filters.condition && prop.condition !== filters.condition) return false;
    return true;
  });
}

function renderProperties() {
  const destacadasContainer = document.getElementById("propiedadesDestacadas");
  const ultimasContainer = document.getElementById("ultimasPropiedades");
  if (!destacadasContainer || !ultimasContainer) return;

  const filtered = filterPropertiesForHome();
  const destacadas = filtered.filter((property) => property.destacada);
  const ultimas = filtered
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  destacadasContainer.innerHTML = destacadas.length
    ? destacadas.map((prop) => renderCard(prop)).join("")
    : '<div class="empty-state">No hay propiedades destacadas</div>';

  ultimasContainer.innerHTML = ultimas.length
    ? ultimas.map((prop) => renderCard(prop)).join("")
    : '<div class="empty-state">No hay propiedades disponibles</div>';
}

function renderCard(prop) {
  const condicionClass = prop.condition === "nueva" ? "nueva" : "usada";

  return `
    <div class="card" data-id="${prop.id}" data-precio="${prop.price}" data-habitaciones="${prop.rooms}">
      <img src="${prop.image}" alt="${prop.title}" onerror="this.src='${DEFAULT_PROPERTY_IMAGE}'">
      <div class="card-body">
        <h3>${prop.title}</h3>
        <p class="precio">$${Number(prop.price || 0).toLocaleString()} / mes</p>
        <p class="detalle">${prop.rooms} habitaciones · ${prop.bathrooms} baños</p>
        <div class="card-tags">
          <span class="categoria"><i class="fas fa-building"></i> ${categoryNames[prop.category] || prop.category}</span>
          <span class="condicion ${condicionClass}"><i class="fas fa-star"></i> ${conditionNames[prop.condition] || prop.condition}</span>
        </div>
        <button onclick="verPropiedad(${prop.id})">Ver mas</button>
      </div>
    </div>
  `;
}

function clearFilters() {
  const ids = ["filterLocation", "priceMin", "priceMax", "filterRooms", "filterBathrooms", "filterCategory", "filterCondition"];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.value = "";
  });
  renderProperties();
  showToast("Filtros limpiados");
}

function verPropiedad(id) {
  const propiedad = allProperties.find((prop) => prop.id === id);
  if (!propiedad) return;

  localStorage.removeItem("selectedProperty");
  localStorage.setItem("selectedProperty", JSON.stringify(propiedad.raw || propiedad));
  window.location.href = `detail.html?id=${encodeURIComponent(id)}&t=${Date.now()}`;
}

function initCarousel() {
  const track = document.querySelector(".carousel-track");
  if (!track) return;

  const slides = Array.from(track.children);
  const prevButton = document.querySelector(".prev");
  const nextButton = document.querySelector(".next");
  if (slides.length === 0) return;

  let currentIndex = 0;

  function moveToSlide(index) {
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
    currentIndex = index;
  }

  function updateButtons() {
    if (prevButton) prevButton.style.opacity = currentIndex === 0 ? "0.5" : "1";
    if (nextButton) nextButton.style.opacity = currentIndex === slides.length - 1 ? "0.5" : "1";
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      if (currentIndex > 0) moveToSlide(currentIndex - 1);
      updateButtons();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      if (currentIndex < slides.length - 1) moveToSlide(currentIndex + 1);
      updateButtons();
    });
  }

  updateButtons();
  window.addEventListener("resize", () => moveToSlide(currentIndex));
}

function showToast(message, isError = false) {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastHeader = toast?.querySelector(".toast-header");

  if (!toast || !toastMessage) return;
  toastMessage.textContent = message;

  if (isError) {
    toast.style.borderLeftColor = "#dc3545";
    const icon = toastHeader?.querySelector("i");
    if (icon) {
      icon.className = "bi bi-exclamation-triangle-fill";
      icon.style.color = "#dc3545";
    }
    const strong = toastHeader?.querySelector("strong");
    if (strong) strong.textContent = "Error";
  } else {
    toast.style.borderLeftColor = "#2C5A6E";
    const icon = toastHeader?.querySelector("i");
    if (icon) {
      icon.className = "bi bi-check-circle-fill";
      icon.style.color = "#2C5A6E";
    }
    const strong = toastHeader?.querySelector("strong");
    if (strong) strong.textContent = "Exito";
  }

  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async function () {
  initCarousel();

  document.getElementById("searchBtn")?.addEventListener("click", buscarYRedirigir);
  document.getElementById("clearFiltersBtn")?.addEventListener("click", clearFilters);

  try {
    await loadPropertiesFromDatabase();
    renderProperties();
  } catch (error) {
    console.error("Error cargando propiedades en home:", error);
    renderProperties();
    showToast(error.message || "No se pudieron cargar las propiedades", true);
  }
});
