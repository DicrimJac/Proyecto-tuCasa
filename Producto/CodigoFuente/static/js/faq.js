// ========== FAQ PAGE - MISMA LÓGICA QUE TERMS.JS ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ACORDEÓN DE PREGUNTAS ==========
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items abiertos dentro de la misma sección
            const parentSection = item.closest('.faq-section');
            const itemsInSection = parentSection.querySelectorAll('.faq-item');
            
            itemsInSection.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle el item actual
            item.classList.toggle('active');
        });
    });
    
    // ========== NAVEGACIÓN POR SIDEBAR (como terms.js) ==========
    const navLinks = document.querySelectorAll('.faq-sidebar a');
    const sections = document.querySelectorAll('.faq-section');
    
    function updateActiveLink() {
        const scrollPosition = window.scrollY + 120;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
    
    // Scroll suave al hacer clic en los enlaces del sidebar
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Actualizar clase activa
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // ========== TOAST ==========
    window.showToast = function(message, isError = false) {
        const toast = document.getElementById('notificationToast');
        if (!toast) return;
        
        const toastMessage = document.getElementById('toastMessage');
        const toastHeader = toast.querySelector('.toast-header');
        
        if (toastMessage) toastMessage.textContent = message;
        
        if (isError) {
            toast.style.borderLeftColor = '#dc3545';
            const icon = toastHeader?.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-exclamation-triangle-fill';
                icon.style.color = '#dc3545';
            }
            const strong = toastHeader?.querySelector('strong');
            if (strong) strong.textContent = 'Error';
        } else {
            toast.style.borderLeftColor = '#2C5A6E';
            const icon = toastHeader?.querySelector('i');
            if (icon) {
                icon.className = 'bi bi-check-circle-fill';
                icon.style.color = '#2C5A6E';
            }
            const strong = toastHeader?.querySelector('strong');
            if (strong) strong.textContent = 'Éxito';
        }
        
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    };
});