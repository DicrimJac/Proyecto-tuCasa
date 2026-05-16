// ========== SOLICITAR ARRIENDO - DATOS DE PROPIEDAD ==========
// Simular datos de la propiedad (normalmente vendría de URL o API)
const propertyData = {
    id: 1,
    title: "Casa en Santiago Centro",
    location: "Santiago Centro, Santiago",
    price: 500000,
    rooms: 3,
    bathrooms: 2,
    parking: 1,
    area: 120,
    image: "assets/image/casa1.png",
    status: "disponible"
};

// ========== CARGAR DATOS DE PROPIEDAD ==========
function loadPropertyData() {
    document.getElementById('propertyImage').src = propertyData.image;
    document.getElementById('propertyTitle').textContent = propertyData.title;
    document.getElementById('propertyLocation').textContent = propertyData.location;
    document.getElementById('propertyPrice').textContent = `$${propertyData.price.toLocaleString()}`;
    document.getElementById('propertyRooms').textContent = propertyData.rooms;
    document.getElementById('propertyBathrooms').textContent = propertyData.bathrooms;
    document.getElementById('propertyParking').textContent = propertyData.parking;
    document.getElementById('propertyArea').textContent = propertyData.area;
    
    const statusElement = document.getElementById('propertyStatus');
    if (propertyData.status === 'disponible') {
        statusElement.textContent = 'Disponible';
        statusElement.classList.remove('unavailable');
    } else {
        statusElement.textContent = 'No disponible';
        statusElement.classList.add('unavailable');
    }
}

// ========== VALIDAR RUT ==========
function validateRut(rut) {
    rut = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
    if (rut.length < 2) return false;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo.charAt(i)) * multiplo;
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dvCalculado === dv;
}

function formatRut(input) {
    let value = input.value.replace(/\./g, '').replace(/-/g, '');
    if (value.length > 1) {
        let cuerpo = value.slice(0, -1);
        let dv = value.slice(-1);
        cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        input.value = cuerpo + '-' + dv;
    }
}

// ========== VALIDAR TELÉFONO ==========
function validatePhone(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 9) value = value.slice(0, 9);
    input.value = value;
}

// ========== ENVIAR SOLICITUD ==========
function submitRequest(formData) {
    // Obtener solicitudes existentes
    let requests = JSON.parse(localStorage.getItem('rentRequests')) || [];
    
    // Crear nueva solicitud
    const newRequest = {
        id: Date.now(),
        propertyId: propertyData.id,
        propertyTitle: propertyData.title,
        propertyLocation: propertyData.location,
        propertyPrice: propertyData.price,
        propertyImage: propertyData.image,
        fullName: formData.fullName,
        rut: formData.rut,
        email: formData.email,
        phone: formData.phone,
        startDate: formData.startDate,
        duration: formData.duration,
        occupants: formData.occupants,
        pets: formData.pets,
        employment: formData.employment,
        income: formData.income,
        message: formData.message,
        status: 'pendiente',
        date: new Date().toISOString()
    };
    
    requests.unshift(newRequest);
    localStorage.setItem('rentRequests', JSON.stringify(requests));
    
    return true;
}

// ========== TOAST ==========
function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
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
        if (toastHeader) {
            const icon = toastHeader.querySelector('i');
            if (icon) icon.className = 'bi bi-info-circle-fill';
            const strong = toastHeader.querySelector('strong');
            if (strong) strong.textContent = 'Información';
            toast.style.borderLeftColor = '#2C5A6E';
        }
    }, 3000);
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    loadPropertyData();
    
    // Validación de RUT
    const rutInput = document.getElementById('rut');
    rutInput.addEventListener('input', function() {
        formatRut(this);
    });
    
    // Validación de teléfono
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function() {
        validatePhone(this);
    });
    
    // Fecha mínima (hoy)
    const startDateInput = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    
    // Envío de formulario
    const form = document.getElementById('requestForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const rut = document.getElementById('rut').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const startDate = document.getElementById('startDate').value;
        const duration = document.getElementById('duration').value;
        const occupants = document.getElementById('occupants').value;
        const pets = document.querySelector('input[name="pets"]:checked')?.value;
        const employment = document.getElementById('employment').value;
        const income = document.getElementById('income').value;
        const message = document.getElementById('message').value;
        const termsCheckbox = document.getElementById('termsCheckbox').checked;
        
        // Validaciones
        if (!fullName) {
            showToast('Por favor, ingresa tu nombre completo', true);
            return;
        }
        
        if (!rut || !validateRut(rut)) {
            showToast('Por favor, ingresa un RUT válido', true);
            return;
        }
        
        if (!email || !email.includes('@')) {
            showToast('Por favor, ingresa un correo electrónico válido', true);
            return;
        }
        
        if (!phone || phone.length < 8) {
            showToast('Por favor, ingresa un teléfono válido', true);
            return;
        }
        
        if (!startDate) {
            showToast('Por favor, selecciona la fecha de inicio deseada', true);
            return;
        }
        
        if (!duration) {
            showToast('Por favor, selecciona la duración del contrato', true);
            return;
        }
        
        if (!occupants) {
            showToast('Por favor, indica el número de ocupantes', true);
            return;
        }
        
        if (!employment) {
            showToast('Por favor, selecciona tu situación laboral', true);
            return;
        }
        
        if (!income || income <= 0) {
            showToast('Por favor, ingresa un ingreso mensual válido', true);
            return;
        }
        
        if (!termsCheckbox) {
            showToast('Debes aceptar los términos y condiciones', true);
            return;
        }
        
        // Preparar datos
        const formData = {
            fullName, rut, email, phone, startDate,
            duration: document.getElementById('duration').options[document.getElementById('duration').selectedIndex]?.text,
            occupants: document.getElementById('occupants').options[document.getElementById('occupants').selectedIndex]?.text,
            pets,
            employment: document.getElementById('employment').options[document.getElementById('employment').selectedIndex]?.text,
            income,
            message
        };
        
        // Simular envío
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            const success = submitRequest(formData);
            if (success) {
                showToast('¡Solicitud enviada correctamente! Te contactaremos pronto.');
                form.reset();
            } else {
                showToast('Error al enviar la solicitud. Intenta nuevamente.', true);
            }
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
});