// MOCK DATA PROPIEDAD

const propiedad = {
    precio: "$350.000",
    direccion: "Padre Alonso de Ovalle 1586",
    region: "Región Metropolitana",
    comuna: "Santiago Centro",
    tipoPropiedad: "Departamento",
    superficieTerreno: "80 m²",
    superficieUtil: "65 m²",
    habitaciones: 2,
    banos: 1,
    estacionamientos: 1,
    gastosComunes: "$70.000",
    descripcion: "Departamento amplio y moderno ubicado cerca del metro y supermercados.",
    amoblado: true,
    mascotas: true,
    bodega: false,
    terraza: true
};

// REFERENCIAS HTML

const precio = document.getElementById("precio");
const direccion = document.getElementById("direccion");
const region = document.getElementById("region");
const comuna = document.getElementById("comuna");
const tipoPropiedad = document.getElementById("tipoPropiedad");
const superficieTerreno = document.getElementById("superficieTerreno");
const superficieUtil = document.getElementById("superficieUtil");
const habitaciones = document.getElementById("habitaciones");
const banos = document.getElementById("banos");
const estacionamientos = document.getElementById("estacionamientos");
const gastosComunes = document.getElementById("gastosComunes");
const descripcion = document.getElementById("descripcion");
const amoblado = document.getElementById("amoblado");
const mascotas = document.getElementById("mascotas");
const bodega = document.getElementById("bodega");
const terraza = document.getElementById("terraza");

// INSERTAR DATOS

precio.value = propiedad.precio;
direccion.value = propiedad.direccion;
region.value = propiedad.region;
comuna.value = propiedad.comuna;
tipoPropiedad.value = propiedad.tipoPropiedad;
superficieTerreno.value = propiedad.superficieTerreno;
superficieUtil.value = propiedad.superficieUtil;
habitaciones.value = propiedad.habitaciones;
banos.value = propiedad.banos;
estacionamientos.value = propiedad.estacionamientos;
gastosComunes.value = propiedad.gastosComunes;
descripcion.value = propiedad.descripcion;
amoblado.checked = propiedad.amoblado;
mascotas.checked = propiedad.mascotas;
bodega.checked = propiedad.bodega;
terraza.checked = propiedad.terraza;

// BOTÓN GUARDAR

const btnGuardar = document.getElementById("btnGuardar");
const modalGuardado = document.getElementById("modalGuardado");
const cerrarModal = document.getElementById("cerrarModal");

// GUARDAR CAMBIOS

btnGuardar.addEventListener("click", () => {

    propiedad.precio = precio.value;
    propiedad.superficieUtil = superficieUtil.value;
    propiedad.habitaciones = habitaciones.value;
    propiedad.banos = banos.value;
    propiedad.estacionamientos = estacionamientos.value;
    propiedad.gastosComunes = gastosComunes.value;
    propiedad.descripcion = descripcion.value;
    propiedad.amoblado = amoblado.checked;
    propiedad.mascotas = mascotas.checked;
    propiedad.bodega = bodega.checked;
    propiedad.terraza = terraza.checked;

    // GUARDAR EN LOCAL STORAGE
    localStorage.setItem(
        "propiedad",
        JSON.stringify(propiedad)
    );

    // MOSTRAR MODAL
    modalGuardado.style.display =
        "flex";

});

// CERRAR MODAL

cerrarModal.addEventListener("click", () => {
    modalGuardado.style.display =
        "none";
});