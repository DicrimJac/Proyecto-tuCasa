// ========== PUBLISH PROPERTY - TU CASA ==========

// Variables globales
let selectedImages = [];
let mainImageIndex = null;
const PROPERTY_IMAGE_CACHE_KEY = "propertyImageCache";
const OWNER_PROPERTY_IDS_KEY = "ownerPropertyIds";
let editingPropertyId = null;
let editingPropertyData = null;
let isPublishing = false;

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
    // Verificar sesión: solo usuarios logueados pueden publicar
    const userData = localStorage.getItem("userData");
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = !!(userData || userProfile);

    if (!isLoggedIn) {
        window.location.href = "login.html";
        return;
    }

    // Radio cards
    document.querySelectorAll(".options").forEach(group => {
        const cards = group.querySelectorAll(".option-card");
        cards.forEach(card => {
            card.addEventListener("click", () => {
                cards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                const input = card.querySelector("input");
                if (input) input.checked = true;
            });
        });
    });

    // Contador descripción
    initDescriptionCounter();

    // Input imágenes
    initImages();
    initEditMode();
});

// Nota: el header y el footer se cargan globalmente desde js/headerfooter.js,
// por lo que no es necesario recargarlos aquí.

// Navegación pasos
function nextStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function prevStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Validaciones
function validateStep1() {
    const category = document.querySelector('input[name="category"]:checked');
    const condition = document.querySelector('input[name="condition"]:checked');
    if (!category || !condition) {
        showToast("Completa todos los campos", true);
        return;
    }
    nextStep(2);
}

function validateStep2() {
    const street = document.getElementById("street")?.value.trim();
    const number = document.getElementById("number")?.value.trim();
    const comuna = document.getElementById("comuna")?.value.trim();
    const city = document.getElementById("city")?.value.trim();
    const state = document.getElementById("state")?.value.trim();

    if (!street || !number || !comuna || !city || !state) {
        showToast("Completa todos los datos de dirección", true);
        return;
    }

    if (street.length < 3 || comuna.length < 3 || city.length < 3) {
        showToast("Ingresa una dirección válida", true);
        return;
    }

    nextStep(3);
}

function validateStep3() {
    const files = document.getElementById("images").files;
    if (files.length === 0 && !editingPropertyId) {
        showToast("Debes subir al menos una imagen", true);
        return;
    }
    nextStep(4);
}

function validateStep4() {
    const total = document.getElementById("totalArea").value;
    const usable = document.getElementById("usableArea").value;
    const bedrooms = document.getElementById("bedrooms").value;
    const bathrooms = document.getElementById("bathrooms").value;
    const price = document.getElementById("price").value;
    const desc = document.getElementById("description").value;

    if (!total || !usable || !bedrooms || !bathrooms || !price || !desc) {
        showToast("Completa todos los campos obligatorios", true);
        return;
    }
    nextStep(5);
}

function validateStep5() {
    const plan = document.getElementById("selectedPlan").value;
    if (!plan) {
        showToast("Selecciona un plan", true);
        return;
    }
    generateSummary();
}

function cancelForm() {
    if (confirm("¿Deseas cancelar la publicación?")) {
        window.location.href = "home.html";
    }
}

// Imágenes
function initImages() {
    const input = document.getElementById("images");
    if (!input) return;

    const fileUpload = document.querySelector(".file-upload");
    if (fileUpload) {
        fileUpload.addEventListener("click", () => input.click());
    }

    input.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 20) {
            showToast("Máximo 20 imágenes", true);
            return;
        }
        files.forEach(file => selectedImages.push(file));
        renderImages();
    });
}

function renderImages() {
    const preview = document.getElementById("imagePreview");
    if (!preview) return;
    preview.innerHTML = "";

    selectedImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const card = document.createElement("div");
            card.classList.add("image-card");
            card.innerHTML = `
                <img src="${e.target.result}">
                <div class="img-actions">
                    <button class="btn-main" onclick="setMain(${index})">⭐</button>
                    <button class="btn-delete" onclick="removeImage(${index})">✖</button>
                </div>
            `;
            preview.appendChild(card);
            if (mainImageIndex === null && index === 0) setMain(0);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedImages.splice(index, 1);
    if (mainImageIndex === index) {
        mainImageIndex = null;
        document.getElementById("mainImage").src = "";
        const placeholder = document.getElementById("mainImagePlaceholder");
        if (placeholder) placeholder.style.display = "block";
    }
    renderImages();
}

