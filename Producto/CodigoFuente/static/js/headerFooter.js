document.addEventListener("DOMContentLoaded", function () {


  function reinitBootstrapComponents() {

    const offcanvasElements = document.querySelectorAll('.offcanvas');
    offcanvasElements.forEach(el => {
      if (!el.hasAttribute('data-bs-offcanvas-initialized')) {
        new bootstrap.Offcanvas(el);
        el.setAttribute('data-bs-offcanvas-initialized', 'true');
      }
    });

    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(el => {
      if (!el.hasAttribute('data-bs-modal-initialized')) {
        new bootstrap.Modal(el);
        el.setAttribute('data-bs-modal-initialized', 'true');
      }
    });
  }


  // Cargar header
  fetch("components/header.html?v=admin-nav-3")
    .then((response) => {
      if (!response.ok) throw new Error(`Error cargando header: ${response.status}`);
      return response.text();
    })
    .then((data) => {
      const header = document.getElementById("header");
      if (!header) return;
      header.innerHTML = data;
      initHeader();
      highlightCurrentPage();
      updateHeaderSessionState();
    })
    .catch((error) => console.error("Error:", error));

// Cargar footer
fetch("components/footer.html")
  .then((response) => {
    if (!response.ok) throw new Error(`Error cargando footer: ${response.status}`);
    return response.text();
  })
  .then((data) => {
    const footer = document.getElementById("footer");
    if (footer) footer.innerHTML = data;
  })
  .catch((error) => console.error("Error:", error));

// Cargar perfil (offcanvas + modales)
fetch("components/profile.html")
  .then((response) => {
    if (!response.ok) throw new Error(`Error cargando perfil: ${response.status}`);
    return response.text();
  })
  .then((data) => {
    const profile = document.getElementById("profileContainer");
    if (!profile) return;

    profile.innerHTML = data;    
    reinitBootstrapComponents();

    // Cargar datos del usuario si existen funciones
    if (typeof loadUserData === "function") loadUserData();
    if (typeof initNavigation === "function") initNavigation();
  })
  .catch((error) => console.error("Error:", error));
});

function initHeader() {
  const navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const navMenu = document.getElementById("navMenu");
      if (navMenu) navMenu.classList.toggle("active");
      navToggle.classList.toggle("active");
    });
  }
}

