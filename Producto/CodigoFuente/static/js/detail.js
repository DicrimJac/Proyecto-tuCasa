// let property = null;
// const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

// const propertyImage = document.getElementById("propertyImage");
// const propertyTitle = document.getElementById("propertyTitle");
// const propertyPrice = document.getElementById("propertyPrice");
// const propertyLocation = document.getElementById("propertyLocation");
// const bedrooms = document.getElementById("bedrooms");
// const bathrooms = document.getElementById("bathrooms");
// const parkingSpaces = document.getElementById("parkingSpaces");
// const propertyArea = document.getElementById("propertyArea");
// const propertyType = document.getElementById("propertyType");
// const operationType = document.getElementById("operationType");
// const propertyDescription = document.getElementById("propertyDescription");
// const featuresBox = document.getElementById("featuresBox");
// const propertyFeatures = document.getElementById("propertyFeatures");
// const mapFrame = document.getElementById("mapFrame");

// const featureLabels = {
//     h_store: { label: "Bodega", icon: "fa-box" },
//     h_parkin: { label: "Estacionamiento", icon: "fa-car" },
//     h_gas: { label: "Gas natural", icon: "fa-fire" },
//     h_air: { label: "Aire acondicionado", icon: "fa-snowflake" },
//     h_heat: { label: "Calefaccion", icon: "fa-temperature-high" },
//     h_pet: { label: "Acepta mascotas", icon: "fa-paw" },
//     h_logia: { label: "Logia", icon: "fa-shirt" },
//     h_energy_solar: { label: "Energia solar", icon: "fa-solar-panel" },
//     h_bioler: { label: "Caldera", icon: "fa-fire-burner" },
//     h_cale: { label: "Calefont", icon: "fa-shower" },
//     h_fire_place: { label: "Chimenea", icon: "fa-fire-flame-curved" },
//     h_gym: { label: "Gimnasio", icon: "fa-dumbbell" },
//     h_parkin_visit: { label: "Estacionamiento visita", icon: "fa-square-parking" },
//     h_elevator: { label: "Ascensor", icon: "fa-elevator" },
//     h_place_kid: { label: "Juegos infantiles", icon: "fa-child-reaching" },
//     h_place_green: { label: "Areas verdes", icon: "fa-tree" },
//     h_salon: { label: "Salon de eventos", icon: "fa-champagne-glasses" },
//     h_alarm: { label: "Alarma", icon: "fa-bell" },
//     h_recip: { label: "Porton automatico", icon: "fa-door-closed" },
//     h_close: { label: "Condominio cerrado", icon: "fa-lock" },
//     h_control: { label: "Acceso controlado", icon: "fa-key" },
//     h_balcony: { label: "Balcon", icon: "fa-city" },
//     h_comedor: { label: "Comedor", icon: "fa-utensils" },
//     h_suite: { label: "Dormitorio en suite", icon: "fa-bed" },
//     h_yard: { label: "Patio", icon: "fa-seedling" },
//     h_walki_clos: { label: "Walking closet", icon: "fa-shirt" },
//     h_pool: { label: "Piscina", icon: "fa-water-ladder" },
//     w_furnitor: { label: "Amoblado", icon: "fa-couch" },
// };

// function normalizeText(value) {
//     return String(value || "")
//         .normalize("NFD")
//         .replace(/\p{Diacritic}/gu, "")
//         .trim()
//         .toLowerCase();
// }

// function getPropertyLocation(rawProperty) {
//     const address = rawProperty.direccion || rawProperty.address || rawProperty.raw?.direccion || {};
//     const parts = [
//         rawProperty.location,
//         rawProperty.ubicacion,
//         address.street && address.number ? `${address.street} ${address.number}` : "",
//         address.comuna,
//         address.city,
//         address.state,
//     ].filter(Boolean);

//     return [...new Set(parts)].join(", ") || "Sin ubicacion";
// }

// function getPropertyType(rawProperty) {
//     return rawProperty.propertyType
//         || rawProperty.type_desc
//         || rawProperty.raw?.type_desc
//         || rawProperty.type
//         || rawProperty.category
//         || "Sin tipo";
// }

