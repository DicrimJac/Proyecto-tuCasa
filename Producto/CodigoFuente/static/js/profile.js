
const userProfile = {
    fullName: 'María González',
    email: 'maria.gonzalez@example.com',
    phone: '+56 9 1234 5678',
    birthdate: '1990-03-15',
    address: 'Av. Los Condes 1234, Santiago',
    avatar: 'https://via.placeholder.com/120/CCCCCC/FFFFFF?text=User',
    memberSince: '2024',
    notifications: {
        email: true,
        push: true,
        sms: false
    },
    privacy: {
        twoFactor: false,
        activityLog: true,
        dataSharing: false
    }
};

// ========== DOM ELEMENTS ==========

const avatarImg = document.getElementById('avatarImg');
const userNameDisplay = document.getElementById('userNameDisplay');
const userEmailDisplay = document.getElementById('userEmailDisplay');
const fullNameSpan = document.getElementById('fullName');
const emailSpan = document.getElementById('email');
const phoneSpan = document.getElementById('phone');
const birthdateSpan = document.getElementById('birthdate');
const addressSpan = document.getElementById('address');

// Form elements
const editFullName = document.getElementById('editFullName');
const editPhone = document.getElementById('editPhone');
const editBirthdate = document.getElementById('editBirthdate');
const editAddress = document.getElementById('editAddress');

// Notification elements
const emailNotif = document.getElementById('emailNotif');
const pushNotif = document.getElementById('pushNotif');
const smsNotif = document.getElementById('smsNotif');

// Privacy elements
const twoFactorAuth = document.getElementById('twoFactorAuth');
const activityLog = document.getElementById('activityLog');
const dataSharing = document.getElementById('dataSharing');

// Avatar elements
const avatarUpload = document.getElementById('avatarUpload');
const avatarPreview = document.getElementById('avatarPreview');

// Toast notification
const notificationToast = document.getElementById('notificationToast');
const toastMessage = document.getElementById('toastMessage');


function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    const toastHeader = notificationToast.querySelector('.toast-header');
    toastHeader.className = `toast-header bg-${type} text-white`;
    notificationToast.style.display = 'block';
    
    setTimeout(() => {
        notificationToast.style.display = 'none';
    }, 3000);
}


function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function loadUserProfile() {
    // Header
    userNameDisplay.textContent = userProfile.fullName;
    userEmailDisplay.textContent = userProfile.email;
    avatarImg.src = userProfile.avatar;
    document.getElementById('memberSince').textContent = `Miembro desde ${userProfile.memberSince}`;
    
    // Info rows
    fullNameSpan.textContent = userProfile.fullName;
    emailSpan.textContent = userProfile.email;
    phoneSpan.textContent = userProfile.phone;
    birthdateSpan.textContent = formatDate(userProfile.birthdate);
    addressSpan.textContent = userProfile.address;
    
    // Modal form values
    editFullName.value = userProfile.fullName;
    editPhone.value = userProfile.phone;
    editBirthdate.value = userProfile.birthdate;
    editAddress.value = userProfile.address;
    
    // Notification preferences
    emailNotif.checked = userProfile.notifications.email;
    pushNotif.checked = userProfile.notifications.push;
    smsNotif.checked = userProfile.notifications.sms;
    
    // Privacy preferences
    twoFactorAuth.checked = userProfile.privacy.twoFactor;
    activityLog.checked = userProfile.privacy.activityLog;
    dataSharing.checked = userProfile.privacy.dataSharing;
}

/**
 * Save profile changes
 */
function saveProfileChanges(event) {
    event.preventDefault();
    
    userProfile.fullName = editFullName.value;
    userProfile.phone = editPhone.value;
    userProfile.birthdate = editBirthdate.value;
    userProfile.address = editAddress.value;
    
    loadUserProfile();
    showToast('Perfil actualizado correctamente', 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
    if (modal) modal.hide();
}

/**
 * Change password
 */
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPass').value;
    const confirmPassword = document.getElementById('confirmNewPass').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Por favor completa todos los campos', 'danger');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Las contraseñas nuevas no coinciden', 'danger');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'danger');
        return;
    }
    
    // Simular cambio de contraseña
    showToast('Contraseña actualizada correctamente', 'success');
    
    // Limpiar formulario
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPass').value = '';
    document.getElementById('confirmNewPass').value = '';
    
    // Cerrar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
    if (modal) modal.hide();
}

/**
 * Save notification preferences
 */
function saveNotifications() {
    userProfile.notifications = {
        email: emailNotif.checked,
        push: pushNotif.checked,
        sms: smsNotif.checked
    };
    
    showToast('Preferencias de notificaciones guardadas', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('notificationsModal'));
    if (modal) modal.hide();
}

/**
 * Save privacy preferences
 */
function savePrivacy() {
    userProfile.privacy = {
        twoFactor: twoFactorAuth.checked,
        activityLog: activityLog.checked,
        dataSharing: dataSharing.checked
    };
    
    showToast('Configuración de privacidad guardada', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('privacyModal'));
    if (modal) modal.hide();
}

/**
 * Handle avatar upload
 */
function handleAvatarUpload() {
    const file = avatarUpload.files[0];
    
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
        showToast('Solo se permiten imágenes', 'danger');
        return;
    }
    
    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('La imagen no debe superar los 2MB', 'danger');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        avatarPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Save avatar
 */
function saveAvatar() {
    if (avatarPreview.src && avatarPreview.src !== 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User') {
        userProfile.avatar = avatarPreview.src;
        avatarImg.src = userProfile.avatar;
        showToast('Foto de perfil actualizada', 'success');
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
    if (modal) modal.hide();
}

/**
 * Remove avatar
 */
function removeAvatar() {
    userProfile.avatar = 'https://via.placeholder.com/120/CCCCCC/FFFFFF?text=User';
    avatarImg.src = userProfile.avatar;
    avatarPreview.src = 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=User';
    showToast('Foto de perfil eliminada', 'success');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
    if (modal) modal.hide();
}

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Edit profile form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', saveProfileChanges);
    }
    
    // Password change form
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', changePassword);
    }
    
    // Save notifications button
    const saveNotifBtn = document.getElementById('saveNotif');
    if (saveNotifBtn) {
        saveNotifBtn.addEventListener('click', saveNotifications);
    }
    
    // Save privacy button
    const savePrivacyBtn = document.getElementById('savePrivacy');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', savePrivacy);
    }
    
    // Avatar upload
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
    
    // Save avatar button
    const saveAvatarBtn = document.getElementById('saveAvatar');
    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', saveAvatar);
    }
    
    // Remove avatar button
    const removeAvatarBtn = document.getElementById('removeAvatar');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', removeAvatar);
    }
}

/**
 * Main initialization function
 */
function init() {
    loadUserProfile();
    initEventListeners();
    console.log('Perfil page initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}