function setMain(index) {
    mainImageIndex = index;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById("mainImage").src = e.target.result;
        const placeholder = document.getElementById("mainImagePlaceholder");
        if (placeholder) placeholder.style.display = "none";
    };
    reader.readAsDataURL(selectedImages[index]);
}

// Contador descripción
function getLoggedOwnerKey() {
    const savedData = localStorage.getItem("userData") || localStorage.getItem("userProfile");
    if (savedData) {
        try {
            const user = JSON.parse(savedData);
            return (user.mail || user.email || user.correo || user.id_usuario || user.id || "owner").toString().trim().toLowerCase();
        } catch (error) {
            console.error("Error leyendo usuario logueado:", error);
        }
    }

    return (localStorage.getItem("userEmail") || "owner").trim().toLowerCase();
}

function getMainImageFile() {
    if (selectedImages.length === 0) return null;
    return selectedImages[mainImageIndex ?? 0] || selectedImages[0];
}

function fileToCompressedDataUrl(file, maxSize = 900, quality = 0.72) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("No se pudo procesar la imagen"));
            image.onload = () => {
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));
                canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

function savePropertyImageToCache(propertyId, imageDataUrl) {
    if (!propertyId || !imageDataUrl) return;

    try {
        const cache = JSON.parse(localStorage.getItem(PROPERTY_IMAGE_CACHE_KEY) || "{}");
        cache[String(propertyId)] = imageDataUrl;
        localStorage.setItem(PROPERTY_IMAGE_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
        console.error("No se pudo guardar la imagen en cache:", error);
        showToast("La propiedad se publico, pero la imagen no pudo guardarse en cache local", true);
    }
}

function saveOwnerPropertyId(propertyId) {
    if (!propertyId) return;

    const ownerKey = getLoggedOwnerKey();
    const allOwners = JSON.parse(localStorage.getItem(OWNER_PROPERTY_IDS_KEY) || "{}");
    const ownerIds = new Set((allOwners[ownerKey] || []).map(String));
    ownerIds.add(String(propertyId));
    allOwners[ownerKey] = [...ownerIds];
    localStorage.setItem(OWNER_PROPERTY_IDS_KEY, JSON.stringify(allOwners));
}

async function uploadPropertyPhotos(propertyId) {
    if (!propertyId || selectedImages.length === 0) return [];

    const formData = new FormData();
    selectedImages.forEach((file) => {
        formData.append("photos", file, file.name);
    });

    const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}/photos`, {
        method: "POST",
        credentials: "include",
        body: formData,
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
        throw new Error(result?.message || result?.error || "No se pudieron subir las fotos");
    }

    return Array.isArray(result.data) ? result.data : [];
}

function getCachedPropertyImage(propertyId) {
    try {
        const cache = JSON.parse(localStorage.getItem(PROPERTY_IMAGE_CACHE_KEY) || "{}");
        return cache[String(propertyId)] || "";
    } catch (error) {
        console.error("Error leyendo cache de imagen:", error);
        return "";
    }
}

function setInputValue(id, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

function selectRadio(name, value) {
    const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (!input) return;
    input.checked = true;
    const card = input.closest(".option-card");
    const group = input.closest(".options");
    group?.querySelectorAll(".option-card").forEach(item => item.classList.remove("selected"));
    card?.classList.add("selected");
}

function categoryFromType(typeDesc = "") {
    const value = typeDesc.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    if (value.includes("departamento")) return "departamento";
    if (value.includes("pieza")) return "pieza";
    if (value.includes("suite")) return "suite";
    if (value.includes("mansion")) return "mansion";
    if (value.includes("bodega")) return "bodega";
    return "casa";
}

function conditionFromType(typeDesc = "") {
    const value = typeDesc.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    return value.includes("nueva") || value.includes("nuevo") ? "nueva" : "usada";
}

function qtyYearToAge(qtyYear) {
    if (qtyYear === 0) return "Menos de 1 aÃ±o";
    if (qtyYear <= 5) return "1 - 5 aÃ±os";
    if (qtyYear <= 10) return "5 - 10 aÃ±os";
    return "10+ aÃ±os";
}

function renderCachedMainImage(propertyId) {
    const image = getCachedPropertyImage(propertyId);
    if (!image) return;

    const mainImage = document.getElementById("mainImage");
    const placeholder = document.getElementById("mainImagePlaceholder");
    const summaryMainImage = document.getElementById("summaryMainImage");
    if (mainImage) mainImage.src = image;
    if (summaryMainImage) summaryMainImage.src = image;
    if (placeholder) placeholder.style.display = "none";
}

async function initEditMode() {
    const params = new URLSearchParams(window.location.search);
    editingPropertyId = params.get("id");
    if (!editingPropertyId) return;

    try {
        const response = await fetch(`/api/properties/${encodeURIComponent(editingPropertyId)}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result?.message || result?.error || "No se pudo cargar la propiedad");
        }

        editingPropertyData = result.data;
        fillEditForm(editingPropertyData);
    } catch (error) {
        console.error("Error cargando propiedad para editar:", error);
        showToast(error.message || "No se pudo cargar la propiedad", true);
    }
}