// function getCachedPropertyImage(propertyId) {
//     try {
//         const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
//         return cache[propertyId] || "";
//     } catch (error) {
//         console.error("Error leyendo cache de imagenes:", error);
//         return "";
//     }
// }

// function getPropertyImage(rawProperty, propertyId) {
//     const photos = rawProperty.fotos || rawProperty.photos || rawProperty.imagenes || rawProperty.raw?.fotos || [];
//     return photos[0]?.url_foto
//         || photos[0]?.url
//         || rawProperty.url_foto
//         || rawProperty.image
//         || rawProperty.imagen
//         || getCachedPropertyImage(propertyId)
//         || DEFAULT_PROPERTY_IMAGE;
// }

// function isPropertyPublic(rawProperty) {
//     const stateNumber = rawProperty?.state_nbr ?? rawProperty?.status_nbr ?? rawProperty?.raw?.state_nbr;
//     const stateText = normalizeText(rawProperty?.state_desc || rawProperty?.status_desc || rawProperty?.estado || rawProperty?.status || rawProperty?.raw?.state_desc);

//     if (Number(stateNumber) === 0) return false;
//     if (["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText)) {
//         return false;
//     }

//     return true;
// }

// function redirectUnavailableProperty() {
//     localStorage.removeItem("selectedProperty");
//     showToast("Esta propiedad no esta disponible", true);
//     setTimeout(() => {
//         window.location.replace("search.html");
//     }, 900);
// }

// function getOperationType(rawProperty) {
//     const operation = rawProperty.operationType
//         || rawProperty.operation_desc
//         || rawProperty.operation
//         || rawProperty.type_operation
//         || rawProperty.type
//         || "arriendo";

//     return normalizeText(operation).includes("venta") ? "Venta" : "Arriendo";
// }

// function normalizeProperty(rawProperty) {
//     const characteristic = rawProperty.caracteristica || rawProperty.characteristic || rawProperty.raw?.caracteristica || {};
//     const priceValue = Number(characteristic.price ?? rawProperty.price ?? rawProperty.precio ?? 0);
//     const operation = getOperationType(rawProperty);
//     const area = characteristic.total_mtr ?? rawProperty.area ?? rawProperty.propertyArea ?? 0;

//     const id = rawProperty.id_propi || rawProperty.id || rawProperty.property_id || rawProperty.raw?.id_propi || "";

//     return {
//         id,
//         title: rawProperty.title || rawProperty.titulo || rawProperty.name || rawProperty.type_desc || rawProperty.raw?.type_desc || "Propiedad",
//         price: priceValue ? `$${priceValue.toLocaleString()}${operation === "Arriendo" ? " / mes" : ""}` : "Precio no disponible",
//         location: getPropertyLocation(rawProperty),
//         bedrooms: characteristic.qty_room ?? rawProperty.rooms ?? rawProperty.bedrooms ?? 0,
//         bathrooms: characteristic.qty_bath ?? rawProperty.bathrooms ?? rawProperty.banos ?? 0,
//         parkingSpaces: characteristic.h_parkin ? 1 : (rawProperty.parkingSpaces ?? rawProperty.parking ?? 0),
//         propertyArea: area ? `${area} m2` : "Sin informacion",
//         propertyType: getPropertyType(rawProperty),
//         operationType: operation,
//         description: rawProperty.describe || rawProperty.description || rawProperty.descripcion || characteristic.description || "Sin descripcion disponible.",
//         perfil_sector: rawProperty.perfil_sector || null,
//         resumen_sector: rawProperty.resumen_sector || null,
//         metro_cercano: rawProperty.metro_cercano || null,
//         distancia_metro: rawProperty.distancia_metro || null,
//         analisis_ia: rawProperty.analisis_ia || null,
//         features: Object.entries(featureLabels)
//             .filter(([field]) => characteristic[field] === true)
//             .map(([field, data]) => ({ field, ...data })),
//         image: getPropertyImage(rawProperty, id),
//         raw: rawProperty,
//     };
// }

