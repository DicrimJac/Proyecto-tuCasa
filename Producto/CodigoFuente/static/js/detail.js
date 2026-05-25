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
const mapFrame = document.getElementById("mapFrame");

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

    return {
        id: rawProperty.id_propi || rawProperty.id || rawProperty.property_id || rawProperty.raw?.id_propi || "",
        title: rawProperty.title || rawProperty.titulo || rawProperty.name || rawProperty.type_desc || rawProperty.raw?.type_desc || "Propiedad",
        price: priceValue ? `$${priceValue.toLocaleString()}${operation === "Arriendo" ? " / mes" : ""}` : "Precio no disponible",
        location: getPropertyLocation(rawProperty),
        bedrooms: characteristic.qty_room ?? rawProperty.rooms ?? rawProperty.bedrooms ?? 0,
        bathrooms: characteristic.qty_bath ?? rawProperty.bathrooms ?? rawProperty.banos ?? 0,
        parkingSpaces: characteristic.h_parkin ? 1 : (rawProperty.parkingSpaces ?? rawProperty.parking ?? 0),
        propertyArea: area ? `${area} m2` : "Sin informacion",
        propertyType: getPropertyType(rawProperty),
        operationType: operation,
        description: rawProperty.description || rawProperty.descripcion || characteristic.description || "Sin descripcion disponible.",
        image: rawProperty.image || rawProperty.imagen || DEFAULT_PROPERTY_IMAGE,
        raw: rawProperty,
    };
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
            property = normalizeProperty(savedProperty);
            renderPropertyDetail();
        } else {
            localStorage.removeItem("selectedProperty");
            showToast("No se encontro la propiedad seleccionada", true);
        }
        return;
    }

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
            method: "GET",
            credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo cargar la propiedad");
        }

        property = normalizeProperty(result.data);
        localStorage.setItem("selectedProperty", JSON.stringify(result.data));
        renderPropertyDetail();
    } catch (error) {
        console.error("Error cargando detalle de propiedad:", error);

        if (propertyMatchesId(savedProperty, propertyId)) {
            property = normalizeProperty(savedProperty);
            renderPropertyDetail();
        }

        showToast(error.message || "No se pudo cargar la propiedad", true);
    }
}

const whatsappButton = document.getElementById("whatsappButton");
const whatsappModal = document.getElementById("whatsappModal");
const closeModalButton = document.getElementById("closeModal");
const closeButton = document.getElementById("closeButton");

function openModal() {
    if (whatsappModal) {
        whatsappModal.classList.add("active");
    }
}

function closeModal() {
    if (whatsappModal) {
        whatsappModal.classList.remove("active");
    }
}

if (whatsappButton) whatsappButton.addEventListener("click", openModal);
if (closeModalButton) closeModalButton.addEventListener("click", closeModal);
if (closeButton) closeButton.addEventListener("click", closeModal);

if (whatsappModal) {
    whatsappModal.addEventListener("click", (event) => {
        if (event.target === whatsappModal) {
            closeModal();
        }
    });
}

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
