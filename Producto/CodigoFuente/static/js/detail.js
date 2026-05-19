const property = {
    title: "Departamento moderno en Santiago Centro",
    price: "$350.000 / mes",
    location: "Padre Alonso de Ovalle 1586, Santiago Centro",
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    propertyArea: "65 m²",
    propertyType: "Departamento",
    operationType: "Arriendo",
    description: "Departamento amplio y moderno ubicado cerca del metro, supermercados y áreas verdes. Excelente conectividad y seguridad.",
    contactName: "Juan Pérez",
    phone: "+56 9 1234 5678",
    email: "contacto@tucasa.cl",
    image: "assets/image/casa2.png"
};

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

if (propertyImage) {
    propertyImage.src = property.image;
}

if (propertyTitle) {
    propertyTitle.textContent = property.title;
}

if (propertyPrice) {
    propertyPrice.textContent = property.price;
}

if (propertyLocation) {
    propertyLocation.textContent = property.location;
}

if (bedrooms) {
    bedrooms.textContent = property.bedrooms;
}

if (bathrooms) {
    bathrooms.textContent = property.bathrooms;
}

if (parkingSpaces) {
    parkingSpaces.textContent = property.parkingSpaces;
}

if (propertyArea) {
    propertyArea.textContent = property.propertyArea;
}

if (propertyType) {
    propertyType.textContent = property.propertyType;
}

if (operationType) {
    operationType.textContent = property.operationType;
}

if (propertyDescription) {
    propertyDescription.textContent = property.description;
}

if (mapFrame && property.location) {

    const addressURL = encodeURIComponent(property.location);
    mapFrame.src =
        `https://www.google.com/maps?q=${addressURL}&output=embed`;
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

if (whatsappButton) {
    whatsappButton.addEventListener("click", openModal);
}

if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
}

if (closeButton) {
    closeButton.addEventListener("click", closeModal);
}

if (whatsappModal) {
    whatsappModal.addEventListener("click", (e) => {
        if (e.target === whatsappModal) {
            closeModal();
        }
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById("notificationToast");
    const toastMessage = document.getElementById("toastMessage");
    const toastHeader = toast?.querySelector(".toast-header");

    if (!toast) return;
    if (toastMessage) {
        toastMessage.textContent = message;
    }

    if (isError) {
        toast.style.borderLeftColor = "#dc3545";
        const icon = toastHeader?.querySelector("i");
        if (icon) {
            icon.className =
                "bi bi-exclamation-triangle-fill";
            icon.style.color = "#dc3545";
        }
        const strong =
            toastHeader?.querySelector("strong");
        
        if (strong) {
            strong.textContent = "Error";
        }
    } else {
        toast.style.borderLeftColor = "#2C5A6E";
        const icon = toastHeader?.querySelector("i");
        if (icon) {
            icon.className = "bi bi-check-circle-fill";
            icon.style.color = "#2C5A6E";
        }
        const strong = toastHeader?.querySelector("strong");
        if (strong) {
            strong.textContent = "Éxito";
        }
    }
    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
        if (toastHeader) {
            const icon = toastHeader.querySelector("i");
            if (icon) {
                icon.className = "bi bi-info-circle-fill";
            }
            const strong = toastHeader.querySelector("strong");
            if (strong) {
                strong.textContent = "Información";
            }
            toast.style.borderLeftColor = "#2C5A6E";
        }
    }, 3000);
}
showToast("Bienvenido a la página de detalle");