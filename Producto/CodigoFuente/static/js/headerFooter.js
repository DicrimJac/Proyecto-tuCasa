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