function fillEditForm(property) {
    const address = property.direccion || {};
    const characteristic = property.caracteristica || {};
    const typeDesc = property.type_desc || "";

    document.querySelector(".page-hero-container h1").textContent = "Editar Propiedad";
    document.querySelector(".page-hero-container p").textContent = "Actualiza la informacion de tu propiedad";

    selectRadio("category", categoryFromType(typeDesc));
    selectRadio("condition", conditionFromType(typeDesc));

    setInputValue("street", address.street);
    setInputValue("number", address.number);
    setInputValue("comuna", address.comuna);
    setInputValue("city", address.city);
    setInputValue("state", address.state);
    setInputValue("totalArea", characteristic.total_mtr);
    setInputValue("usableArea", characteristic.surface_mtr);
    setInputValue("bedrooms", characteristic.qty_room >= 5 ? "5+" : characteristic.qty_room);
    setInputValue("bathrooms", characteristic.qty_bath >= 5 ? "5+" : characteristic.qty_bath);
    setInputValue("age", qtyYearToAge(characteristic.qty_year));
    setInputValue("floors", characteristic.qty_floor >= 5 ? "5+" : characteristic.qty_floor);
    setInputValue("orientation", characteristic.orientation);
    setInputValue("description", property.describe || property.description || property.descripcion);
    setInputValue("price", characteristic.price);
    setInputValue("selectedPlan", characteristic.type_publis_desc || "BÃ¡sico");

    const charCount = document.getElementById("charCount");
    const description = document.getElementById("description");
    if (charCount && description) {
        charCount.textContent = `${description.value.length} / 3000`;
    }

    document.querySelectorAll('.check-grid input[type="checkbox"][data-field]').forEach(input => {
        input.checked = characteristic[input.dataset.field] === true;
    });

    renderCachedMainImage(property.id_propi);
    updateMap();
}

function initDescriptionCounter() {
    const desc = document.getElementById("description");
    const count = document.getElementById("charCount");
    if (!desc) return;
    desc.addEventListener("input", () => {
        count.textContent = `${desc.value.length} / 3000`;
    });
}

// Planes
function selectPlan(card, plan) {
    document.querySelectorAll(".plan-card").forEach(c => c.classList.remove("selected-plan"));
    card.classList.add("selected-plan");
    document.getElementById("selectedPlan").value = plan;
}

// Generar resumen
function generateSummary() {
    const category = document.querySelector('input[name="category"]:checked')?.parentElement?.querySelector("span")?.textContent || "";
    const condition = document.querySelector('input[name="condition"]:checked')?.parentElement?.querySelector("span")?.textContent || "";
    const street = document.getElementById("street")?.value || "";
    const number = document.getElementById("number")?.value || "";
    const comuna = document.getElementById("comuna")?.value || "";
    const city = document.getElementById("city")?.value || "";
    const state = document.getElementById("state")?.value || "";
    const address = `${street} ${number}, ${comuna}, ${city}, ${state}`.trim();
    const bedrooms = document.getElementById("bedrooms").value;
    const bathrooms = document.getElementById("bathrooms").value;
    const totalArea = document.getElementById("totalArea").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const currency = document.getElementById("currency").value;
    const plan = document.getElementById("selectedPlan").value;

    document.getElementById("summaryCategory").textContent = category;
    document.getElementById("summaryCondition").textContent = condition;
    document.getElementById("summaryAddress").textContent = address;
    document.getElementById("summaryBedrooms").textContent = bedrooms;
    document.getElementById("summaryBathrooms").textContent = bathrooms;
    document.getElementById("summaryTotalArea").textContent = totalArea + " m²";
    document.getElementById("summaryPrice").textContent = currency + " " + parseInt(price).toLocaleString();
    document.getElementById("summaryPlan").textContent = plan;
    document.getElementById("summaryDescription").textContent = description;

    const firstImage = document.querySelector("#imagePreview img");
    if (firstImage) {
        document.getElementById("summaryMainImage").src = firstImage.src;
    }

    nextStep(6);
}