// function renderPropertyFeatures() {
//     if (!featuresBox || !propertyFeatures || !property) return;

//     if (!property.features || property.features.length === 0) {
//         featuresBox.style.display = "none";
//         propertyFeatures.innerHTML = "";
//         return;
//     }

//     featuresBox.style.display = "block";
//     propertyFeatures.innerHTML = property.features.map((feature) => `
//         <div class="feature-item">
//             <span class="feature-icon"><i class="fas ${feature.icon}"></i></span>
//             <span>${feature.label}</span>
//         </div>
//     `).join("");

// }

// function renderSectorData(propertyData) {
//     if (sectorProfile && propertyData.perfil_sector) {
//         sectorProfile.textContent = propertyData.perfil_sector;
//         sectorProfile.style.display = "block";
//     } else if (sectorProfile) {
//         sectorProfile.style.display = "none";
//     }

//     if (metroCercano && propertyData.metro_cercano) {
//         metroCercano.textContent = propertyData.metro_cercano;
//         if (distanciaMetro && propertyData.distancia_metro) {
//             distanciaMetro.textContent = `(${propertyData.distancia_metro})`;
//         }
//     } else if (metroCercano) {
//         metroCercano.textContent = "No hay estación de metro cercana";
//         if (distanciaMetro) distanciaMetro.textContent = "";
//     }
//     const indicadores = propertyData.raw?.indicadores || propertyData.indicadores || {};

//     if (saludCount) saludCount.textContent = indicadores.salud ?? propertyData.salud_count ?? "0";
//     if (educacionCount) educacionCount.textContent = indicadores.educacion ?? propertyData.educacion_count ?? "0";
//     if (areasVerdesCount) areasVerdesCount.textContent = indicadores.areasVerdes ?? propertyData.areas_verdes_count ?? "0";
//     if (gastronomiaCount) gastronomiaCount.textContent = indicadores.gastronomia ?? propertyData.gastronomia_count ?? "0";
//     if (farmaciasCount) farmaciasCount.textContent = indicadores.farmacias ?? propertyData.farmacias_count ?? "0";
//     if (supermercadosCount) supermercadosCount.textContent = indicadores.supermercados ?? propertyData.supermercados_count ?? "0";
//     if (gimnasiosCount) gimnasiosCount.textContent = indicadores.gimnasios ?? propertyData.gimnasios_count ?? "0";
//     if (transporteCount) transporteCount.textContent = indicadores.transporte ?? propertyData.transporte_count ?? "0";
// }

// function renderAI(propertyData) {
//     if (analisisIA) {
//         const analisisTexto = propertyData.analisis_ia || propertyData.analisis || "No hay análisis disponible para este sector.";
//         analisisIA.textContent = analisisTexto;
//     }
//     renderSectorData(propertyData);
// }

// async function loadAIAnalysis(property) {
//     if (property.analisis_ia) {
//         renderAI(property);
//         return;
//     }
//     try {
//         const response = await fetch("/api/properties/analyze", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//                 id_propi: property.id
//             })
//         });

//         const result = await response.json();

//         if (result.exito) {
//             renderAI(result.data);
//         } else {
//             console.error("Error al obtener análisis:", result.error);
//             if (analisisIA) {
//                 analisisIA.textContent = "No se pudo generar el análisis del sector en este momento.";
//             }
//         }
//     } catch (error) {
//         console.error("Error en loadAIAnalysis:", error);
//         if (analisisIA) {
//             analisisIA.textContent = "Error al cargar el análisis del sector.";
//         }
//     }


//     function renderPropertyDetail() {
//         if (!property) return;

//         if (propertyImage) {
//             propertyImage.onerror = () => {
//                 propertyImage.src = DEFAULT_PROPERTY_IMAGE;
//             };
//             propertyImage.src = property.image;
//         }

