function getStoredJson(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error leyendo ${key}:`, error);
        return null;
    }
}

function getCurrentUser() {
    return getStoredJson("userData") || getStoredJson("userProfile") || null;
}

function valueOrFallback(value, fallback = "No registrado") {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
}

function buildFullName(user) {
    const names = [
        user.first_name,
        user.second_name,
        user.first_last_name,
        user.second_last_name,
    ].filter(Boolean);

    if (names.length > 0) return names.join(" ");

    return user.fullName || user.name || user.nombre || user.userName ||
        localStorage.getItem("userName") || "Usuario";
}

function getEmail(user) {
    return user.mail || user.email || user.correo ||
        localStorage.getItem("userEmail") || "Sin correo registrado";
}

function formatPhone(user) {
    const rawPhone = user.fono || user.phone || user.telefono;
    if (!rawPhone) return "No registrado";

    const digits = String(rawPhone).replace(/\D/g, "");
    if (digits.startsWith("56") && digits.length >= 11) {
        return `+${digits.slice(0, 2)} ${digits.slice(2, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
    }
    if (digits.length === 9) {
        return `+56 ${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 8) {
        return `+56 ${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return String(rawPhone);
}

function formatDate(value) {
    if (!value) return "No registrada";

    if (typeof value === "string") {
        const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoDate) {
            return `${isoDate[3]}-${isoDate[2]}-${isoDate[1]}`;
        }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function avatarUrl(name, avatar) {
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?background=2C5A6E&color=fff&rounded=true&size=120&bold=true&name=${encodeURIComponent(name)}`;
}

function splitFullName(fullName, currentUser) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return {
            first_name: currentUser.first_name || "",
            second_name: currentUser.second_name || "",
            first_last_name: currentUser.first_last_name || "",
            second_last_name: currentUser.second_last_name || "",
        };
    }

    if (parts.length === 1) {
        return {
            first_name: parts[0],
            second_name: "",
            first_last_name: "",
            second_last_name: "",
        };
    }

    if (parts.length === 2) {
        return {
            first_name: parts[0],
            second_name: "",
            first_last_name: parts[1],
            second_last_name: "",
        };
    }

    if (parts.length === 3) {
        return {
            first_name: parts[0],
            second_name: "",
            first_last_name: parts[1],
            second_last_name: parts[2],
        };
    }

    return {
        first_name: parts[0],
        second_name: parts.slice(1, -2).join(" "),
        first_last_name: parts[parts.length - 2],
        second_last_name: parts[parts.length - 1],
    };
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function updateProfileDisplay(user) {
    const fullName = buildFullName(user);
    const email = getEmail(user);
    const phone = formatPhone(user);
    const birthdate = formatDate(user.date_birth || user.birthDate || user.birthdate);
    const address = valueOrFallback(user.address || user.direccion);
    const avatar = avatarUrl(fullName, user.avatar || user.picture);

    setText("userNameDisplay", fullName);
    setText("userEmailDisplay", email);
    setText("fullName", fullName);
    setText("email", email);
    setText("phone", phone);
    setText("birthdate", birthdate);
    setText("address", address);

    const badge = document.querySelector(".badge-member");
    if (badge) {
        const createdAt = user.created_at || user.createdAt || user.fecha_creacion;
        const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
        badge.innerHTML = `<i class="bi bi-calendar-check me-1"></i> Miembro desde ${Number.isNaN(year) ? new Date().getFullYear() : year}`;
    }

    const avatarImg = document.getElementById("avatarImg");
    const avatarPreview = document.getElementById("avatarPreview");
    if (avatarImg) avatarImg.src = avatar;
    if (avatarPreview) avatarPreview.src = avatar;
}

function requireSession() {
    const user = getCurrentUser();
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

    if (!user && !isLoggedIn) {
        window.location.href = "login.html";
        return null;
    }

    return user || {
        first_name: localStorage.getItem("userName"),
        mail: localStorage.getItem("userEmail"),
    };
}

function showToast(message, isError = false) {
    const toast = document.getElementById("notificationToast");
    const toastMessage = document.getElementById("toastMessage");
    const toastHeader = toast?.querySelector(".toast-header");

    if (!toast || !toastMessage) {
        if (isError) console.error(message);
        return;
    }

    toastMessage.textContent = message;
    toast.style.borderLeftColor = isError ? "#dc3545" : "#2C5A6E";

    if (toastHeader) {
        const icon = toastHeader.querySelector("i");
        const title = toastHeader.querySelector("strong");
        if (icon) {
            icon.className = isError ? "bi bi-exclamation-triangle-fill" : "bi bi-check-circle-fill";
            icon.style.color = isError ? "#dc3545" : "#2C5A6E";
        }
        if (title) title.textContent = isError ? "Error" : "Exito";
    }

    toast.style.display = "block";
    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

function clearSessionData() {
    [
        "userData",
        "userProfile",
        "userEmail",
        "userName",
        "user_last_register",
    ].forEach((key) => localStorage.removeItem(key));

    sessionStorage.removeItem("isLoggedIn");
}

async function logout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.style.pointerEvents = "none";

    try {
        await fetch("/api/users/logout", {
            method: "POST",
            credentials: "same-origin",
        });
    } catch (error) {
        console.error("Error cerrando sesion en backend:", error);
    } finally {
        clearSessionData();
        window.location.href = "home.html";
    }
}

function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        // En lugar de cerrar sesión directamente desde el perfil,
        // redirigimos a logout.html, donde está toda la lógica de confirmación
        // y cierre de sesión (js/logout.js).
        logoutBtn.addEventListener("click", () => {
            window.location.href = "logout.html";
        });
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll(".nav-link[data-section]");
    const sections = document.querySelectorAll(".panel-section");

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            const sectionName = link.dataset.section;

            navLinks.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");

            sections.forEach((section) => section.classList.remove("active"));
            document.getElementById(`${sectionName}-section`)?.classList.add("active");
        });
    });
}

function initEmptyDashboard() {
    setText("totalProperties", "0");
    setText("totalMessages", "0");
    setText("unreadBadge", "0");

    const emptyBlocks = {
        propertiesGrid: "No tienes propiedades publicadas.",
        allPropertiesGrid: "No tienes propiedades publicadas.",
        favoritesGrid: "No tienes propiedades favoritas.",
        messagesList: "No tienes mensajes.",
    };

    Object.entries(emptyBlocks).forEach(([id, message]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = `<div class="col-12 text-center text-muted py-5">${message}</div>`;
        }
    });
}

function initEditProfile(user) {
    const editProfileModal = document.getElementById("editProfileModal");
    const editProfileForm = document.getElementById("editProfileForm");
    let currentUser = { ...user };

    if (editProfileModal) {
        editProfileModal.addEventListener("show.bs.modal", () => {
            const fullName = buildFullName(currentUser);
            document.getElementById("editFullName").value = fullName;
            document.getElementById("editEmail").value = getEmail(currentUser);
            document.getElementById("editPhone").value = valueOrFallback(currentUser.fono || currentUser.phone || "", "");
            document.getElementById("editBirthdate").value = (currentUser.date_birth || "").toString().slice(0, 10);
            document.getElementById("editAddress").value = valueOrFallback(currentUser.address || currentUser.direccion || "", "");
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitButton = editProfileForm.querySelector('button[type="submit"]');
            const originalText = submitButton?.innerHTML;
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = "Guardando...";
            }

            const nameFields = splitFullName(document.getElementById("editFullName").value, currentUser);
            const currentEmail = getEmail(currentUser);
            const address = document.getElementById("editAddress").value.trim();
            const payload = {
                ...nameFields,
                mail: document.getElementById("editEmail").value.trim(),
                fono: document.getElementById("editPhone").value.trim(),
                date_birth: document.getElementById("editBirthdate").value,
            };

            try {
                const response = await fetch(`/api/users/${encodeURIComponent(currentEmail)}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "same-origin",
                    body: JSON.stringify(payload),
                });

                const result = await response.json().catch(() => null);

                if (!response.ok || !result?.success) {
                    showToast(result?.error || result?.message || "No se pudo actualizar el perfil", true);
                    return;
                }

                currentUser = {
                    ...currentUser,
                    ...result.data,
                    date_birth: result.data?.date_birth || payload.date_birth,
                    birthDate: result.data?.date_birth || payload.date_birth,
                    birthdate: result.data?.date_birth || payload.date_birth,
                    address,
                };

                localStorage.setItem("userData", JSON.stringify(currentUser));
                localStorage.setItem("userEmail", getEmail(currentUser));
                localStorage.setItem("userName", currentUser.first_name || buildFullName(currentUser));
                updateProfileDisplay(currentUser);
                showToast("Perfil actualizado correctamente");

                bootstrap.Modal.getInstance(document.getElementById("editProfileModal"))?.hide();
            } catch (error) {
                console.error("Error actualizando perfil:", error);
                showToast("Error al conectar con el servidor", true);
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }
            }
        });
    }
}

