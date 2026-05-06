(function() {
    // Elementos del DOM
    const form = document.getElementById('loginForm');
    const mailInput = document.getElementById('mailInput');
    const passwordInput = document.getElementById('passwordInput');
    const mailErrorDiv = document.getElementById('mailError');
    const passErrorDiv = document.getElementById('passError');
    const messageContainer = document.getElementById('loginMessage');
    const loginRedirectUrl = 'home.html';
    
    // Dominios permitidos
    const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'duoc.cl', 'outlook.com'];
    
    // Mostrar mensajes de alerta
    function showMessage(msg, type = 'danger') {
        messageContainer.innerHTML = `
            <div class="alert alert-${type} alert-custom d-flex align-items-center" role="alert" style="padding: 0.7rem 1rem;">
                <i class="bi bi-${type === 'success' ? 'check-circle-fill' : (type === 'danger' ? 'exclamation-triangle-fill' : 'info-circle-fill')} me-2"></i>
                <div>${msg}</div>
            </div>
        `;
        setTimeout(() => {
            const alertDiv = messageContainer.querySelector('.alert');
            if (alertDiv) alertDiv.style.transition = 'opacity 0.3s';
        }, 10);
    }
    
    // Limpiar mensajes
    function clearMessage() {
        messageContainer.innerHTML = '';
    }
    
    // Limpiar estilos de validación
    function clearValidationStyles() {
        mailInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');
        mailInput.classList.remove('is-valid');
        passwordInput.classList.remove('is-valid');
        mailErrorDiv.style.display = 'none';
        passErrorDiv.style.display = 'none';
    }
    
    // Validar formato de email y dominio permitido
    function validateEmailFormat(mail) {
        if (!mail) return false;
        
        if (!mail.includes('@')) return false;
        
        const mailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!mailRegex.test(mail)) return false;
        
        const domain = mail.split('@')[1].toLowerCase();
        return allowedDomains.includes(domain);
    }
    
    // Obtener mensaje de error específico para email
    function getEmailErrorMessage(mail) {
        if (!mail) return 'Por favor ingresa un correo electrónico.';
        
        if (!mail.includes('@')) {
            return 'El correo debe contener el símbolo "@". Ejemplo: usuario@dominio.com';
        }
        
        const mailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!mailRegex.test(mail)) {
            return 'Formato de correo inválido. Ejemplo: usuario@dominio.com';
        }
        
        const domain = mail.split('@')[1]?.toLowerCase();
        if (domain && !allowedDomains.includes(domain)) {
            return `Dominio no permitido. Usa: ${allowedDomains.join(', ')}`;
        }
        
        return 'Por favor ingresa un correo electrónico válido.';
    }
    
    // Validar contraseña (mínimo 6 caracteres)
    function validatePasswordStrength(pass) {
        if (!pass) return false;
        return pass.length >= 6;
    }
    
    // Validar email al perder el foco (blur)
    function validateEmailOnBlur() {
        const mail = mailInput.value.trim();
        
        if (mail === '') {
            mailInput.classList.add('is-invalid');
            mailInput.classList.remove('is-valid');
            mailErrorDiv.textContent = 'Por favor ingresa un correo electrónico.';
            mailErrorDiv.style.display = 'block';
        } else if (!mail.includes('@')) {
            mailInput.classList.add('is-invalid');
            mailInput.classList.remove('is-valid');
            mailErrorDiv.textContent = 'El correo debe contener el símbolo "@". Ejemplo: usuario@dominio.com';
            mailErrorDiv.style.display = 'block';
        } else if (!validateEmailFormat(mail)) {
            mailInput.classList.add('is-invalid');
            mailInput.classList.remove('is-valid');
            mailErrorDiv.textContent = getEmailErrorMessage(mail);
            mailErrorDiv.style.display = 'block';
        } else {
            mailInput.classList.remove('is-invalid');
            mailInput.classList.add('is-valid');
            mailErrorDiv.style.display = 'none';
        }
    }
    
    // Validar contraseña al perder el foco (blur)
    function validatePasswordOnBlur() {
        const password = passwordInput.value;
        
        if (password === '') {
            passwordInput.classList.add('is-invalid');
            passwordInput.classList.remove('is-valid');
            passErrorDiv.textContent = 'Por favor ingresa tu contraseña.';
            passErrorDiv.style.display = 'block';
        } else if (!validatePasswordStrength(password)) {
            passwordInput.classList.add('is-invalid');
            passwordInput.classList.remove('is-valid');
            passErrorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            passErrorDiv.style.display = 'block';
        } else {
            passwordInput.classList.remove('is-invalid');
            passwordInput.classList.add('is-valid');
            passErrorDiv.style.display = 'none';
        }
    }
    
    // Manejar envío del formulario (login real contra backend)
    async function handleSubmit(event) {
        event.preventDefault();
        clearMessage();
        
        // Ejecutar validaciones completas
        validateEmailOnBlur();
        validatePasswordOnBlur();
        
        const mail = mailInput.value.trim();
        const password = passwordInput.value;
        
        const isEmailValid = validateEmailFormat(mail);
        const isPasswordValid = validatePasswordStrength(password);
        
        if (!isEmailValid || !isPasswordValid) {
            let errorMsg = '';
            if (!isEmailValid) {
                if (!mail.includes('@')) {
                    errorMsg += '❌ El correo debe contener el símbolo "@"\n';
                } else if (!validateEmailFormat(mail)) {
                    errorMsg += '❌ ' + getEmailErrorMessage(mail) + '\n';
                }
            }
            if (!isPasswordValid) {
                errorMsg += '❌ La contraseña debe tener mínimo 6 caracteres\n';
            }
            showMessage(errorMsg.replace(/\n/g, '<br>'), 'danger');
            return;
        }
        
        // Si todo es válido, proceder con el login contra el backend
        const submitBtn = document.getElementById('submitBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Ingresando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: mail,
                    password: password
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                const errorMsg = result?.error || 'Correo o contraseña incorrectos';
                showMessage(errorMsg, 'danger');
                return;
            }

            const user = result.data || {};

            // Determinar el primer nombre desde la respuesta o hacer fallback al correo
            const backendFirstName = user.first_name || user.firstName || user.nombre || '';
            const firstName = backendFirstName || mail.split('@')[0];

            // Guardar datos de sesión para usarlos en el header (saludo, etc.)
            const userData = {
                ...user,
                first_name: firstName,
                mail: mail
            };

            localStorage.setItem('userData', JSON.stringify(userData));
            // Mantener claves anteriores por compatibilidad con otras pantallas
            localStorage.setItem('userEmail', mail);
            localStorage.setItem('userName', firstName);
            sessionStorage.setItem('isLoggedIn', 'true');

            showMessage('Inicio de sesión exitoso, redirigiendo...', 'success');

            setTimeout(() => {
                window.location.href = loginRedirectUrl;
            }, 800);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            showMessage('Error al conectar con el servidor. Intenta nuevamente.', 'danger');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
    
    // Eventos
    form.addEventListener('submit', handleSubmit);
    
    // Validación al perder el foco (blur)
    mailInput.addEventListener('blur', validateEmailOnBlur);
    passwordInput.addEventListener('blur', validatePasswordOnBlur);
    
    // Limpiar errores mientras escribe (input)
    mailInput.addEventListener('input', () => {
        if (messageContainer.innerHTML !== '') {
            clearMessage();
        }
        
        const mail = mailInput.value.trim();
        
        if (mail && !mail.includes('@')) {
            mailInput.classList.add('is-invalid');
            mailInput.classList.remove('is-valid');
            mailErrorDiv.textContent = 'El correo debe contener el símbolo "@"';
            mailErrorDiv.style.display = 'block';
        } else if (mailInput.classList.contains('is-invalid')) {
            mailInput.classList.remove('is-invalid');
            mailErrorDiv.style.display = 'none';
        }
    });
    
    passwordInput.addEventListener('input', () => {
        if (messageContainer.innerHTML !== '') {
            clearMessage();
        }
        if (passwordInput.classList.contains('is-invalid')) {
            passwordInput.classList.remove('is-invalid');
            passErrorDiv.style.display = 'none';
        }
    });
    
    // Botón crear cuenta
    const createBtn = document.getElementById('createAccountBtn');
    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            e.preventDefault();
            clearMessage();
            clearValidationStyles();
            mailInput.value = '';
            passwordInput.value = '';
            mailInput.classList.remove('is-invalid', 'is-valid');
            passwordInput.classList.remove('is-invalid', 'is-valid');
            mailInput.focus();
        });
    }
})();

