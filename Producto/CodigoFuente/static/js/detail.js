let property = null;
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

const propertyImage = document.getElementById("propertyImage");
const propertyTitle = document.getElementById("propertyTitle");
const propertyPrice = document.getElementById("propertyPrice");
const propertyLocation = document.getElementById("propertyLocation");
const bedrooms = document.getElementById("bedrooms");
const bathrooms = document.getElementById("bathrooms");
const parkingSpaces = document.getElementById("parkingSpaces");
const propertyArea = document.getElementById("propertyArea");
const propertyType = document.getElementById("propertyType");
const operationType = document.getElementById("operationType");
const propertyDescription = document.getElementById("propertyDescription");
const featuresBox = document.getElementById("featuresBox");
const propertyFeatures = document.getElementById("propertyFeatures");
const mapFrame = document.getElementById("mapFrame");

const featureLabels = {
    h_store: { label: "Bodega", icon: "fa-box" },
    h_parkin: { label: "Estacionamiento", icon: "fa-car" },
    h_gas: { label: "Gas natural", icon: "fa-fire" },
    h_air: { label: "Aire acondicionado", icon: "fa-snowflake" },
    h_heat: { label: "Calefaccion", icon: "fa-temperature-high" },
    h_pet: { label: "Acepta mascotas", icon: "fa-paw" },
    h_logia: { label: "Logia", icon: "fa-shirt" },
    h_energy_solar: { label: "Energia solar", icon: "fa-solar-panel" },
    h_bioler: { label: "Caldera", icon: "fa-fire-burner" },
    h_cale: { label: "Calefont", icon: "fa-shower" },
    h_fire_place: { label: "Chimenea", icon: "fa-fire-flame-curved" },
    h_gym: { label: "Gimnasio", icon: "fa-dumbbell" },
    h_parkin_visit: { label: "Estacionamiento visita", icon: "fa-square-parking" },
    h_elevator: { label: "Ascensor", icon: "fa-elevator" },
    h_place_kid: { label: "Juegos infantiles", icon: "fa-child-reaching" },
    h_place_green: { label: "Areas verdes", icon: "fa-tree" },
    h_salon: { label: "Salon de eventos", icon: "fa-champagne-glasses" },
    h_alarm: { label: "Alarma", icon: "fa-bell" },
    h_recip: { label: "Porton automatico", icon: "fa-door-closed" },
    h_close: { label: "Condominio cerrado", icon: "fa-lock" },
    h_control: { label: "Acceso controlado", icon: "fa-key" },
    h_balcony: { label: "Balcon", icon: "fa-city" },
    h_comedor: { label: "Comedor", icon: "fa-utensils" },
    h_suite: { label: "Dormitorio en suite", icon: "fa-bed" },
    h_yard: { label: "Patio", icon: "fa-seedling" },
    h_walki_clos: { label: "Walking closet", icon: "fa-shirt" },
    h_pool: { label: "Piscina", icon: "fa-water-ladder" },
    w_furnitor: { label: "Amoblado", icon: "fa-couch" },
};

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();
}

