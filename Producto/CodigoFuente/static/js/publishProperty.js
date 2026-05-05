// ===================== RADIO CARDS =====================
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".options").forEach(group => {
        const cards = group.querySelectorAll(".option-card");

        cards.forEach(card => {
            card.addEventListener("click", () => {
                cards.forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");

                const input = card.querySelector("input");
                input.checked = true;
            });
        });
    });

    // Cargar header y footer
    loadComponent("header", "components/header.html");
    loadComponent("footer", "components/footer.html");

});


// ===================== COMPONENTES =====================
async function loadComponent(id, path) {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;

    // Activar menú SOLO cuando cargue el header
    if (id === "header") {
        activarMenu();
    }
}


// ===================== NAVBAR =====================
function activarMenu() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");

    if (toggle && menu) {
        toggle.addEventListener("click", () => {
            menu.classList.toggle("active");
        });
    }
}


// ===================== NAVEGACIÓN PASOS =====================
function nextStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
}

function prevStep(step) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    document.getElementById("step" + step).classList.add("active");
}


// ===================== VALIDACIONES =====================
function validateStep1() {
    const category = document.querySelector('input[name="category"]:checked');
    const condition = document.querySelector('input[name="condition"]:checked');

    if (!category || !condition) {
        alert("Completa todos los campos");
        return;
    }
    nextStep(2);
}

function validateStep2() {
    const address = document.getElementById("address").value.trim();

    if (address.length < 5) {
        alert("Ingresa una dirección válida");
        return;
    }
    nextStep(3);
}

function validateStep3() {
    const files = document.getElementById("images").files;

    if (files.length === 0) {
        alert("Debes subir al menos una imagen");
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
        alert("Completa todos los campos obligatorios");
        return;
    }

    nextStep(5);
}


// ===================== CANCELAR =====================
function cancelForm() {
    if (confirm("¿Deseas cancelar la publicación?")) {
        window.location.href = "../home.html";
    }
}

// // ===================== IMÁGENES =====================
// const imageInput = document.getElementById("images");
// const preview = document.getElementById("imagePreview");

// if (imageInput) {
//     imageInput.addEventListener("change", () => {
//         preview.innerHTML = "";

//         const files = imageInput.files;

//         if (files.length > 20) {
//             alert("Máximo 20 imágenes");
//             imageInput.value = "";
//             return;
//         }

//         Array.from(files).forEach(file => {
//             const reader = new FileReader();

//             reader.onload = function (e) {
//                 const img = document.createElement("img");
//                 img.src = e.target.result;
//                 preview.appendChild(img);
//             };

//             reader.readAsDataURL(file);
//         });
//     });
// }

// ===================== IMÁGENES PRO =====================
let selectedImages = [];
let mainImageIndex = null;

const input = document.getElementById("images");
const preview = document.getElementById("imagePreview");
const mainImage = document.getElementById("mainImage");

if (input) {
    input.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);

        if (selectedImages.length + files.length > 20) {
            alert("Máximo 20 imágenes");
            return;
        }

        files.forEach(file => selectedImages.push(file));

        renderImages();
    });
}

function renderImages() {
    preview.innerHTML = "";

    selectedImages.forEach((file, index) => {
        const reader = new FileReader();

        reader.onload = function (e) {
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

            if (mainImageIndex === null && index === 0) {
                setMain(0);
            }
        };

        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedImages.splice(index, 1);

    if (mainImageIndex === index) {
        mainImageIndex = null;
        mainImage.src = "";
    }

    renderImages();
}

function setMain(index) {
    mainImageIndex = index;

    const reader = new FileReader();

    reader.onload = function (e) {
        mainImage.src = e.target.result;
    };

    reader.readAsDataURL(selectedImages[index]);
}

// contador de caracteres
const desc = document.getElementById("description");
const count = document.getElementById("charCount");

if (desc) {
    desc.addEventListener("input", () => {
        count.textContent = `${desc.value.length} / 3000`;
    });
}