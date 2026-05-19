// ===================== CARGAR COMPONENTES =====================
document.addEventListener("DOMContentLoaded", function () {
  // Cargar header
  fetch("components/header.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error cargando header: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("header").innerHTML = data;
      initHeader();
      highlightCurrentPage();
    })
    .catch((error) => console.error("Error:", error));

  // Cargar footer
  fetch("components/footer.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error cargando footer: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((error) => console.error("Error:", error));
});

// ===================== INICIALIZAR HEADER =====================
function initHeader() {
  // Toggle menú móvil
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const navMenu = document.getElementById("navMenu");
      if (navMenu) {
        navMenu.classList.toggle("active");
      }
      navToggle.classList.toggle("active");
    });
  }

  // Mostrar/ocultar botones según sesión del usuario y mostrar saludo
  const userData = localStorage.getItem("userData");
  const userProfile = localStorage.getItem("userProfile");
  const isLoggedIn = userData || userProfile;
  const registerBtn = document.querySelector(".btn-register-nav");
  const loginBtn = document.querySelector(".btn-login-nav");
  const profileBtn = document.getElementById("profileBtn");
  const greetingSpan = document.getElementById("userGreeting");
  const greetingTextSpan = greetingSpan
    ? greetingSpan.querySelector(".user-greeting-text")
    : null;

  if (isLoggedIn) {
    let firstName = "";
    try {
      const data = userData ? JSON.parse(userData) : JSON.parse(userProfile);
      firstName = data.first_name || data.firstName || data.nombre ||
        data.name || "";
    } catch (e) {
      console.error("Error parseando userData/userProfile", e);
    }

    if (greetingSpan && greetingTextSpan && firstName) {
      greetingTextSpan.textContent = `Hola! ${firstName}`;
      greetingSpan.style.display = "inline-flex";
    } else if (greetingSpan && greetingTextSpan) {
      // Si no tenemos nombre igual mostramos algo genérico
      greetingTextSpan.textContent = "Hola!";
      greetingSpan.style.display = "inline-flex";
    }

    if (registerBtn) registerBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
    if (profileBtn) profileBtn.style.display = "flex";
  } else {
    if (greetingSpan && greetingTextSpan) {
      greetingTextSpan.textContent = "";
      greetingSpan.style.display = "none";
    }

    if (registerBtn) registerBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
    if (profileBtn) profileBtn.style.display = "none";
  }
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "home.html";
  const links = document.querySelectorAll(".nav-link");

  links.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

// ================= FILTROS =================
const buscar = document.getElementById("searchInput");
const precio = document.getElementById("priceFilter");
const habitaciones = document.getElementById("bedroomsFilter");
const cards = document.querySelectorAll(".card");

function filtrar() {
  const texto = buscar.value.toLowerCase();
  const precioMax = precio.value;
  const hab = habitaciones.value;

  cards.forEach((card) => {
    const nombre = card.querySelector("h3").textContent.toLowerCase();
    const precioCard = parseInt(card.dataset.price);
    const habCard = parseInt(card.dataset.bedrooms);

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
cards.forEach((card) => {
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
    precio: card.dataset.price,
    habitaciones: card.dataset.bedrooms,
    img: card.querySelector("img").src,
    ubicacion: "Providencia, Santiago",
  };

  localStorage.setItem("propiedad", JSON.stringify(data));
  window.location.href = "detail.html";
}

// ================= EVENTOS =================
buscar.addEventListener("input", filtrar);
precio.addEventListener("change", filtrar);
habitaciones.addEventListener("change", filtrar);
