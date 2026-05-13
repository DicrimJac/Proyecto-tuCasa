// ============================================
// MOCK DATA PROPIEDAD
// ============================================

const propiedad = {
    titulo: "Departamento moderno en Santiago Centro",
    precio: "$350.000 / mes",
    ubicacion: "Padre Alonso de Ovalle 1586, Santiago Centro",
    habitaciones: 2,
    banos: 1,
    estacionamientos: 1,
    superficie: "65 m²",
    tipoPropiedad: "Departamento",
    operacion: "Arriendo",
    descripcion: "Departamento amplio y moderno ubicado cerca del metro, supermercados y áreas verdes. Excelente conectividad y seguridad.",
    nombreContacto: "Juan Pérez",
    telefono: "+56 9 1234 5678",
    correo: "contacto@tucasa.cl",
    imagen: "assets/image/casa2.png"
};

// ============================================
// REFERENCIAS HTML
// ============================================

const img = document.getElementById("img");
const titulo = document.getElementById("titulo");
const precio = document.getElementById("precio");
const ubicacion = document.getElementById("ubicacion");
const habitaciones = document.getElementById("habitaciones");
const banos = document.getElementById("banos");
const estacionamientos = document.getElementById("estacionamientos");
const superficie = document.getElementById("superficie");
const tipoPropiedad = document.getElementById("tipoPropiedad");
const operacion = document.getElementById("operacion");
const descripcion = document.getElementById("descripcion");
const mapFrame = document.getElementById("mapFrame");

// ============================================
// INSERTAR DATOS
// ============================================

if (img) img.src = propiedad.imagen;
if (titulo) titulo.textContent = propiedad.titulo;
if (precio) precio.textContent = propiedad.precio;
if (ubicacion) ubicacion.textContent = propiedad.ubicacion;
if (habitaciones) habitaciones.textContent = propiedad.habitaciones;
if (banos) banos.textContent = propiedad.banos;
if (estacionamientos) estacionamientos.textContent = propiedad.estacionamientos;
if (superficie) superficie.textContent = propiedad.superficie;
if (tipoPropiedad) tipoPropiedad.textContent = propiedad.tipoPropiedad;
if (operacion) operacion.textContent = propiedad.operacion;
if (descripcion) descripcion.textContent = propiedad.descripcion;

// ============================================
// MAPA DINÁMICO
// ============================================

if (mapFrame && propiedad.ubicacion) {
    const direccionURL = encodeURIComponent(propiedad.ubicacion);
    mapFrame.src = `https://www.google.com/maps?q=${direccionURL}&output=embed`;
}

// ============================================
// MODAL CONTACTO
// ============================================

const btnWhatsapp = document.getElementById("btnWhatsapp");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const cerrarModal = document.getElementById("cerrarModal");
const cerrarBtn = document.getElementById("cerrarBtn");

// Función para abrir modal
function openModal() {
    if (modalWhatsapp) {
        modalWhatsapp.classList.add("active");
    }
}

// Función para cerrar modal
function closeModal() {
    if (modalWhatsapp) {
        modalWhatsapp.classList.remove("active");
    }
}

// ABRIR MODAL
if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", openModal);
}

// CERRAR MODAL X
if (cerrarModal) {
    cerrarModal.addEventListener("click", closeModal);
}

// CERRAR BOTÓN
if (cerrarBtn) {
    cerrarBtn.addEventListener("click", closeModal);
}

// Cerrar modal al hacer clic fuera
if (modalWhatsapp) {
    modalWhatsapp.addEventListener("click", (e) => {
        if (e.target === modalWhatsapp) {
            closeModal();
        }
    });
}

// ============================================
// TOAST
// ============================================

function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');
    
    if (!toast) return;
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
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            if (icon) icon.className = 'bi bi-info-circle-fill';
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Información';
            toast.style.borderLeftColor = '#2C5A6E';
        }
    }, 3000);
}

// Mostrar toast de bienvenida (opcional)
// showToast('Bienvenido a la página de detalle');