function initPasswordChange(user) {
    const passwordChangeForm = document.getElementById("passwordChangeForm");
    if (!passwordChangeForm) return;

    let currentUser = { ...user };

    passwordChangeForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPass").value;
        const confirmPassword = document.getElementById("confirmNewPass").value;

        if (newPassword !== confirmPassword) {
            showToast("Las contraseñas nuevas no coinciden", true);
            return;
        }

        if (newPassword.length < 6) {
            showToast("La nueva contraseña debe tener al menos 6 caracteres", true);
            return;
        }

        const submitButton = passwordChangeForm.querySelector('button[type="submit"]');
        const originalText = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = "Actualizando...";
        }

        try {
            const response = await fetch(`/api/users/${encodeURIComponent(getEmail(currentUser))}/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                showToast(result?.error || result?.message || "No se pudo actualizar la contraseña", true);
                return;
            }

            currentUser = {
                ...currentUser,
                ...result.data,
            };
            localStorage.setItem("userData", JSON.stringify(currentUser));
            passwordChangeForm.reset();
            showToast("Contraseña actualizada correctamente");
            bootstrap.Modal.getInstance(document.getElementById("passwordModal"))?.hide();
        } catch (error) {
            console.error("Error cambiando contraseÃ±a:", error);
            showToast("Error al conectar con el servidor", true);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const user = requireSession();
    if (!user) return;

    updateProfileDisplay(user);
    initNavigation();
    initEmptyDashboard();
    initEditProfile(user);
    initPasswordChange(user);
    initLogout();
});