function highlightCurrentPage() {
  const links = document.querySelectorAll(".nav-link");
  const currentPage = window.location.pathname.split("/").pop();
  links.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

function getStoredSessionData(userData, userProfile) {
  try {
    if (userData) return JSON.parse(userData);
    if (userProfile) return JSON.parse(userProfile);
  } catch (e) {
    console.error("Error parseando userData/userProfile", e);
  }
  return {};
}

function getStoredUserEmail(data) {
  return (
    data.mail ||
    data.email ||
    data.correo ||
    localStorage.getItem("userEmail") ||
    ""
  ).trim().toLowerCase();
}

function updateHeaderSessionState() {
  const adminEmail = "admin@duoc.cl";
  const userData = localStorage.getItem("userData");
  const userProfile = localStorage.getItem("userProfile");
  const isLoggedIn = !!(userData || userProfile);

  const registerBtn = document.querySelector(".btn-register-nav");
  const loginBtn = document.querySelector(".btn-login-nav");
  const publicNavItems = document.querySelectorAll(".public-nav-item");
  const adminNavItem = document.getElementById("adminNavItem");
  const greetingLink = document.getElementById("userGreeting");
  const greetingTextSpan = greetingLink ? greetingLink.querySelector(".user-greeting-text") : null;

  let firstName = "";
  let email = "";
  if (isLoggedIn) {
    const data = getStoredSessionData(userData, userProfile);
    firstName = data.first_name || data.firstName || data.nombre || data.name || "";
    email = getStoredUserEmail(data);
  }

  const isAdmin = email === adminEmail;

  if (isLoggedIn) {
    if (greetingLink && greetingTextSpan) {
      greetingTextSpan.textContent = firstName ? `Hola! ${firstName}` : "Hola!";
      greetingLink.href = isAdmin ? "admin.html" : "profile.html";
      greetingLink.style.display = isAdmin ? "none" : "inline-flex";
    }
    if (adminNavItem) adminNavItem.style.display = isAdmin ? "list-item" : "none";
    publicNavItems.forEach((item) => {
      item.style.display = isAdmin ? "none" : "list-item";
    });
    if (registerBtn) registerBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
  } else {
    if (greetingLink && greetingTextSpan) {
      greetingTextSpan.textContent = "";
      greetingLink.style.display = "none";
    }
    if (adminNavItem) adminNavItem.style.display = "none";
    publicNavItems.forEach((item) => {
      item.style.display = "list-item";
    });
    if (registerBtn) registerBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
  }
}


// document.addEventListener("DOMContentLoaded", function () {
//   // Cargar header
//   fetch("components/header.html?v=admin-nav-3")
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Error cargando header: ${response.status}`);
//       }
//       return response.text();
//     })

//     .then((data) => {
//       const header = document.getElementById("header");
//       if (!header) return;

//       header.innerHTML = data;
//       initHeader();
//       highlightCurrentPage();
//       // Actualizar navbar según estado de sesión
//       updateHeaderSessionState();
//     })
//     .catch((error) => console.error("Error:", error));

//   // Cargar footer
//   fetch("components/footer.html")
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error(`Error cargando footer: ${response.status}`);
//       }
//       return response.text();
//     })
//     .then((data) => {
//       const footer = document.getElementById("footer");
//       if (footer) footer.innerHTML = data;
//     })
//     .catch((error) => console.error("Error:", error));
// });

// // =========================================
//   // PERFIL OFFCANVAS
//   // =========================================

//   fetch("components/profile.html")
//     .then((response) => {

//       if (!response.ok) {
//         throw new Error(`Error cargando perfil: ${response.status}`);
//       }

//       return response.text();
//     })

//     .then((data) => {

//       const profile = document.getElementById("profileContainer");

//       if (!profile) return;

//       profile.innerHTML = data;

//       if (typeof loadUserData === "function") {
//         loadUserData();
//       }

//       if (typeof initNavigation === "function") {
//         initNavigation();
//       }

//     })

//     .catch((error) => console.error("Error:", error));

// function initHeader() {
//   // Toggle menú móvil
//   const navToggle = document.getElementById("navToggle");

//   if (navToggle) {
//     navToggle.addEventListener("click", () => {
//       const navMenu = document.getElementById("navMenu");
//       if (navMenu) {
//         navMenu.classList.toggle("active");
//       }
//       navToggle.classList.toggle("active");
//     });
//   }
// }

// function highlightCurrentPage() {
//   const links = document.querySelectorAll(".nav-link");
//   const currentPage =
//     window.location.pathname.split("/").pop();

//   links.forEach((link) => {
//     if (link.getAttribute("href") === currentPage) {
//       link.classList.add("active");
//     }
//   });
// }

// function getStoredSessionData(userData, userProfile) {
//   try {
//     if (userData) return JSON.parse(userData);
//     if (userProfile) return JSON.parse(userProfile);
//   } catch (e) {
//     console.error("Error parseando userData/userProfile", e);
//   }

//   return {};
// }

// function getStoredUserEmail(data) {
//   return (
//     data.mail ||
//     data.email ||
//     data.correo ||
//     localStorage.getItem("userEmail") ||
//     ""
//   ).trim().toLowerCase();
// }

// // Actualiza el navbar según si hay sesión guardada en localStorage
// function updateHeaderSessionState() {
//   const adminEmail = "admin@duoc.cl";
//   const userData = localStorage.getItem("userData");
//   const userProfile = localStorage.getItem("userProfile");
//   const isLoggedIn = !!(userData || userProfile);

//   const registerBtn = document.querySelector(".btn-register-nav");
//   const loginBtn = document.querySelector(".btn-login-nav");
//   const publicNavItems = document.querySelectorAll(".public-nav-item");
//   const adminNavItem = document.getElementById("adminNavItem");
//   const greetingLink = document.getElementById("userGreeting");
//   const greetingTextSpan = greetingLink
//     ? greetingLink.querySelector(".user-greeting-text")
//     : null;

//   let firstName = "";
//   let email = "";
//   if (isLoggedIn) {
//     const data = getStoredSessionData(userData, userProfile);
//     firstName = data.first_name || data.firstName || data.nombre || data.name || "";
//     email = getStoredUserEmail(data);
//   }

//   const isAdmin = email === adminEmail;

//   if (isLoggedIn) {
//     if (greetingLink && greetingTextSpan) {
//       greetingTextSpan.textContent = firstName ? `Hola! ${firstName}` : "Hola!";
//       greetingLink.href = isAdmin ? "admin.html" : "profile.html";
//       greetingLink.style.display = isAdmin ? "none" : "inline-flex";
//     }
//     if (adminNavItem) adminNavItem.style.display = isAdmin ? "list-item" : "none";
//     publicNavItems.forEach((item) => {
//       item.style.display = isAdmin ? "none" : "list-item";
//     });
//     if (registerBtn) registerBtn.style.display = "none";
//     if (loginBtn) loginBtn.style.display = "none";
//   } else {
//     if (greetingLink && greetingTextSpan) {
//       greetingTextSpan.textContent = "";
//       greetingLink.style.display = "none";
//     }
//     if (adminNavItem) adminNavItem.style.display = "none";
//     publicNavItems.forEach((item) => {
//       item.style.display = "list-item";
//     });
//     if (registerBtn) registerBtn.style.display = "flex";
//     if (loginBtn) loginBtn.style.display = "flex";
//   }
// }
