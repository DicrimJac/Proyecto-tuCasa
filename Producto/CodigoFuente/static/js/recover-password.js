let currentStep = 1;
let userEmail = '';
let verificationCode = '1234'; // Cambiado a 4 dígitos
let timerInterval = null;

// Dominios permitidos
const allowedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'duoc.cl', 'outlook.com'];

// ========== DOM ELEMENTS ==========
const step1Content = document.getElementById('step1Content');
const step2Content = document.getElementById('step2Content');
const step3Content = document.getElementById('step3Content');
const messageContainer = document.getElementById('messageContainer');
const recoveryEmail = document.getElementById('recoveryEmail');
const emailErrorDiv = document.getElementById('emailError');
const newPassword = document.getElementById('newPassword');
const confirmPassword = document.getElementById('confirmPassword');
const newPassError = document.getElementById('newPassError');
const confirmError = document.getElementById('confirmError');

// ========== FUNCIONES DE VALIDACIÓN ==========

// Mostrar mensajes
function showMessage(msg, type = 'danger') {
    messageContainer.innerHTML = `
        <div class="alert alert-${type} alert-custom d-flex align-items-center" role="alert">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2"></i>
            <div>${msg}</div>
        </div>
    `;
    setTimeout(() => {
        const alert = messageContainer.querySelector('.alert');
        if (alert) alert.style.transition = 'opacity 0.3s';
    }, 10);
}

function clearMessage() {
    messageContainer.innerHTML = '';
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

// Validar email al perder el foco
function validateEmailOnBlur() {
    const email = recoveryEmail.value.trim();
    
    if (email === '') {
        recoveryEmail.classList.add('is-invalid');
        recoveryEmail.classList.remove('is-valid');
        emailErrorDiv.textContent = 'Por favor ingresa un correo electrónico.';
        emailErrorDiv.style.display = 'block';
    } else if (!email.includes('@')) {
        recoveryEmail.classList.add('is-invalid');
        recoveryEmail.classList.remove('is-valid');
        emailErrorDiv.textContent = 'El correo debe contener el símbolo "@". Ejemplo: usuario@dominio.com';
        emailErrorDiv.style.display = 'block';
    } else if (!validateEmailFormat(email)) {
        recoveryEmail.classList.add('is-invalid');
        recoveryEmail.classList.remove('is-valid');
        emailErrorDiv.textContent = getEmailErrorMessage(email);
        emailErrorDiv.style.display = 'block';
    } else {
        recoveryEmail.classList.remove('is-invalid');
        recoveryEmail.classList.add('is-valid');
        emailErrorDiv.style.display = 'none';
    }
}

// Validar nueva contraseña al perder el foco
function validateNewPasswordOnBlur() {
    const password = newPassword.value;
    
    if (password === '') {
        newPassword.classList.add('is-invalid');
        newPassword.classList.remove('is-valid');
        newPassError.textContent = 'Por favor ingresa tu nueva contraseña.';
        newPassError.style.display = 'block';
    } else if (!validatePasswordStrength(password)) {
        newPassword.classList.add('is-invalid');
        newPassword.classList.remove('is-valid');
        newPassError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        newPassError.style.display = 'block';
    } else {
        newPassword.classList.remove('is-invalid');
        newPassword.classList.add('is-valid');
        newPassError.style.display = 'none';
    }
    
    if (confirmPassword.value) {
        validateConfirmPassword();
    }
}

// Validar confirmación de contraseña
function validateConfirmPassword() {
    const password = newPassword.value;
    const confirm = confirmPassword.value;
    
    if (confirm === '') {
        confirmPassword.classList.add('is-invalid');
        confirmPassword.classList.remove('is-valid');
        confirmError.style.display = 'block';
    } else if (password !== confirm) {
        confirmPassword.classList.add('is-invalid');
        confirmPassword.classList.remove('is-valid');
        confirmError.style.display = 'block';
    } else {
        confirmPassword.classList.remove('is-invalid');
        confirmPassword.classList.add('is-valid');
        confirmError.style.display = 'none';
    }
}

// ========== FUNCIONES DE PASOS ==========
function updateSteps() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
}

function goToStep(step) {
    currentStep = step;
    step1Content.style.display = step === 1 ? 'block' : 'none';
    step2Content.style.display = step === 2 ? 'block' : 'none';
    step3Content.style.display = step === 3 ? 'block' : 'none';
    updateSteps();
    clearMessage();
}

// ========== TIMER PARA REENVIAR CÓDIGO ==========
function startTimer() {
    let seconds = 30;
    const timerSpan = document.getElementById('timer');
    const resendLink = document.getElementById('resendCode');
    
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        seconds--;
        timerSpan.textContent = `(${seconds}s)`;
        
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerSpan.textContent = '';
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
        }
    }, 1000);
}