// Publicar propiedad
async function publishProperty() {
    if (isPublishing) return;

    const publishButton = document.querySelector('button[onclick="publishProperty()"]');
    const originalButtonHtml = publishButton?.innerHTML;
    isPublishing = true;
    if (publishButton) {
        publishButton.disabled = true;
        publishButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
    }

    try {
        // Paso 1: categoría y condición
        const categoryInput = document.querySelector('input[name="category"]:checked');
        const conditionInput = document.querySelector('input[name="condition"]:checked');

        if (!categoryInput || !conditionInput) {
            showToast("Falta categoría o condición", true);
            return;
        }

        const categoryValue = categoryInput.value; // departamento, casa, etc.
        const categoryText = categoryInput.parentElement?.querySelector("span")?.textContent?.trim() || "";
        const conditionText = conditionInput.parentElement?.querySelector("span")?.textContent?.trim() || "";

        const typeMap = {
            "departamento": 1,
            "casa": 2,
            "pieza": 3,
            "suite": 4,
            "mansion": 5,
            "bodega": 6,
        };

        const type_nbr = typeMap[categoryValue] ?? null;
        if (!type_nbr) {
            showToast("Categoría de propiedad inválida", true);
            return;
        }

        const type_desc = `${categoryText} ${conditionText.toLowerCase()}`.trim();

        // Paso 2: dirección
        const street = document.getElementById("street")?.value.trim();
        const number = document.getElementById("number")?.value.trim();
        const comuna = document.getElementById("comuna")?.value.trim();
        const city = document.getElementById("city")?.value.trim();
        const state = document.getElementById("state")?.value.trim();

        if (!street || !number || !comuna || !city || !state) {
            showToast("Completa todos los datos de dirección", true);
            return;
        }

        const direccion = { street, number, comuna, city, state };

        // Paso 4: características y precio
        const totalArea = Number(document.getElementById("totalArea")?.value || 0);
        const usableArea = Number(document.getElementById("usableArea")?.value || 0);
        const bedrooms = document.getElementById("bedrooms")?.value;
        const bathrooms = document.getElementById("bathrooms")?.value;
        const ageValue = document.getElementById("age")?.value;
        const floorsValue = document.getElementById("floors")?.value;
        const orientationValue = document.getElementById("orientation")?.value;
        const description = document.getElementById("description")?.value || "";
        const priceValue = Number(document.getElementById("price")?.value || 0);
        const selectedPlan = document.getElementById("selectedPlan")?.value || "";

        if (!totalArea || !usableArea || !bedrooms || !bathrooms || !priceValue || !description) {
            showToast("Completa todos los campos obligatorios", true);
            return;
        }

        // Mapear antigüedad a qty_year
        let qty_year = null;
        switch (ageValue) {
            case "Menos de 1 año":
                qty_year = 0;
                break;
            case "1 - 5 años":
                qty_year = 5;
                break;
            case "5 - 10 años":
                qty_year = 10;
                break;
            case "10+ años":
                qty_year = 11;
                break;
            default:
                qty_year = null;
        }

        // Mapear pisos a número
        let qty_floor = null;
        if (floorsValue) {
            if (floorsValue.includes("+")) {
                qty_floor = parseInt(floorsValue) || 5;
            } else {
                qty_floor = Number(floorsValue) || null;
            }
        }

        // Mapear orientación
        let orientation_nbr = null;
        const orientationMap = {
            "Norte": 1,
            "Sur": 2,
            "Este": 3,
            "Oeste": 4,
        };
        orientation_nbr = orientationMap[orientationValue] ?? null;

        // Mapear plan a type_publis_nbr
        let type_publis_nbr = null;
        const planNorm = (selectedPlan || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
        if (planNorm.includes("basico") || planNorm.includes("basico")) type_publis_nbr = 1;
        else if (planNorm.includes("estandar")) type_publis_nbr = 2;
        else if (planNorm.includes("premium")) type_publis_nbr = 3;

        // Equipamiento desde data-field
        const featureFlags = {};
        document.querySelectorAll('.check-grid input[type="checkbox"][data-field]').forEach(cb => {
            const field = cb.getAttribute("data-field");
            if (field) {
                featureFlags[field] = cb.checked;
            }
        });

        // Objeto propiedad (tabla PROPIEDAD)
        // IMPORTANTE: la tabla PROPIEDAD no tiene columna address_nbr,
        // solo recibe type_nbr, type_desc, state_nbr, state_desc, describe e id_address.
        // id_address lo calcula el backend a partir de la DIRECCION creada,
        // así que aquí NO debemos enviar address_nbr para evitar error 500.
        const propiedad = {
            type_nbr,
            type_desc,
            describe: description.trim(),
            // state_nbr y state_desc se completan en el backend (1 / "Disponible")
        };

        // Objeto caracteristica (tabla CARACTERISTICA)
        const caracteristica = {
            total_mtr: totalArea,
            surface_mtr: usableArea,
            qty_room: Number(bedrooms === "5+" ? 5 : bedrooms),
            qty_bath: Number(bathrooms === "5+" ? 5 : bathrooms),
            qty_year,
            qty_floor,
            orientation_nbr,
            orientation: orientationValue,
            price: priceValue,
            type_publis_nbr,
            type_publis_desc: selectedPlan || null,
            ...featureFlags,
        };

        const payload = {
            direccion,
            propiedad,
            caracteristica,
        };

        const endpoint = editingPropertyId
            ? `/api/properties/${encodeURIComponent(editingPropertyId)}`
            : "/api/properties";
        const response = await fetch(endpoint, {
            method: editingPropertyId ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
            // Log detallado para depuración
            console.error("Error al publicar propiedad. Respuesta backend:", {
                status: response.status,
                result,
            });

            const errorMsg = result?.message
                ? `${result?.error || "Error"}: ${result.message}`
                : (result?.error || result?.message || "No se pudo publicar la propiedad");

            showToast(errorMsg, true);
            return;
        }

        showToast(editingPropertyId ? "Propiedad actualizada exitosamente" : "Propiedad publicada exitosamente");
        const savedPropertyId = editingPropertyId || result?.data?.propiedad?.id_propi || result?.data?.id_propi;
        if (selectedImages.length > 0) {
            try {
                const uploadedPhotos = await uploadPropertyPhotos(savedPropertyId);
                const cachedImage = await fileToCompressedDataUrl(getMainImageFile());
                savePropertyImageToCache(savedPropertyId, uploadedPhotos[0]?.url_foto || cachedImage);
            } catch (photoError) {
                console.error("Error subiendo fotos:", photoError);
                showToast(`La propiedad se guardo, pero las fotos no se pudieron subir: ${photoError.message}`, true);
                return;
            }
        }
        saveOwnerPropertyId(savedPropertyId);

        setTimeout(() => {
            window.location.href = "dashboardOwner.html";
        }, 2000);
    } catch (error) {
        console.error("Error publicando propiedad:", error);
        showToast("Error al conectar con el servidor", true);
    } finally {
        isPublishing = false;
        if (publishButton) {
            publishButton.disabled = false;
            publishButton.innerHTML = originalButtonHtml;
        }
    }
}

// Mapa dinámico
function updateMap() {
    const mapFrame = document.getElementById("mapFrame");
    const street = document.getElementById("street")?.value || "";
    const number = document.getElementById("number")?.value || "";
    const comuna = document.getElementById("comuna")?.value || "";
    const city = document.getElementById("city")?.value || "";

    if (!mapFrame) return;

    const address = encodeURIComponent(`${street} ${number}, ${comuna}, ${city}`.trim());
    if (address) {
        mapFrame.src = `https://www.google.com/maps?q=${address}&output=embed`;
    }
}

["street", "number", "comuna", "city"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("change", updateMap);
        el.addEventListener("blur", updateMap);
    }
});

// Toast
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
