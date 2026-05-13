// async function cargar(id, ruta) {
//   const res = await fetch(ruta);
//   const data = await res.text();
//   document.getElementById(id).innerHTML = data;

//   if (id === "header") {
//     activarLink();
//     manejarSesion();
//     initHeaderMenu();
//   }
// }

// function activarLink() {
//   const links = document.querySelectorAll(".nav-link");
//   const current = window.location.pathname.split("/").pop();

//   links.forEach((link) => {
//     if (link.getAttribute("href") === current) {
//       link.classList.add("active");
//     }
//   });
// }

// function manejarSesion() {
//   const userData = localStorage.getItem("userData");
//   const userProfile = localStorage.getItem("userProfile");
//   const isLoggedIn = userData || userProfile;

//   const registerBtn = document.querySelector(".btn-register-nav");
//   const loginBtn = document.querySelector(".btn-login-nav");
//   const profileBtn = document.getElementById("profileBtn");
//   const greetingSpan = document.getElementById("userGreeting");
//   const greetingTextSpan = greetingSpan
//     ? greetingSpan.querySelector(".user-greeting-text")
//     : null;

//   if (isLoggedIn) {
//     let firstName = "";
//     try {
//       const data = userData ? JSON.parse(userData) : JSON.parse(userProfile);
//       firstName = data.first_name || data.firstName || data.nombre ||
//         data.name || "";
//     } catch (e) {
//       console.error("Error parseando userData/userProfile", e);
//     }

//     if (greetingSpan && greetingTextSpan) {
//       greetingTextSpan.textContent = firstName ? `Hola! ${firstName}` : "Hola!";
//       greetingSpan.style.display = "inline-flex";
//     }

//     if (registerBtn) registerBtn.style.display = "none";
//     if (loginBtn) loginBtn.style.display = "none";
//     if (profileBtn) profileBtn.style.display = "flex";
//   } else {
//     if (greetingSpan && greetingTextSpan) {
//       greetingTextSpan.textContent = "";
//       greetingSpan.style.display = "none";
//     }

//     if (registerBtn) registerBtn.style.display = "flex";
//     if (loginBtn) loginBtn.style.display = "flex";
//     if (profileBtn) profileBtn.style.display = "none";
//   }
// }

// function initHeaderMenu() {
//   const navToggle = document.getElementById("navToggle");
//   const navMenu = document.getElementById("navMenu");

//   if (navToggle && navMenu) {
//     navToggle.addEventListener("click", () => {
//       navMenu.classList.toggle("active");
//       navToggle.classList.toggle("active");
//     });
//   }
// }

// cargar("header", "components/header.html");
// cargar("footer", "components/footer.html");



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