//         if (propertyTitle) propertyTitle.textContent = property.title;
//         if (propertyPrice) propertyPrice.textContent = property.price;
//         if (propertyLocation) propertyLocation.textContent = property.location;
//         if (bedrooms) bedrooms.textContent = property.bedrooms;
//         if (bathrooms) bathrooms.textContent = property.bathrooms;
//         if (parkingSpaces) parkingSpaces.textContent = property.parkingSpaces;
//         if (propertyArea) propertyArea.textContent = property.propertyArea;
//         if (propertyType) propertyType.textContent = property.propertyType;
//         if (operationType) operationType.textContent = property.operationType;
//         if (propertyDescription) propertyDescription.textContent = property.description;
//         renderPropertyFeatures();
//         loadAIAnalysis(property.raw || property);

//         if (mapFrame && property.location) {
//             const addressURL = encodeURIComponent(property.location);
//             mapFrame.src = `https://www.google.com/maps?q=${addressURL}&output=embed`;
//         }
//     }

//     function getSelectedPropertyFromStorage() {
//         const savedProperty = localStorage.getItem("selectedProperty");
//         if (!savedProperty) return null;

//         try {
//             return JSON.parse(savedProperty);
//         } catch (error) {
//             console.error("Error leyendo propiedad seleccionada:", error);
//             return null;
//         }
//     }

//     function propertyMatchesId(savedProperty, propertyId) {
//         return savedProperty
//             && (String(savedProperty.id) === String(propertyId)
//                 || String(savedProperty.id_propi) === String(propertyId)
//                 || String(savedProperty.raw?.id_propi) === String(propertyId));
//     }

//     async function loadPropertyDetail() {
//         const params = new URLSearchParams(window.location.search);
//         const propertyId = params.get("id");
//         const savedProperty = getSelectedPropertyFromStorage();

//         if (!propertyId) {
//             if (savedProperty?.id || savedProperty?.id_propi || savedProperty?.raw?.id_propi) {
//                 if (!isPropertyPublic(savedProperty)) {
//                     redirectUnavailableProperty();
//                     return;
//                 }

//                 property = normalizeProperty(savedProperty);
//                 renderPropertyDetail();
//             } else {
//                 localStorage.removeItem("selectedProperty");
//                 showToast("No se encontro la propiedad seleccionada", true);
//             }
//             return;
//         }

//         try {
//             const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}?public=true`, {
//                 method: "GET",
//                 credentials: "same-origin",
//             });
//             const result = await response.json();

//             if (!response.ok || !result.success) {
//                 throw new Error(result?.message || result?.error || "No se pudo cargar la propiedad");
//             }

//             property = normalizeProperty(result.data);
//             if (!isPropertyPublic(result.data)) {
//                 redirectUnavailableProperty();
//                 return;
//             }

//             localStorage.setItem("selectedProperty", JSON.stringify(result.data));
//             renderPropertyDetail();
//         } catch (error) {
//             console.error("Error cargando detalle de propiedad:", error);

//             if (propertyMatchesId(savedProperty, propertyId)) {
//                 if (!isPropertyPublic(savedProperty)) {
//                     redirectUnavailableProperty();
//                     return;
//                 }

//                 property = normalizeProperty(savedProperty);
//                 renderPropertyDetail();
//             }

//             showToast(error.message || "No se pudo cargar la propiedad", true);
//         }
//     }

//     const requestRentButton = document.getElementById("requestRentButton");

//     function hasActiveSession() {
//         const userData = localStorage.getItem("userData");
//         const userProfile = localStorage.getItem("userProfile");
//         const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
//             || localStorage.getItem("isLoggedIn") === "true";

//         return isLoggedIn && !!(userData || userProfile);
//     }

//     function requestRent() {
//         if (!hasActiveSession()) {
//             window.location.href = "login.html";
//             return;
//         }

//         const idParam = property?.id ? `?id=${encodeURIComponent(property.id)}` : "";
//         window.location.href = `requestRent.html${idParam}`;
//     }

//     if (requestRentButton) requestRentButton.addEventListener("click", requestRent);

//     function showToast(message, isError = false) {
//         const toast = document.getElementById("notificationToast");
//         const toastMessage = document.getElementById("toastMessage");
//         const toastHeader = toast?.querySelector(".toast-header");

