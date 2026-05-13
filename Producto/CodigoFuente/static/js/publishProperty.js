// ========== PUBLISH PROPERTY - TU CASA ==========

// Variables globales
let selectedImages = [];
let mainImageIndex = null;

// INICIALIZACIÓN
document.addEventListener("DOMContentLoaded", () => {
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

    // Cargar componentes
    loadComponent("header", "components/header.html");
    loadComponent("footer", "components/footer.html");

    // Contador descripción
    initDescriptionCounter();

    // Input imágenes
    initImages();
});

// Cargar componentes
async function loadComponent(id, path) {
    try {
        const res = await fetch(path);
        const html = await res.text();
        document.getElementById(id).innerHTML = html;
        if (id === "header") activarMenu();
    } catch (error) {
        console.error("Error cargando componente:", error);
    }
}

// Activar menú hamburguesa
function activarMenu() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("active");
        });
    }
}

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
    const address = document.getElementById("address").value.trim();
    if (address.length < 5) {
        showToast("Ingresa una dirección válida", true);
        return;
    }
    nextStep(3);
}

function validateStep3() {
    const files = document.getElementById("images").files;
    if (files.length === 0) {
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
    const address = document.getElementById("address").value;
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
function publishProperty() {
    showToast("¡Propiedad publicada exitosamente!");
    setTimeout(() => {
        window.location.href = "home.html";
    }, 2000);
}

// Mapa dinámico
const addressInput = document.getElementById("address");
const mapFrame = document.getElementById("mapFrame");
if (addressInput && mapFrame) {
    addressInput.addEventListener("change", () => {
        const address = encodeURIComponent(addressInput.value);
        mapFrame.src = `https://www.google.com/maps?q=${address}&output=embed`;
    });
}

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