function getPropertyLocation(rawProperty) {
    const address = rawProperty.direccion || rawProperty.address || rawProperty.raw?.direccion || {};
    const parts = [
        rawProperty.location,
        rawProperty.ubicacion,
        address.street && address.number ? `${address.street} ${address.number}` : "",
        address.comuna,
        address.city,
        address.state,
    ].filter(Boolean);

    return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getPropertyType(rawProperty) {
    return rawProperty.propertyType
        || rawProperty.type_desc
        || rawProperty.raw?.type_desc
        || rawProperty.type
        || rawProperty.category
        || "Sin tipo";
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

function isPropertyPublic(rawProperty) {
    const stateNumber = rawProperty?.state_nbr ?? rawProperty?.status_nbr ?? rawProperty?.raw?.state_nbr;
    const stateText = normalizeText(rawProperty?.state_desc || rawProperty?.status_desc || rawProperty?.estado || rawProperty?.status || rawProperty?.raw?.state_desc);

    if (Number(stateNumber) === 0) return false;
    if (["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText)) {
        return false;
    }

    return true;
}

function redirectUnavailableProperty() {
    localStorage.removeItem("selectedProperty");
    showToast("Esta propiedad no esta disponible", true);
    setTimeout(() => {
        window.location.replace("search.html");
    }, 900);
}

function getOperationType(rawProperty) {
    const operation = rawProperty.operationType
        || rawProperty.operation_desc
        || rawProperty.operation
        || rawProperty.type_operation
        || rawProperty.type
        || "arriendo";

    return normalizeText(operation).includes("venta") ? "Venta" : "Arriendo";
}

function normalizeProperty(rawProperty) {
    const characteristic = rawProperty.caracteristica || rawProperty.characteristic || rawProperty.raw?.caracteristica || {};
    const priceValue = Number(characteristic.price ?? rawProperty.price ?? rawProperty.precio ?? 0);
    const operation = getOperationType(rawProperty);
    const area = characteristic.total_mtr ?? rawProperty.area ?? rawProperty.propertyArea ?? 0;

    const id = rawProperty.id_propi || rawProperty.id || rawProperty.property_id || rawProperty.raw?.id_propi || "";

    return {
        id,
        title: rawProperty.title || rawProperty.titulo || rawProperty.name || rawProperty.type_desc || rawProperty.raw?.type_desc || "Propiedad",
        price: priceValue ? `$${priceValue.toLocaleString()}${operation === "Arriendo" ? " / mes" : ""}` : "Precio no disponible",
        location: getPropertyLocation(rawProperty),
        bedrooms: characteristic.qty_room ?? rawProperty.rooms ?? rawProperty.bedrooms ?? 0,
        bathrooms: characteristic.qty_bath ?? rawProperty.bathrooms ?? rawProperty.banos ?? 0,
        parkingSpaces: characteristic.h_parkin ? 1 : (rawProperty.parkingSpaces ?? rawProperty.parking ?? 0),
        propertyArea: area ? `${area} m2` : "Sin informacion",
        propertyType: getPropertyType(rawProperty),
        operationType: operation,
        description: rawProperty.describe || rawProperty.description || rawProperty.descripcion || characteristic.description || "Sin descripcion disponible.",
        features: Object.entries(featureLabels)
            .filter(([field]) => characteristic[field] === true)
            .map(([field, data]) => ({ field, ...data })),
        image: rawProperty.image || rawProperty.imagen || getCachedPropertyImage(id) || DEFAULT_PROPERTY_IMAGE,
        raw: rawProperty,
    };
}

function renderPropertyFeatures() {
    if (!featuresBox || !propertyFeatures || !property) return;

    if (!property.features || property.features.length === 0) {
        featuresBox.style.display = "none";
        propertyFeatures.innerHTML = "";
        return;
    }

    featuresBox.style.display = "block";
    propertyFeatures.innerHTML = property.features.map((feature) => `
        <div class="feature-item">
            <span class="feature-icon"><i class="fas ${feature.icon}"></i></span>
            <span>${feature.label}</span>
        </div>
    `).join("");
}

function renderPropertyDetail() {
    if (!property) return;

    if (propertyImage) {
        propertyImage.onerror = () => {
            propertyImage.src = DEFAULT_PROPERTY_IMAGE;
        };
        propertyImage.src = property.image;
    }

    if (propertyTitle) propertyTitle.textContent = property.title;
    if (propertyPrice) propertyPrice.textContent = property.price;
    if (propertyLocation) propertyLocation.textContent = property.location;
    if (bedrooms) bedrooms.textContent = property.bedrooms;
    if (bathrooms) bathrooms.textContent = property.bathrooms;
    if (parkingSpaces) parkingSpaces.textContent = property.parkingSpaces;
    if (propertyArea) propertyArea.textContent = property.propertyArea;
    if (propertyType) propertyType.textContent = property.propertyType;
    if (operationType) operationType.textContent = property.operationType;
    if (propertyDescription) propertyDescription.textContent = property.description;
    renderPropertyFeatures();

    if (mapFrame && property.location) {
        const addressURL = encodeURIComponent(property.location);
        mapFrame.src = `https://www.google.com/maps?q=${addressURL}&output=embed`;
    }
}

function getSelectedPropertyFromStorage() {
    const savedProperty = localStorage.getItem("selectedProperty");
    if (!savedProperty) return null;

    try {
        return JSON.parse(savedProperty);
    } catch (error) {
        console.error("Error leyendo propiedad seleccionada:", error);
        return null;
    }
}

function propertyMatchesId(savedProperty, propertyId) {
    return savedProperty
        && (String(savedProperty.id) === String(propertyId)
            || String(savedProperty.id_propi) === String(propertyId)
            || String(savedProperty.raw?.id_propi) === String(propertyId));
}

async function loadPropertyDetail() {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("id");
    const savedProperty = getSelectedPropertyFromStorage();

    if (!propertyId) {
        if (savedProperty?.id || savedProperty?.id_propi || savedProperty?.raw?.id_propi) {
            if (!isPropertyPublic(savedProperty)) {
                redirectUnavailableProperty();
                return;
            }

            property = normalizeProperty(savedProperty);
            renderPropertyDetail();
        } else {
            localStorage.removeItem("selectedProperty");
            showToast("No se encontro la propiedad seleccionada", true);
        }
        return;
    }

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}?public=true`, {
            method: "GET",
            credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo cargar la propiedad");
        }

        property = normalizeProperty(result.data);
        if (!isPropertyPublic(result.data)) {
            redirectUnavailableProperty();
            return;
        }

        localStorage.setItem("selectedProperty", JSON.stringify(result.data));
        renderPropertyDetail();
    } catch (error) {
        console.error("Error cargando detalle de propiedad:", error);

        if (propertyMatchesId(savedProperty, propertyId)) {
            if (!isPropertyPublic(savedProperty)) {
                redirectUnavailableProperty();
                return;
            }

            property = normalizeProperty(savedProperty);
            renderPropertyDetail();
        }

        showToast(error.message || "No se pudo cargar la propiedad", true);
    }
}

const requestRentButton = document.getElementById("requestRentButton");

function hasActiveSession() {
    const userData = localStorage.getItem("userData");
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
        || localStorage.getItem("isLoggedIn") === "true";

    return isLoggedIn && !!(userData || userProfile);
}

function requestRent() {
    if (!hasActiveSession()) {
        window.location.href = "login.html";
        return;
    }

    const idParam = property?.id ? `?id=${encodeURIComponent(property.id)}` : "";
    window.location.href = `requestRent.html${idParam}`;
}

if (requestRentButton) requestRentButton.addEventListener("click", requestRent);

function showToast(message, isError = false) {
    const toast = document.getElementById("notificationToast");
    const toastMessage = document.getElementById("toastMessage");
    const toastHeader = toast?.querySelector(".toast-header");

    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;

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
        if (toastHeader) {
            const icon = toastHeader.querySelector("i");
            if (icon) icon.className = "bi bi-info-circle-fill";
            const strong = toastHeader.querySelector("strong");
            if (strong) strong.textContent = "Informacion";
            toast.style.borderLeftColor = "#2C5A6E";
        }
    }, 3000);
}

document.addEventListener("DOMContentLoaded", loadPropertyDetail);
