// ===================== DOM ELEMENTS =====================
const form = document.getElementById('registerForm');
const submitBtn = document.getElementById('submitBtn');
const termsCheckbox = document.getElementById('termsCheckbox');

const fields = {
    firstName: document.getElementById('firstName'),
    secondName: document.getElementById('secondName'),
    firstLastName: document.getElementById('firstLastName'),
    secondLastName: document.getElementById('secondLastName'),
    rut: document.getElementById('rut'),
    rutDv: document.getElementById('rutDv'),
    phone: document.getElementById('phone'),
    nationality: document.getElementById('nationality'),
    birthDate: document.getElementById('birthDate'),
    gender: document.getElementById('gender'),
    email: document.getElementById('email'),
    confirmEmail: document.getElementById('confirmEmail'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword')
};

// ===================== FUNCIONES UTILITARIAS =====================
function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast.querySelector('.toast-header');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.borderLeftColor = '#dc3545';
        toastHeader.querySelector('i').className = 'bi bi-exclamation-triangle-fill';
        toastHeader.querySelector('i').style.color = '#dc3545';
        toastHeader.querySelector('strong').textContent = 'Error';
    } else {
        toast.style.borderLeftColor = '#2C5A6E';
        toastHeader.querySelector('i').className = 'bi bi-check-circle-fill';
        toastHeader.querySelector('i').style.color = '#2C5A6E';
        toastHeader.querySelector('strong').textContent = 'Éxito';
    }
    
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showError(input, message) {
    const group = input.closest('.input-group');
    if (group) {
        group.classList.add('error');
        const errorSpan = group.querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = message;
    }
}

function clearError(input) {
    const group = input.closest('.input-group');
    if (group) {
        group.classList.remove('error');
        const errorSpan = group.querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = '';
    }
}

function clearAllErrors() {
    document.querySelectorAll('.input-group').forEach(group => {
        group.classList.remove('error');
        const errorSpan = group.querySelector('.error-message');
        if (errorSpan) errorSpan.textContent = '';
    });
}

