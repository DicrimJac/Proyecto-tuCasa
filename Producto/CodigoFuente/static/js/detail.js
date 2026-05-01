const data = JSON.parse(localStorage.getItem("propiedad"));

if (data) {
    document.getElementById("img").src = data.img;
    document.getElementById("titulo").textContent = data.titulo;
    document.getElementById("precio").textContent = "$" + data.precio;
    document.getElementById("habitaciones").textContent = data.habitaciones + " habitaciones";
    document.querySelector(".mapa iframe").src = `https://www.google.com/maps?q=${data.ubicacion}&output=embed`;
}