// ========== PASSWORD STRENGTH METER ==========
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return Math.min(strength, 4);
}

// ========== STEP 1: EMAIL ==========
function initStep1() {
    recoveryEmail.addEventListener('blur', validateEmailOnBlur);
    
    recoveryEmail.addEventListener('input', () => {
        if (messageContainer.innerHTML !== '') {
            clearMessage();
        }
        
        const email = recoveryEmail.value.trim();
        
        if (email && !email.includes('@')) {
            recoveryEmail.classList.add('is-invalid');
            recoveryEmail.classList.remove('is-valid');
            emailErrorDiv.textContent = 'El correo debe contener el símbolo "@"';
            emailErrorDiv.style.display = 'block';
        } else if (recoveryEmail.classList.contains('is-invalid')) {
            recoveryEmail.classList.remove('is-invalid');
            emailErrorDiv.style.display = 'none';
        }
    });
    
    document.getElementById('emailForm').addEventListener('submit', (e) => {
        e.preventDefault();
        clearMessage();
        
        const email = recoveryEmail.value.trim();
        validateEmailOnBlur();
        
        if (!validateEmailFormat(email)) {
            showMessage(getEmailErrorMessage(email), 'danger');
            return;
        }
        
        userEmail = email;
        document.getElementById('emailDisplay').innerText = email;
        
        showMessage(`Hemos enviado un código de verificación de 4 dígitos a ${email}`, 'success');
        setTimeout(() => {
            goToStep(2);
            startTimer();
        }, 1500);
    });
}

// ========== STEP 2: CÓDIGO - ACTUALIZADO PARA 4 DÍGITOS ==========
function initStep2() {
    const codeInputs = document.querySelectorAll('.code-input');
    
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < 3) { // Cambiado de 5 a 3
                codeInputs[index + 1].focus();
            }
            document.getElementById('codeError').style.display = 'none';
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });
    
    document.getElementById('codeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const codeInputsArray = document.querySelectorAll('.code-input');
        const code = Array.from(codeInputsArray).map(input => input.value).join('');
        
        if (code.length !== 4) { // Cambiado de 6 a 4
            document.getElementById('codeError').style.display = 'block';
            return;
        }
        
        if (code === verificationCode) {
            goToStep(3);
        } else {
            document.getElementById('codeError').style.display = 'block';
            showMessage('Código incorrecto', 'danger');
        }
    });
    
    document.getElementById('resendCode').addEventListener('click', (e) => {
        e.preventDefault();
        startTimer();
        showMessage('Se ha enviado un nuevo código de 4 dígitos a tu email', 'success');
    });
}

// ========== STEP 3: NUEVA CONTRASEÑA ==========
function initStep3() {
    newPassword.addEventListener('input', (e) => {
        const password = e.target.value;
        const strength = checkPasswordStrength(password);
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        const colors = ['#dc3545', '#ffc107', '#17a2b8', '#28a745'];
        const texts = ['Muy débil', 'Débil', 'Buena', 'Fuerte'];
        
        if (password.length === 0) {
            strengthBar.style.width = '0%';
            strengthText.textContent = '';
        } else {
            strengthBar.style.width = `${(strength + 1) * 20}%`;
            strengthBar.style.backgroundColor = colors[strength];
            strengthText.textContent = texts[strength];
        }
        
        if (newPassword.classList.contains('is-invalid')) {
            newPassword.classList.remove('is-invalid');
            newPassError.style.display = 'none';
        }
        
        if (confirmPassword.value) {
            validateConfirmPassword();
        }
    });
    
    newPassword.addEventListener('blur', validateNewPasswordOnBlur);
    confirmPassword.addEventListener('blur', validateConfirmPassword);
    
    confirmPassword.addEventListener('input', () => {
        if (confirmPassword.classList.contains('is-invalid')) {
            validateConfirmPassword();
        }
    });
    
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newPass = newPassword.value;
        const confirmPass = confirmPassword.value;
        
        validateNewPasswordOnBlur();
        validateConfirmPassword();
        
        if (!validatePasswordStrength(newPass)) {
            showMessage('La contraseña debe tener al menos 6 caracteres', 'danger');
            return;
        }
        
        if (newPass !== confirmPass) {
            showMessage('Las contraseñas no coinciden', 'danger');
            return;
        }
        
        showMessage('¡Contraseña actualizada correctamente! Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

// ========== INICIALIZACIÓN ==========
function init() {
    initStep1();
    initStep2();
    initStep3();
    console.log('Recuperar password page initialized');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}