// Redirección al registro
const createAccountBtn = document.getElementById('createAccountBtn');
if (createAccountBtn) {
    createAccountBtn.addEventListener('click', function(e) {
        // Si el href no funciona, esta es una alternativa
        window.location.href = 'register.html';
    });
}
// ========== BOTÓN DE GOOGLE - CON REDIRECCIÓN REAL ==========
const googleLoginBtn = document.getElementById('googleLoginBtn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Mostrar estado de carga
        const originalText = this.innerHTML;
        this.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Redirigiendo a Google...';
        this.disabled = true;
        
        // Redirigir a la URL de autenticación de Google (back-end)
        // Esta URL debe ser proporcionada por tu servidor back-end
        window.location.href = 'http://localhost:8080/auth/google'; // Cambia por tu URL real
        
        // Si solo quieres probar el front-end por ahora, usa esto:
        // Simular login exitoso (descomenta para pruebas)
        /*
        setTimeout(() => {
            const mockUser = {
                email: 'usuario@gmail.com',
                name: 'Usuario Google',
                provider: 'google',
                loggedIn: true
            };
            localStorage.setItem('userData', JSON.stringify(mockUser));
            localStorage.setItem('userEmail', mockUser.email);
            window.location.href = 'panel.html';
        }, 1500);
        */
    });
}