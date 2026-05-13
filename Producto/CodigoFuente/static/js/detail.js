// const data = JSON.parse(localStorage.getItem("propiedad"));

// if (data) {
//     document.getElementById("img").src = data.img;
//     document.getElementById("titulo").textContent = data.titulo;
//     document.getElementById("precio").textContent = "$" + data.precio;
//     document.getElementById("habitaciones").textContent = data.habitaciones + " habitaciones";
//     document.querySelector(".mapa iframe").src = `https://www.google.com/maps?q=${data.ubicacion}&output=embed`;
// }

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
    imagen:
        "img/departamento.jpg"
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

img.src = propiedad.imagen;
titulo.textContent = propiedad.titulo;
precio.textContent = propiedad.precio;
ubicacion.textContent = propiedad.ubicacion;
habitaciones.textContent = propiedad.habitaciones;
banos.textContent = propiedad.banos;
estacionamientos.textContent = propiedad.estacionamientos;
superficie.textContent = propiedad.superficie;
tipoPropiedad.textContent = propiedad.tipoPropiedad;
operacion.textContent = propiedad.operacion;
descripcion.textContent = propiedad.descripcion;

// ============================================
// MAPA DINÁMICO
// ============================================

const direccionURL = encodeURIComponent(propiedad.ubicacion);
mapFrame.src = `https://www.google.com/maps?q=${direccionURL}&output=embed`;

// ============================================
// MODAL CONTACTO
// ============================================

const btnWhatsapp = document.getElementById("btnWhatsapp");
const modalWhatsapp = document.getElementById("modalWhatsapp");
const cerrarModal = document.getElementById("cerrarModal");
const cerrarBtn = document.getElementById("cerrarBtn");

// ABRIR MODAL
btnWhatsapp.addEventListener("click", () => {
    modalWhatsapp.style.display = "flex";
});

// CERRAR MODAL X
cerrarModal.addEventListener("click", () => {
    modalWhatsapp.style.display = "none";
});

// CERRAR BOTÓN
cerrarBtn.addEventListener("click", () => {
    modalWhatsapp.style.display = "none";
});