//         if (!toast) return;
//         if (toastMessage) toastMessage.textContent = message;

//         if (isError) {
//             toast.style.borderLeftColor = "#dc3545";
//             const icon = toastHeader?.querySelector("i");
//             if (icon) {
//                 icon.className = "bi bi-exclamation-triangle-fill";
//                 icon.style.color = "#dc3545";
//             }
//             const strong = toastHeader?.querySelector("strong");
//             if (strong) strong.textContent = "Error";
//         } else {
//             toast.style.borderLeftColor = "#2C5A6E";
//             const icon = toastHeader?.querySelector("i");
//             if (icon) {
//                 icon.className = "bi bi-check-circle-fill";
//                 icon.style.color = "#2C5A6E";
//             }
//             const strong = toastHeader?.querySelector("strong");
//             if (strong) strong.textContent = "Exito";
//         }

//         toast.style.display = "block";
//         setTimeout(() => {
//             toast.style.display = "none";
//             if (toastHeader) {
//                 const icon = toastHeader.querySelector("i");
//                 if (icon) icon.className = "bi bi-info-circle-fill";
//                 const strong = toastHeader.querySelector("strong");
//                 if (strong) strong.textContent = "Informacion";
//                 toast.style.borderLeftColor = "#2C5A6E";
//             }
//         }, 3000);
//     }

//     document.addEventListener("DOMContentLoaded", loadPropertyDetail);

let property = null;
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";

// Elementos DOM
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

// Elementos del sector
const sectorProfile = document.getElementById("sectorProfile");
const metroCercano = document.getElementById("metroCercano");
const distanciaMetro = document.getElementById("distanciaMetro");
const saludCount = document.getElementById("saludCount");
const educacionCount = document.getElementById("educacionCount");
const areasVerdesCount = document.getElementById("areasVerdesCount");
const gastronomiaCount = document.getElementById("gastronomiaCount");
const farmaciasCount = document.getElementById("farmaciasCount");
const supermercadosCount = document.getElementById("supermercadosCount");
const gimnasiosCount = document.getElementById("gimnasiosCount");
const transporteCount = document.getElementById("transporteCount");
const analisisIA = document.getElementById("analisisIA");

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
        if (strong) strong.textContent = "Éxito";
    }

    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
        if (toastHeader) {
            const icon = toastHeader.querySelector("i");
            if (icon) icon.className = "bi bi-info-circle-fill";
            const strong = toastHeader.querySelector("strong");
            if (strong) strong.textContent = "Información";
            toast.style.borderLeftColor = "#2C5A6E";
        }
    }, 3000);
}

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

    return [...new Set(parts)].join(", ") || "Sin ubicación";
}

function getPropertyType(rawProperty) {
    return rawProperty.propertyType || rawProperty.type_desc || rawProperty.raw?.type_desc || rawProperty.type || rawProperty.category || "Sin tipo";
}

function getOperationType(rawProperty) {
    const operation = rawProperty.operationType || rawProperty.operation_desc || rawProperty.operation || rawProperty.type_operation || rawProperty.type || "arriendo";
    return normalizeText(operation).includes("venta") ? "Venta" : "Arriendo";
}

function getCachedPropertyImage(propertyId) {
    try {
        const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
        return cache[String(propertyId)] || "";
    } catch (error) {
        console.error("Error leyendo cache de imagenes:", error);
        return "";
    }
}