// ===================== VALIDACIÓN DE RUT CORREGIDA =====================
function validateRut(rut, dv) {
    // Limpiar el RUT: eliminar puntos, guiones y espacios
    let rutLimpio = rut.toString().replace(/\./g, '').replace(/-/g, '').trim();
    
    // Validar que no esté vacío
    if (!rutLimpio || rutLimpio.length === 0) {
        return false;
    }
    
    // Validar que solo tenga números
    if (!/^[0-9]+$/.test(rutLimpio)) {
        return false;
    }
    
    // Validar que el DV no esté vacío
    let dvLimpio = dv.toString().trim().toUpperCase();
    if (!dvLimpio) {
        return false;
    }
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = rutLimpio.length - 1; i >= 0; i--) {
        suma += parseInt(rutLimpio.charAt(i)) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    let dvCalculado = 11 - resto;
    
    let dvEsperado;
    if (dvCalculado === 11) {
        dvEsperado = '0';
    } else if (dvCalculado === 10) {
        dvEsperado = 'K';
    } else {
        dvEsperado = dvCalculado.toString();
    }
    
    return dvEsperado === dvLimpio;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateAge(birthDate) {
    if (!birthDate) return false;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age >= 18;
}

function validatePhone(phone) {
    return /^[0-9]{8,9}$/.test(phone);
}

// ===================== VALIDAR TODO EL FORMULARIO =====================
function validateForm() {
    let isValid = true;
    clearAllErrors();
    
    // Validar nombres
    if (!fields.firstName.value.trim()) {
        showError(fields.firstName, 'Primer nombre requerido');
        isValid = false;
    }
    
    if (!fields.firstLastName.value.trim()) {
        showError(fields.firstLastName, 'Apellido paterno requerido');
        isValid = false;
    }
    
    // Validar RUT
    if (!validateRut(fields.rut.value, fields.rutDv.value)) {
        showError(fields.rut, 'RUT inválido');
        isValid = false;
    }
    
    // Validar teléfono
    if (!validatePhone(fields.phone.value)) {
        showError(fields.phone, 'Teléfono inválido (8-9 dígitos)');
        isValid = false;
    }
    
    // Validar nacionalidad
    if (!fields.nationality.value) {
        showError(fields.nationality, 'Selecciona nacionalidad');
        isValid = false;
    }
    
    // Validar fecha de nacimiento
    if (!fields.birthDate.value) {
        showError(fields.birthDate, 'Fecha de nacimiento requerida');
        isValid = false;
    } else if (!validateAge(fields.birthDate.value)) {
        showError(fields.birthDate, 'Debes ser mayor de 18 años');
        isValid = false;
    }
    
    // Validar género
    if (!fields.gender.value) {
        showError(fields.gender, 'Selecciona género');
        isValid = false;
    }
    
    // Validar email
    if (!validateEmail(fields.email.value)) {
        showError(fields.email, 'Correo inválido');
        isValid = false;
    } else if (fields.email.value !== fields.confirmEmail.value) {
        showError(fields.confirmEmail, 'Los correos no coinciden');
        isValid = false;
    }
    
    // Validar contraseña
    if (!validatePassword(fields.password.value)) {
        showError(fields.password, 'Contraseña debe tener al menos 6 caracteres');
        isValid = false;
    } else if (fields.password.value !== fields.confirmPassword.value) {
        showError(fields.confirmPassword, 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    return isValid;
}

// ===================== HABILITAR/DESABILITAR BOTÓN =====================
function updateButtonState() {
    const allFilled = Object.values(fields).every(field => {
        if (field.tagName === 'SELECT') {
            return field.value !== '';
        }
        return field.value.trim() !== '';
    });
    
    submitBtn.disabled = !(allFilled && termsCheckbox.checked);
}

// ===================== FORMATEAR RUT MIENTRAS SE ESCRIBE =====================
function formatRut(rut) {
    // Eliminar puntos y guiones
    let clean = rut.replace(/\./g, '').replace(/-/g, '');
    
    // Limitar a 8 dígitos (RUT chileno)
    if (clean.length > 8) {
        clean = clean.slice(0, 8);
    }
    
    // Formatear con puntos
    let formatted = '';
    for (let i = clean.length; i > 0; i -= 3) {
        if (formatted) formatted = '.' + formatted;
        formatted = clean.substring(Math.max(0, i - 3), i) + formatted;
    }
    
    return formatted;
}

// ===================== EVENT LISTENERS =====================
// Validación en tiempo real para todos los campos
Object.values(fields).forEach(field => {
    field.addEventListener('input', () => {
        clearError(field);
        updateButtonState();
    });
    
    field.addEventListener('blur', () => {
        if (field.id === 'rut') {
            // Formatear RUT
            field.value = formatRut(field.value);
            
            // Validar RUT completo
            if (fields.rut.value && fields.rutDv.value) {
                if (!validateRut(fields.rut.value, fields.rutDv.value)) {
                    showError(fields.rut, 'RUT inválido');
                }
            }
        } else if (field.id === 'rutDv') {
            // Validar DV
            if (fields.rut.value && fields.rutDv.value) {
                if (!validateRut(fields.rut.value, fields.rutDv.value)) {
                    showError(fields.rut, 'RUT inválido');
                }
            }
        } else if (field.id === 'email' && field.value) {
            if (!validateEmail(field.value)) {
                showError(field, 'Correo inválido');
            }
        } else if (field.id === 'phone' && field.value) {
            if (!validatePhone(field.value)) {
                showError(field, 'Teléfono inválido');
            }
        } else if (field.id === 'confirmEmail' && field.value) {
            if (field.value !== fields.email.value) {
                showError(field, 'Los correos no coinciden');
            }
        } else if (field.id === 'confirmPassword' && field.value) {
            if (field.value !== fields.password.value) {
                showError(field, 'Las contraseñas no coinciden');
            }
        } else if (field.id === 'password' && field.value) {
            if (!validatePassword(field.value)) {
                showError(field, 'Mínimo 6 caracteres');
            } else if (fields.confirmPassword.value && field.value !== fields.confirmPassword.value) {
                showError(fields.confirmPassword, 'Las contraseñas no coinciden');
            }
        }
        updateButtonState();
    });
});

// Términos y condiciones
termsCheckbox.addEventListener('change', updateButtonState);

// Formatear RUT automáticamente mientras se escribe
fields.rut.addEventListener('input', function(e) {
    let value = this.value.replace(/\./g, '').replace(/-/g, '');
    if (value.length > 0) {
        // Limitar a 8 dígitos
        if (value.length > 8) {
            value = value.slice(0, 8);
        }
        
        // Formatear con puntos
        let formatted = '';
        for (let i = value.length; i > 0; i -= 3) {
            if (formatted) formatted = '.' + formatted;
            formatted = value.substring(Math.max(0, i - 3), i) + formatted;
        }
        this.value = formatted;
    }
});

// Formatear teléfono (solo números, máx 9 dígitos)
fields.phone.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
});

// Solo números para RUT y teléfono
fields.rut.addEventListener('keypress', function(e) {
    if (isNaN(e.key) && e.key !== '.') e.preventDefault();
});

fields.phone.addEventListener('keypress', function(e) {
    if (isNaN(e.key)) e.preventDefault();
});

// Solo letras para nombres y apellidos
const nameFields = ['firstName', 'secondName', 'firstLastName', 'secondLastName'];
nameFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('keypress', function(e) {
            const regex = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]$/;
            if (!regex.test(e.key)) {
                e.preventDefault();
            }
        });
    }
});

// Toggle para mostrar/ocultar contraseña
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', function() {
        const input = this.closest('.password-group').querySelector('input');
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        }
    });
});

// ===================== ENVÍO DEL FORMULARIO =====================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast('Por favor, corrige los errores en el formulario', true);
        return;
    }
    
    // Deshabilitar botón durante el envío
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> REGISTRANDO...';
    
    // Simular registro (aquí iría tu llamada a la API)
    setTimeout(() => {
        const userData = {
            firstName: fields.firstName.value,
            secondName: fields.secondName.value,
            firstLastName: fields.firstLastName.value,
            secondLastName: fields.secondLastName.value,
            rut: fields.rut.value + '-' + fields.rutDv.value,
            phone: '+56' + fields.phone.value,
            nationality: fields.nationality.value,
            birthDate: fields.birthDate.value,
            gender: fields.gender.value,
            email: fields.email.value,
            password: fields.password.value
        };
        
        console.log('Datos de registro:', userData);
        
        // Guardar en localStorage (simulación)
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showToast('¡Registro exitoso! Redirigiendo al login...');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }, 1500);
});

// ===================== INICIALIZAR =====================
updateButtonState();