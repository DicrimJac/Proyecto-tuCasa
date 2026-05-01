// ===================== CONTACTO - FORMULARIO =====================
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toastContact');
    const toastMessage = document.getElementById('toastMessage');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const nombre = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const telefono = document.getElementById('contactPhone').value;
            const asunto = document.getElementById('contactSubject').value;
            const mensaje = document.getElementById('contactMessage').value;
            
            // Validar campos obligatorios
            if (!nombre || !email || !mensaje) {
                mostrarToast('Por favor, completa los campos obligatorios (*)', true);
                return;
            }
            
            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                mostrarToast('Por favor, ingresa un correo electrónico válido', true);
                return;
            }
            
            // Simular envío del formulario
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Aquí iría la llamada a la API para enviar el mensaje
                console.log('Mensaje enviado:', { nombre, email, telefono, asunto, mensaje });
                
                // Mostrar mensaje de éxito
                mostrarToast(`¡Gracias ${nombre}! Tu mensaje ha sido enviado correctamente. Te contactaremos pronto.`);
                
                // Limpiar formulario
                contactForm.reset();
                
                // Restaurar botón
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Función para mostrar toast
    function mostrarToast(message, isError = false) {
        toastMessage.textContent = message;
        
        if (isError) {
            toast.style.borderLeftColor = '#dc3545';
            const toastHeader = toast.querySelector('.toast-header');
            toastHeader.querySelector('i').className = 'bi bi-exclamation-triangle-fill';
            toastHeader.querySelector('i').style.color = '#dc3545';
            toastHeader.querySelector('strong').textContent = 'Error';
        } else {
            toast.style.borderLeftColor = '#2C5A6E';
            const toastHeader = toast.querySelector('.toast-header');
            toastHeader.querySelector('i').className = 'bi bi-check-circle-fill';
            toastHeader.querySelector('i').style.color = '#2C5A6E';
            toastHeader.querySelector('strong').textContent = 'Éxito';
        }
        
        toast.style.display = 'block';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
    
    // Animación de entrada para los elementos
    const infoItems = document.querySelectorAll('.info-item');
    const formElements = document.querySelectorAll('.form-group');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    infoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
        observer.observe(item);
    });
    
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateX(20px)';
        element.style.transition = `opacity 0.3s ease ${index * 0.1}s, transform 0.3s ease ${index * 0.1}s`;
        observer.observe(element);
    });
});