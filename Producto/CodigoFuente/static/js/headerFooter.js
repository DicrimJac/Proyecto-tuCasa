async function cargar(id, ruta) {
    const res = await fetch(ruta);
    const data = await res.text();
    document.getElementById(id).innerHTML = data;

    if (id === "header") {
        activarLink();
        manejarSesion();
    }
}

function activarLink() {
    const links = document.querySelectorAll(".nav-links a");
    const current = window.location.pathname.split("/").pop();

    links.forEach(link => {
        if (link.getAttribute("href") === current) {
            link.classList.add("active");
        }
    });
}


        const userData = localStorage.getItem('userData');
        const userProfile = localStorage.getItem('userProfile');
        
        const registerBtn = document.querySelector('.btn-register-nav');
        const loginBtn = document.querySelector('.btn-login-nav');
        const profileBtn = document.getElementById('profileBtn');
        
        if (userData || userProfile) {
            // Usuario logueado
            if (registerBtn) registerBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'flex';
        } else {
            // Usuario no logueado
            if (registerBtn) registerBtn.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (profileBtn) profileBtn.style.display = 'none';
        }
        
        // Toggle menú móvil
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            })
        }

cargar("header", "components/header.html");
cargar("footer", "components/footer.html");
