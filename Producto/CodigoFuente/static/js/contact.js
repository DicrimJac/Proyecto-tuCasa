// ===================== VALIDAR TELÉFONO (SOLO NÚMEROS) =====================
function validatePhoneNumber(input) {
    // Guardar el valor actual
    let value = input.value;

    // Remover cualquier caracter que NO sea número (solo dígitos 0-9)
    value = value.replace(/[^0-9]/g, '');

    // Limitar longitud máxima a 15 dígitos
    if (value.length > 15) {
        value = value.slice(0, 15);
    }

    // Actualizar el input
    input.value = value;
}

// ===================== CONTACTO - FORMULARIO =====================
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    const toast = document.getElementById('toastContact');
    const toastMessage = document.getElementById('toastMessage');

    // ========== VALIDACIÓN DEL TELÉFONO (SOLO NÚMEROS) ==========
    const phoneInput = document.getElementById('contactPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            validatePhoneNumber(this);
        });
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Obtener valores del formulario
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            let phone = document.getElementById('contactPhone').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;

            // ===================== VALIDAR TELÉFONO (SOLO NÚMEROS) =====================
            function validatePhoneNumber(input) {
                // Guardar el valor actual
                let value = input.value;

                // Remover cualquier caracter que NO sea número (solo dígitos 0-9)
                value = value.replace(/[^0-9]/g, '');

                // Limitar longitud máxima a 15 dígitos
                if (value.length > 15) {
                    value = value.slice(0, 15);
                }

                // Actualizar el input
                input.value = value;
            }
            // Validar campos obligatorios
            if (!name || !email || !message) {
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
                console.log('Mensaje enviado:', { name, email, phone, subject, message });

                // Mostrar mensaje de éxito
                mostrarToast(`¡Gracias ${name}! Tu mensaje ha sido enviado correctamente. Te contactaremos pronto.`);

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

    const observer = new IntersectionObserver(function (entries) {
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