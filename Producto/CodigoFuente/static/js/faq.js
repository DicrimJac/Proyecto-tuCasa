// ========== FAQ PAGE ==========
document.addEventListener('DOMContentLoaded', function() {
    
    // ========== ACORDEÓN DE PREGUNTAS ==========
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Cerrar otros items abiertos
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle el item actual
            item.classList.toggle('active');
        });
    });
    
    // ========== FILTRO POR CATEGORÍAS ==========
    const categoryBtns = document.querySelectorAll('.category-btn');
    const categories = document.querySelectorAll('.faq-category');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            
            // Actualizar botón activo
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar categoría seleccionada
            categories.forEach(cat => {
                if (cat.id === `category-${category}`) {
                    cat.style.display = 'block';
                } else {
                    cat.style.display = 'none';
                }
            });
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