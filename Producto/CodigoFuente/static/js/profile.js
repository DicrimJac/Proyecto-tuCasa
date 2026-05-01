// ========== FUNCIONES UTILITARIAS ==========
function showToast(message) {
    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function loadUserData() {
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
        const userData = JSON.parse(savedData);
        updateProfileDisplay(userData);
    }
}

function updateProfileDisplay(userData) {
    document.getElementById('userNameDisplay').textContent = userData.fullName || 'María González';
    document.getElementById('userEmailDisplay').textContent = userData.email || 'maria.gonzalez@example.com';
    document.getElementById('fullName').textContent = userData.fullName || 'María González';
    document.getElementById('email').textContent = userData.email || 'maria.gonzalez@example.com';
    document.getElementById('phone').textContent = userData.phone || '+56 9 1234 5678';
    document.getElementById('birthdate').textContent = userData.birthdate || '15/03/1990';
    document.getElementById('address').textContent = userData.address || 'Av. Los Condes 1234, Santiago';
    
    if (userData.avatar) {
        document.getElementById('avatarImg').src = userData.avatar;
        document.getElementById('avatarPreview').src = userData.avatar;
    }
}

// ========== EDITAR PERFIL ==========
document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userData = {
        fullName: document.getElementById('editFullName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        birthdate: document.getElementById('editBirthdate').value,
        address: document.getElementById('editAddress').value,
        avatar: document.getElementById('avatarImg').src
    };
    
    if (userData.birthdate) {
        const date = new Date(userData.birthdate);
        userData.birthdate = date.toLocaleDateString('es-ES');
    }
    
    updateProfileDisplay(userData);
    localStorage.setItem('userProfile', JSON.stringify(userData));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
    modal.hide();
    showToast('Perfil actualizado correctamente');
});

// ========== CAMBIAR CONTRASEÑA ==========
document.getElementById('passwordChangeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmNewPass').value;
    
    if (newPass !== confirmPass) {
        showToast('Las contraseñas no coinciden');
        return;
    }
    
    if (newPass.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    showToast('Contraseña actualizada correctamente');
    this.reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
    modal.hide();
});

// ========== NOTIFICACIONES ==========
document.getElementById('saveNotif').addEventListener('click', function() {
    const preferences = {
        email: document.getElementById('emailNotif').checked,
        push: document.getElementById('pushNotif').checked,
        sms: document.getElementById('smsNotif').checked
    };
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    showToast('Preferencias de notificaciones guardadas');
    const modal = bootstrap.Modal.getInstance(document.getElementById('notificationsModal'));
    modal.hide();
});

// ========== PRIVACIDAD ==========
document.getElementById('savePrivacy').addEventListener('click', function() {
    const privacy = {
        twoFactor: document.getElementById('twoFactorAuth').checked,
        activityLog: document.getElementById('activityLog').checked,
        dataSharing: document.getElementById('dataSharing').checked
    };
    localStorage.setItem('privacySettings', JSON.stringify(privacy));
    showToast('Configuración de privacidad guardada');
    const modal = bootstrap.Modal.getInstance(document.getElementById('privacyModal'));
    modal.hide();
});

// ========== AVATAR ==========
document.getElementById('saveAvatar').addEventListener('click', function() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];
    
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showToast('La imagen no debe superar los 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            document.getElementById('avatarImg').src = avatarUrl;
            document.getElementById('avatarPreview').src = avatarUrl;
            
            const savedData = localStorage.getItem('userProfile');
            if (savedData) {
                const userData = JSON.parse(savedData);
                userData.avatar = avatarUrl;
                localStorage.setItem('userProfile', JSON.stringify(userData));
            }
            
            showToast('Foto de perfil actualizada');
            const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
            modal.hide();
        };
        reader.readAsDataURL(file);
    } else {
        showToast('Selecciona una imagen primero');
    }
});

document.getElementById('removeAvatar').addEventListener('click', function() {
    const name = document.getElementById('userNameDisplay').textContent;
    const defaultAvatar = `https://ui-avatars.com/api/?background=2C5A6E&color=fff&rounded=true&size=120&bold=true&name=${encodeURIComponent(name)}`;
    document.getElementById('avatarImg').src = defaultAvatar;
    document.getElementById('avatarPreview').src = defaultAvatar;
    
    const savedData = localStorage.getItem('userProfile');
    if (savedData) {
        const userData = JSON.parse(savedData);
        userData.avatar = defaultAvatar;
        localStorage.setItem('userProfile', JSON.stringify(userData));
    }
    
    showToast('Foto de perfil eliminada');
    const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
    modal.hide();
});

// ========== CERRAR SESIÓN ==========
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('profileOffcanvas'));
    if (offcanvas) {
        offcanvas.hide();
    }
    setTimeout(() => {
        window.location.href = 'logout.html';
    }, 200);
});

// ========== PRECARGAR DATOS EN MODAL DE EDICIÓN ==========
document.getElementById('editProfileModal').addEventListener('show.bs.modal', function() {
    document.getElementById('editFullName').value = document.getElementById('fullName').textContent;
    document.getElementById('editEmail').value = document.getElementById('email').textContent;
    document.getElementById('editPhone').value = document.getElementById('phone').textContent;
    document.getElementById('editAddress').value = document.getElementById('address').textContent;
    
    const birthdateText = document.getElementById('birthdate').textContent;
    if (birthdateText && birthdateText !== 'No especificada') {
        const parts = birthdateText.split('/');
        if (parts.length === 3) {
            const date = new Date(parts[2], parts[1] - 1, parts[0]);
            if (!isNaN(date.getTime())) {
                document.getElementById('editBirthdate').value = date.toISOString().split('T')[0];
            }
        }
    }
});

// ========== CARGAR PREFERENCIAS GUARDADAS ==========
const savedNotif = localStorage.getItem('notificationPreferences');
if (savedNotif) {
    const notif = JSON.parse(savedNotif);
    document.getElementById('emailNotif').checked = notif.email;
    document.getElementById('pushNotif').checked = notif.push;
    document.getElementById('smsNotif').checked = notif.sms;
}

const savedPrivacy = localStorage.getItem('privacySettings');
if (savedPrivacy) {
    const privacy = JSON.parse(savedPrivacy);
    document.getElementById('twoFactorAuth').checked = privacy.twoFactor;
    document.getElementById('activityLog').checked = privacy.activityLog;
    document.getElementById('dataSharing').checked = privacy.dataSharing;
}

// ========== INICIALIZAR ==========
loadUserData();