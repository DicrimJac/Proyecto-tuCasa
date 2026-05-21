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
      const header = document.getElementById("header");
      if (!header) return;

      header.innerHTML = data;
      initHeader();
      highlightCurrentPage();
      // Actualizar navbar según estado de sesión
      updateHeaderSessionState();
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
      const footer = document.getElementById("footer");
      if (footer) footer.innerHTML = data;
    })
    .catch((error) => console.error("Error:", error));
});

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
}

function highlightCurrentPage() {
  const links = document.querySelectorAll(".nav-link");
  const currentPage =
    window.location.pathname.split("/").pop();

  links.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

// Actualiza el navbar según si hay sesión guardada en localStorage
function updateHeaderSessionState() {
  const userData = localStorage.getItem("userData");
  const userProfile = localStorage.getItem("userProfile");
  const isLoggedIn = !!(userData || userProfile);

  const registerBtn = document.querySelector(".btn-register-nav");
  const loginBtn = document.querySelector(".btn-login-nav");
  const greetingLink = document.getElementById("userGreeting");
  const greetingTextSpan = greetingLink
    ? greetingLink.querySelector(".user-greeting-text")
    : null;

  let firstName = "";
  if (isLoggedIn) {
    try {
      const data = userData ? JSON.parse(userData) : JSON.parse(userProfile);
      firstName = data.first_name || data.firstName || data.nombre || data.name || "";
    } catch (e) {
      console.error("Error parseando userData/userProfile", e);
    }
  }

  if (isLoggedIn) {
    if (greetingLink && greetingTextSpan) {
      greetingTextSpan.textContent = firstName ? `Hola! ${firstName}` : "Hola!";
      greetingLink.style.display = "inline-flex";
    }
    if (registerBtn) registerBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
  } else {
    if (greetingLink && greetingTextSpan) {
      greetingTextSpan.textContent = "";
      greetingLink.style.display = "none";
    }
    if (registerBtn) registerBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
  }
}
