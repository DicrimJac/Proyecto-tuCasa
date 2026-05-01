// ===================== CARGAR COMPONENTES =====================
document.addEventListener('DOMContentLoaded', function() {
    // Cargar header
    fetch('components/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando header: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('header').innerHTML = data;
            initHeader();
            highlightCurrentPage();
        })
        .catch(error => console.error('Error:', error));
    
    // Cargar footer
    fetch('components/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando footer: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('footer').innerHTML = data;
        })
        .catch(error => console.error('Error:', error));
});

// ===================== INICIALIZAR HEADER =====================
function initHeader() {
    // Toggle menú móvil
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
            navToggle.classList.toggle('active');
        });
    }
    
    // Mostrar/ocultar botones según sesión del usuario
    const userData = localStorage.getItem('userData');
    const userProfile = localStorage.getItem('userProfile');
    const isLoggedIn = userData || userProfile;
    
    const registerBtn = document.querySelector('.btn-register-nav');
    const loginBtn = document.querySelector('.btn-login-nav');
    const profileBtn = document.getElementById('profileBtn');
    
    if (isLoggedIn) {
        if (registerBtn) registerBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'flex';
    } else {
        if (registerBtn) registerBtn.style.display = 'flex';
        if (loginBtn) loginBtn.style.display = 'flex';
        if (profileBtn) profileBtn.style.display = 'none';
    }
}

// // ===================== RESALTAR PÁGINA ACTUAL =====================
// function highlightCurrentPage() {
//     const currentPage = window.location.pathname.split('/').pop();
//     const navLinks = document.querySelectorAll('.nav-link');
    
//     navLinks.forEach(link => {
//         const href = link.getAttribute('href');
//         if (href === currentPage || (currentPage === '' && href === 'home.html')) {
//             link.classList.add('active');
//         } else {
//             link.classList.remove('active');
//         }
//     });
// }

// // ===================== CARRUSEL (solo en home) =====================
// let currentSlide = 0;
// const slides = document.querySelectorAll('.slide');
// const track = document.querySelector('.carousel-track');
// const totalSlides = slides.length;

// function updateCarousel() {
//     if (track) {
//         track.style.transform = `translateX(-${currentSlide * 100}%)`;
//     }
// }

// function nextSlide() {
//     if (currentSlide < totalSlides - 1) {
//         currentSlide++;
//     } else {
//         currentSlide = 0;
//     }
//     updateCarousel();
// }

// function prevSlide() {
//     if (currentSlide > 0) {
//         currentSlide--;
//     } else {
//         currentSlide = totalSlides - 1;
//     }
//     updateCarousel();
// }

// // Event listeners del carrusel (solo si existe en la página)
// document.addEventListener('DOMContentLoaded', () => {
//     const prevBtn = document.querySelector('.prev');
//     const nextBtn = document.querySelector('.next');
    
//     if (prevBtn && nextBtn && slides.length > 0) {
//         prevBtn.addEventListener('click', prevSlide);
//         nextBtn.addEventListener('click', nextSlide);
//         setInterval(nextSlide, 5000);
//     }
// });

// // ===================== FILTROS DE PROPIEDADES (solo en home) =====================
// document.addEventListener('DOMContentLoaded', () => {
//     const buscarInput = document.getElementById('buscar');
//     const precioSelect = document.getElementById('precio');
//     const habitacionesSelect = document.getElementById('habitaciones');
//     const cards = document.querySelectorAll('.card');
    
//     if (buscarInput && cards.length > 0) {
//         function filtrarPropiedades() {
//             const buscarTerm = buscarInput ? buscarInput.value.toLowerCase() : '';
//             const precioMax = precioSelect ? parseInt(precioSelect.value) : null;
//             const habitacionesMin = habitacionesSelect ? parseInt(habitacionesSelect.value) : null;
            
//             cards.forEach(card => {
//                 const titulo = card.querySelector('h3')?.textContent.toLowerCase() || '';
//                 const precio = parseInt(card.getAttribute('data-precio')) || 0;
//                 const habitaciones = parseInt(card.getAttribute('data-habitaciones')) || 0;
                
//                 let mostrar = true;
                
//                 if (buscarTerm && !titulo.includes(buscarTerm)) {
//                     mostrar = false;
//                 }
                
//                 if (precioMax && precio > precioMax) {
//                     mostrar = false;
//                 }
                
//                 if (habitacionesMin && habitaciones < habitacionesMin) {
//                     mostrar = false;
//                 }
                
//                 card.style.display = mostrar ? 'block' : 'none';
//             });
//         }
        
//         buscarInput.addEventListener('input', filtrarPropiedades);
//         if (precioSelect) precioSelect.addEventListener('change', filtrarPropiedades);
//         if (habitacionesSelect) habitacionesSelect.addEventListener('change', filtrarPropiedades);
//     }
// });

// ================= FILTROS =================
const buscar = document.getElementById("buscar");
const precio = document.getElementById("precio");
const habitaciones = document.getElementById("habitaciones");

const cards = document.querySelectorAll(".card");

function filtrar() {
    const texto = buscar.value.toLowerCase();
    const precioMax = precio.value;
    const hab = habitaciones.value;

    cards.forEach(card => {
        const nombre = card.querySelector("h3").textContent.toLowerCase();
        const precioCard = parseInt(card.dataset.precio);
        const habCard = parseInt(card.dataset.habitaciones);

        let mostrar = true;

        if (texto && !nombre.includes(texto)) {
            mostrar = false;
        }

        if (precioMax && precioCard > parseInt(precioMax)) {
            mostrar = false;
        }

        if (hab && habCard < parseInt(hab)) {
            mostrar = false;
        }

        card.style.display = mostrar ? "block" : "none";
    });
}

// ================= CLICK EN CARD =================
cards.forEach(card => {

    // CLICK EN TODA LA CARD
    card.addEventListener("click", () => {
        guardarYRedirigir(card);
    });

    // CLICK SOLO EN BOTÓN
    const btn = card.querySelector("button");

    if (btn) {
        btn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            guardarYRedirigir(card);
        });
    }

});

function guardarYRedirigir(card) {
    const data = {
        titulo: card.querySelector("h3").textContent,
        precio: card.dataset.precio,
        habitaciones: card.dataset.habitaciones,
        img: card.querySelector("img").src,
        ubicacion: "Providencia, Santiago"
    };

    localStorage.setItem("propiedad", JSON.stringify(data));
    window.location.href = "../static/detail.html";
}

// ================= EVENTOS =================
buscar.addEventListener("input", filtrar);
precio.addEventListener("change", filtrar);
habitaciones.addEventListener("change", filtrar);