document.addEventListener("DOMContentLoaded", function () {


  function loadStylesheetOnce(href) {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`Error cargando CSS: ${href}`));
      document.head.appendChild(link);
    });
  }

  function loadScriptOnce(src) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Error cargando script: ${src}`));
      document.body.appendChild(script);
    });
  }

  function ensureBootstrap() {
    const bootstrapCss = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
    const bootstrapJs = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
    const profileCss = "css/profile.css";

    const cssTasks = [
      loadStylesheetOnce(bootstrapCss),
      loadStylesheetOnce(profileCss),
    ];

    const jsTask = window.bootstrap
      ? Promise.resolve()
      : loadScriptOnce(bootstrapJs);

    return Promise.all([...cssTasks, jsTask]);
  }

  function reinitBootstrapComponents() {

    if (!window.bootstrap) return;

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
    let profile = document.getElementById("profileContainer");
    if (!profile) {
      profile = document.createElement("div");
      profile.id = "profileContainer";
      document.body.appendChild(profile);
    }

    profile.innerHTML = data.replace(/<script[\s\S]*?<\/script>/gi, "");

    return ensureBootstrap()
      .then(() => {
        reinitBootstrapComponents();
        return loadScriptOnce("js/profile.js");
      });
  })
  .then(() => {
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
  const hasActiveSession = sessionStorage.getItem("isLoggedIn") === "true"
    || localStorage.getItem("isLoggedIn") === "true";
  const isLoggedIn = hasActiveSession && !!(userData || userProfile);

  const registerBtn = document.querySelector(".btn-register-nav");
  const loginBtn = document.querySelector(".btn-login-nav");
  const profileNavItem = document.querySelector(".profile-nav-item");
  const profileButton = document.querySelector(".btn-open-profile");
  const publicNavItems = document.querySelectorAll(".public-nav-item");
  const adminNavItem = document.getElementById("adminNavItem");
  const greetingLink = document.getElementById("userGreeting");
  const greetingTextSpan = greetingLink ? greetingLink.querySelector(".user-greeting-text") : null;
  const greetingItem = document.querySelector(".user-greeting-item");

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
    }
    if (greetingItem) greetingItem.style.display = isAdmin ? "none" : "list-item";
    if (adminNavItem) adminNavItem.style.display = isAdmin ? "list-item" : "none";
    publicNavItems.forEach((item) => {
      item.style.display = isAdmin ? "none" : "list-item";
    });
    if (registerBtn) registerBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
    if (profileNavItem) profileNavItem.style.display = isAdmin ? "none" : "list-item";
    if (profileButton) {
      profileButton.disabled = false;
      profileButton.setAttribute("aria-hidden", "false");
    }
  } else {
    if (greetingLink && greetingTextSpan) {
      greetingTextSpan.textContent = "";
    }
    if (greetingItem) greetingItem.style.display = "none";
    if (adminNavItem) adminNavItem.style.display = "none";
    publicNavItems.forEach((item) => {
      item.style.display = "list-item";
    });
    if (registerBtn) registerBtn.style.display = "flex";
    if (loginBtn) loginBtn.style.display = "flex";
    if (profileNavItem) profileNavItem.style.display = "none";
    if (profileButton) {
      profileButton.disabled = true;
      profileButton.setAttribute("aria-hidden", "true");
    }
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