function getPropertyImage(rawProperty, propertyId) {
    const photos = rawProperty.fotos || rawProperty.photos || rawProperty.imagenes || rawProperty.raw?.fotos || [];
    return photos[0]?.url_foto
        || photos[0]?.url
        || rawProperty.url_foto
        || rawProperty.image
        || rawProperty.imagen
        || getCachedPropertyImage(propertyId)
        || DEFAULT_PROPERTY_IMAGE;
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

function normalizeProperty(rawProperty) {
    const characteristic = rawProperty.caracteristica || rawProperty.characteristic || rawProperty.raw?.caracteristica || {};
    const priceValue = Number(characteristic.price ?? rawProperty.price ?? rawProperty.precio ?? 0);
    const operation = getOperationType(rawProperty);
    const area = characteristic.total_mtr ?? rawProperty.area ?? rawProperty.propertyArea ?? 0;
    const id = rawProperty.id_propi || rawProperty.id || rawProperty.property_id || rawProperty.raw?.id_propi || "";

    console.log("Normalizando propiedad:", { id, rawProperty }); // DEBUG

    return {
        id,
        title: rawProperty.title || rawProperty.titulo || rawProperty.name || rawProperty.type_desc || rawProperty.raw?.type_desc || "Propiedad",
        price: priceValue ? `$${priceValue.toLocaleString()}${operation === "Arriendo" ? " / mes" : ""}` : "Precio no disponible",
        location: getPropertyLocation(rawProperty),
        bedrooms: characteristic.qty_room ?? rawProperty.rooms ?? rawProperty.bedrooms ?? 0,
        bathrooms: characteristic.qty_bath ?? rawProperty.bathrooms ?? rawProperty.banos ?? 0,
        parkingSpaces: characteristic.h_parkin ? 1 : (rawProperty.parkingSpaces ?? rawProperty.parking ?? 0),
        propertyArea: area ? `${area} m2` : "Sin información",
        propertyType: getPropertyType(rawProperty),
        operationType: operation,
        description: rawProperty.describe || rawProperty.description || rawProperty.descripcion || characteristic.description || "Sin descripción disponible.",
        perfil_sector: rawProperty.perfil_sector || null,
        resumen_sector: rawProperty.resumen_sector || null,
        metro_cercano: rawProperty.metro_cercano || null,
        distancia_metro: rawProperty.distancia_metro || null,
        analisis_ia: rawProperty.analisis_ia || null,
        features: Object.entries(featureLabels)
            .filter(([field]) => characteristic[field] === true)
            .map(([field, data]) => ({ field, ...data })),
        image: getPropertyImage(rawProperty, id),
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

// FUNCIÓN PRINCIPAL PARA RENDERIZAR EL SECTOR
function renderSectorData(propertyData) {
    console.log("Renderizando datos del sector:", propertyData); // DEBUG

    // Perfil del sector
    if (sectorProfile) {
        if (propertyData.perfil_sector) {
            sectorProfile.textContent = propertyData.perfil_sector;
            sectorProfile.style.display = "inline-block";
        } else {
            sectorProfile.textContent = "Sin información de perfil";
            sectorProfile.style.display = "inline-block";
        }
    }

    // Metro cercano
    if (metroCercano) {
        metroCercano.textContent = propertyData.metro_cercano || "No hay estación de metro cercana";
    }
    if (distanciaMetro) {
        distanciaMetro.textContent = propertyData.distancia_metro ? `(${propertyData.distancia_metro})` : "";
    }

    // Servicios - Buscar en diferentes lugares donde pueden venir los datos
    let servicios = {};

    if (propertyData.raw?.indicadores) {
        servicios = propertyData.raw.indicadores;
    } else if (propertyData.indicadores) {
        servicios = propertyData.indicadores;
    } else if (propertyData.raw?.servicios) {
        servicios = propertyData.raw.servicios;
    }

    console.log("Servicios encontrados:", servicios); // DEBUG

    if (saludCount) saludCount.textContent = servicios.salud ?? servicios.health ?? "0";
    if (educacionCount) educacionCount.textContent = servicios.educacion ?? servicios.education ?? "0";
    if (areasVerdesCount) areasVerdesCount.textContent = servicios.areasVerdes ?? servicios.green_areas ?? "0";
    if (gastronomiaCount) gastronomiaCount.textContent = servicios.gastronomia ?? servicios.restaurants ?? "0";
    if (farmaciasCount) farmaciasCount.textContent = servicios.farmacias ?? servicios.pharmacies ?? "0";
    if (supermercadosCount) supermercadosCount.textContent = servicios.supermercados ?? servicios.supermarkets ?? "0";
    if (gimnasiosCount) gimnasiosCount.textContent = servicios.gimnasios ?? servicios.gyms ?? "0";
    if (transporteCount) transporteCount.textContent = servicios.transporte ?? servicios.transport ?? "0";
}

function renderAI(propertyData) {
    console.log("Renderizando análisis IA:", propertyData); // DEBUG

    if (analisisIA) {
        const analisisTexto = propertyData.analisis_ia || propertyData.analisis || "No hay análisis disponible para este sector.";
        analisisIA.textContent = analisisTexto;
    }

    renderSectorData(propertyData);
}

// En detail.js, modifica la función loadAIAnalysis
async function loadAIAnalysis(propertyData) {
    console.log("🔵 loadAIAnalysis llamado con propertyData:", propertyData);
    
    // Obtener el ID correctamente
    let propertyId = null;
    
    if (propertyData.id_propi) {
        propertyId = propertyData.id_propi;
    } else if (propertyData.id) {
        propertyId = propertyData.id;
    } else if (propertyData.raw?.id_propi) {
        propertyId = propertyData.raw.id_propi;
    } else if (propertyData.raw?.id) {
        propertyId = propertyData.raw.id;
    }
    
    console.log("📌 ID extraído:", propertyId, "Tipo:", typeof propertyId);
    
    if (!propertyId) {
        console.error("❌ No se pudo obtener el ID de la propiedad");
        if (analisisIA) {
            analisisIA.textContent = "Error: No se pudo identificar la propiedad";
        }
        return;
    }
    
    // Mostrar estado de carga
    if (analisisIA) {
        analisisIA.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando sector...';
    }
    
    // Verificar si ya tiene análisis
    if (propertyData.perfil_sector || propertyData.analisis_ia) {
        console.log("✅ Usando análisis existente");
        renderSectorData(propertyData);
        if (analisisIA && propertyData.analisis_ia) {
            analisisIA.textContent = propertyData.analisis_ia;
        }
        return;
    }
    
    // Solicitar análisis al backend
    try {
        const idString = String(propertyId);
        console.log("📡 Enviando ID como string:", idString);
        
        const response = await fetch("/api/properties/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_propi: idString })
        });
        
        const result = await response.json();
        console.log("📦 Respuesta:", result);
        
        if (result.exito && result.data) {
            console.log("✅ Análisis recibido");
            renderSectorData(result.data);
            if (analisisIA && result.data.analisis_ia) {
                analisisIA.textContent = result.data.analisis_ia;
            }
        } else {
            console.error("❌ Error:", result.error);
            if (analisisIA) {
                analisisIA.textContent = result.error || "Error al analizar el sector";
            }
        }
    } catch (error) {
        console.error("🔴 Error:", error);
        if (analisisIA) {
            analisisIA.textContent = "Error de conexión al servidor";
        }
    }
}

function renderSectorData(data) {
    console.log("🎨 Renderizando datos del sector:", data);
    
    // Perfil del sector
    if (sectorProfile) {
        if (data.perfil_sector) {
            sectorProfile.textContent = data.perfil_sector;
            sectorProfile.style.display = "inline-block";
        } else {
            sectorProfile.textContent = "Cargando...";
        }
    }
    
    // Metro cercano
    if (metroCercano) {
        metroCercano.textContent = data.metro_cercano || "No disponible";
    }
    if (distanciaMetro) {
        distanciaMetro.textContent = data.distancia_metro ? `(${data.distancia_metro})` : "";
    }
    
    // Indicadores (servicios)
    // Los indicadores vienen en data.indicadores o directamente en data
    const indicadores = data.indicadores || {};
    
    if (saludCount) saludCount.textContent = indicadores.salud || data.salud || "0";
    if (educacionCount) educacionCount.textContent = indicadores.educacion || data.educacion || "0";
    if (areasVerdesCount) areasVerdesCount.textContent = indicadores.areasVerdes || data.areasVerdes || "0";
    if (gastronomiaCount) gastronomiaCount.textContent = indicadores.gastronomia || data.gastronomia || "0";
    if (farmaciasCount) farmaciasCount.textContent = indicadores.farmacias || data.farmacias || "0";
    if (supermercadosCount) supermercadosCount.textContent = indicadores.supermercados || data.supermercados || "0";
    if (gimnasiosCount) gimnasiosCount.textContent = indicadores.gimnasios || data.gimnasios || "0";
    if (transporteCount) transporteCount.textContent = indicadores.transporte || data.transporte || "0";
}

function renderPropertyDetail() {
    if (!property) return;

    console.log("🎨 Renderizando propiedad:", property);
    console.log("ID de propiedad:", property.id);
    console.log("Raw de propiedad:", property.raw);
    
    // Renderizar datos básicos...
    if (propertyImage) {
        propertyImage.onerror = async () => {
            propertyImage.onerror = null;
            const fallbackImage = await resolvePropertyImageFallback(property.id);
            propertyImage.src = fallbackImage || DEFAULT_PROPERTY_IMAGE;
        };
        propertyImage.src = property.image || DEFAULT_PROPERTY_IMAGE;
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
    
    // Pasar la propiedad completa (tiene el id)
    loadAIAnalysis(property);
    
    if (mapFrame && property.location) {
        const addressURL = encodeURIComponent(property.location);
        mapFrame.src = `https://www.google.com/maps?q=${addressURL}&output=embed`;
    }
}

async function resolvePropertyImageFallback(propertyId) {
    if (!propertyId) return "";

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/photos`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json().catch(() => null);
        const photos = Array.isArray(result?.data) ? result.data : [];
        return response.ok && result?.success
            ? photos[0]?.url_foto || photos[0]?.url || ""
            : "";
    } catch (error) {
        console.error("Error cargando foto fallback:", error);
        return "";
    }
}

async function loadPropertyDetail() {
    console.log("Cargando detalle de propiedad..."); // DEBUG

    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("id");
    const savedProperty = localStorage.getItem("selectedProperty");

    console.log("Property ID:", propertyId);
    console.log("Saved property:", savedProperty);

    if (!propertyId && !savedProperty) {
        showToast("No se encontró la propiedad seleccionada", true);
        return;
    }

    // Si hay ID en la URL, cargar desde el backend
    if (propertyId) {
        try {
            const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}?public=true`);
            const result = await response.json();

            console.log("Respuesta del backend:", result);

            if (result.success && result.data) {
                if (!isPropertyPublic(result.data)) {
                    showToast("Esta propiedad no está disponible", true);
                    setTimeout(() => window.location.replace("search.html"), 1500);
                    return;
                }

                property = normalizeProperty(result.data);
                localStorage.setItem("selectedProperty", JSON.stringify(result.data));
                renderPropertyDetail();
            } else {
                throw new Error(result.message || "Error al cargar propiedad");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast(error.message, true);
        }
    }
    // Si no hay ID, usar la propiedad guardada
    else if (savedProperty) {
        try {
            const parsedProperty = JSON.parse(savedProperty);
            if (!isPropertyPublic(parsedProperty)) {
                showToast("Esta propiedad no está disponible", true);
                setTimeout(() => window.location.replace("search.html"), 1500);
                return;
            }
            property = normalizeProperty(parsedProperty);
            renderPropertyDetail();
        } catch (error) {
            console.error("Error parsing saved property:", error);
            showToast("Error al cargar la propiedad", true);
        }
    }
}

// Eventos
const requestRentButton = document.getElementById("requestRentButton");

function hasActiveSession() {
    return sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true";
}

function requestRent() {
    if (!hasActiveSession()) {
        window.location.href = "login.html";
        return;
    }
    const idParam = property?.id ? `?id=${encodeURIComponent(property.id)}` : "";
    window.location.href = `requestRent.html${idParam}`;
}

if (requestRentButton) {
    requestRentButton.addEventListener("click", requestRent);
}

// Iniciar
document.addEventListener("DOMContentLoaded", loadPropertyDetail);
