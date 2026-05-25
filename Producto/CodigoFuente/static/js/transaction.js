// ========== TRANSACTION PAGE ==========

// Datos del plan Premium
const planData = {
    name: "Premium",
    price: 500000,
    currency: "CLP",
    duration: "1 año"
};

// ========== FORMATO DE TARJETA ==========
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
        value = value.slice(0, 2) + '/' + value.slice(2);
    }
    input.value = value;
}

function formatCVV(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    input.value = value;
}

// ========== MÉTODOS DE PAGO ==========
function initPaymentMethods() {
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            option.querySelector('input').checked = true;
        });
    });
}

// ========== VALIDACIÓN ==========
function validateForm() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value;
    const cvv = document.getElementById('cvv').value;
    const cardName = document.getElementById('cardName').value.trim();
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (cardNumber.length !== 16) {
        showToast('Número de tarjeta inválido (debe tener 16 dígitos)', true);
        return false;
    }
    
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
        showToast('Fecha de expiración inválida (MM/AA)', true);
        return false;
    }
    
    if (cvv.length < 3) {
        showToast('CVV inválido', true);
        return false;
    }
    
    if (cardName === '') {
        showToast('Ingresa el nombre en la tarjeta', true);
        return false;
    }
    
    if (!acceptTerms) {
        showToast('Debes aceptar los términos y condiciones', true);
        return false;
    }
    
    return true;
}

// ========== GENERAR ID DE TRANSACCIÓN ==========
function generateTransactionId() {
    const prefix = 'TUCASA';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// ========== PROCESAR PAGO ==========
function processPayment() {
    if (!validateForm()) return;
    
    const payButton = document.getElementById('payButton');
    const originalText = payButton.innerHTML;
    
    // Simular procesamiento de pago
    payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    payButton.disabled = true;
    
    setTimeout(() => {
        // Generar datos de transacción
        const transactionId = generateTransactionId();
        const transactionDate = new Date().toLocaleString('es-CL');
        
        // Guardar transacción en localStorage
        const transaction = {
            id: transactionId,
            plan: planData.name,
            amount: planData.price,
            currency: planData.currency,
            date: new Date().toISOString(),
            status: 'completado'
        };
        
        // Guardar en historial
        let transactions = JSON.parse(localStorage.getItem('userTransactions')) || [];
        transactions.unshift(transaction);
        localStorage.setItem('userTransactions', JSON.stringify(transactions));
        
        // Guardar plan activo
        localStorage.setItem('userPlan', JSON.stringify({
            plan: planData.name,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Mostrar modal de éxito
        document.getElementById('transactionId').textContent = transactionId;
        document.getElementById('transactionDate').textContent = transactionDate;
        document.getElementById('successModal').classList.add('active');
        
        // Restaurar botón
        payButton.innerHTML = originalText;
        payButton.disabled = false;
    }, 2000);
}

// ========== IR AL PERFIL ==========
function goToProfile() {
    window.location.href = 'profile.html';
}

// ========== TOAST ==========
function showToast(message, isError = false) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastHeader = toast?.querySelector('.toast-header');
    
    if (!toast) return;
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
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar métodos de pago
    initPaymentMethods();
    
    // Event listeners para formato de campos
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', () => formatCardNumber(cardNumber));
    }
    
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        expiryDate.addEventListener('input', () => formatExpiryDate(expiryDate));
    }
    
    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', () => formatCVV(cvv));
    }
    
    // Event listener del formulario
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processPayment();
        });
    }
});

// Exponer función global para el modal
window.goToProfile = goToProfile;