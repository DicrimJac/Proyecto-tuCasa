// ========== SOLICITAR ARRIENDO - DATOS DE PROPIEDAD ==========
const DEFAULT_PROPERTY_IMAGE = "assets/image/casa1.png";
let propertyData = null;
let applicantData = null;

function getStoredJson(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error(`Error leyendo ${key}:`, error);
        return null;
    }
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .trim()
        .toLowerCase();
}

function isPropertyPublic(rawProperty) {
    const stateNumber = rawProperty?.state_nbr ?? rawProperty?.status_nbr ?? rawProperty?.raw?.state_nbr;
    const stateText = normalizeText(rawProperty?.state_desc || rawProperty?.status_desc || rawProperty?.estado || rawProperty?.status || rawProperty?.raw?.state_desc);

    if (Number(stateNumber) === 0) return false;
    if (["no disponible", "inactiva", "inactivo", "inactive", "disabled", "deshabilitada", "deshabilitado", "vendida", "vendido"].includes(stateText)) {
        return false;
    }

    return true;
}

function getPropertyLocation(rawProperty) {
    const address = rawProperty.direccion || rawProperty.address || rawProperty.raw?.direccion || {};
    const parts = [
        rawProperty.location,
        rawProperty.ubicacion,
        address.street && address.number ? `${address.street} ${address.number}` : "",
        address.comuna,
        address.city,
        address.state,
    ].filter(Boolean);

    return [...new Set(parts)].join(", ") || "Sin ubicacion";
}

function getCachedPropertyImage(propertyId) {
    try {
        const cache = JSON.parse(localStorage.getItem("propertyImageCache") || "{}");
        return cache[propertyId] || "";
    } catch (error) {
        console.error("Error leyendo cache de imagenes:", error);
        return "";
    }
}

function getOperationType(rawProperty) {
    const operation = rawProperty.operationType
        || rawProperty.operation_desc
        || rawProperty.operation
        || rawProperty.type_operation
        || rawProperty.type
        || "arriendo";

    return normalizeText(operation).includes("venta") ? "Venta" : "Arriendo";
}

function getPropertyFromStorage() {
    try {
        return JSON.parse(localStorage.getItem("selectedProperty") || "null");
    } catch (error) {
        console.error("Error leyendo propiedad seleccionada:", error);
        return null;
    }
}

function getPropertyImage(rawProperty, propertyId) {
    const photos = rawProperty.fotos || rawProperty.photos || rawProperty.imagenes || rawProperty.raw?.fotos || [];
    return photos[0]?.url_foto
        || photos[0]?.url
        || rawProperty.url_foto
        || rawProperty.image
        || rawProperty.imagen
        || getCachedPropertyImage(propertyId)
        || DEFAULT_PROPERTY_IMAGE;
}

function propertyMatchesId(savedProperty, propertyId) {
    return savedProperty
        && (String(savedProperty.id) === String(propertyId)
            || String(savedProperty.id_propi) === String(propertyId)
            || String(savedProperty.raw?.id_propi) === String(propertyId));
}

function getCurrentUserFromStorage() {
    return getStoredJson("userData") || getStoredJson("userProfile") || null;
}

function getUserId(user) {
    return user?.id_usuario || user?.id || user?.id_user || user?.user_id || "";
}

function getUserEmail(user) {
    return String(user?.mail || user?.email || user?.correo || localStorage.getItem("userEmail") || "")
        .trim()
        .toLowerCase();
}

function buildFullName(user) {
    const names = [
        user?.first_name,
        user?.second_name,
        user?.first_last_name,
        user?.second_last_name,
    ].filter(Boolean);

    return names.join(" ") || user?.fullName || user?.name || user?.nombre || localStorage.getItem("userName") || "";
}

function formatRutValue(user) {
    const rut = user?.rut ?? user?.run ?? "";
    const rawRut = String(rut || "").trim();

    if (rawRut.includes("-")) {
        return rawRut;
    }

    const digits = rawRut.replace(/\D/g, "");
    const dv = String(user?.rut_dv ?? user?.rutDv ?? "").trim().toUpperCase();

    if (!digits || !dv) {
        return rawRut;
    }

    return `${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}

function formatPhoneValue(user) {
    const rawPhone = user?.fono ?? user?.phone ?? user?.telefono ?? "";
    const digits = String(rawPhone || "").replace(/\D/g, "");

    if (digits.startsWith("56") && digits.length > 9) {
        return digits.slice(-9);
    }

    return digits;
}

function persistApplicantData(user) {
    if (!user) return null;

    const currentUser = getCurrentUserFromStorage() || {};
    const mergedUser = { ...currentUser, ...user };
    localStorage.setItem("userData", JSON.stringify(mergedUser));
    localStorage.setItem("userProfile", JSON.stringify(mergedUser));
    localStorage.setItem("userEmail", mergedUser.mail || mergedUser.email || localStorage.getItem("userEmail") || "");
    localStorage.setItem("userName", buildFullName(mergedUser));

    return mergedUser;
}

async function resolveApplicantData() {
    const storedUser = getCurrentUserFromStorage();
    applicantData = storedUser;

    try {
        const response = await fetch("/api/users/me", {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (response.ok && result.success && result.data) {
            applicantData = persistApplicantData(result.data);
        }
    } catch (error) {
        console.error("Error cargando datos del solicitante:", error);
    }

    const userId = getUserId(storedUser);
    if (userId && applicantData === storedUser) {
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
                method: "GET",
                credentials: "include",
            });
            const result = await response.json();

            if (response.ok && result.success && result.data) {
                applicantData = persistApplicantData(result.data);
            }
        } catch (error) {
            console.error("Error cargando datos del solicitante por ID:", error);
        }
    }

    const userEmail = getUserEmail(applicantData || storedUser);
    if (!userEmail || applicantData !== storedUser) return;

    try {
        const response = await fetch(`/api/users/email/${encodeURIComponent(userEmail)}`, {
            method: "GET",
            credentials: "include",
        });
        const result = await response.json();

        if (response.ok && result.success && result.data) {
            applicantData = persistApplicantData(result.data);
        }
    } catch (error) {
        console.error("Error cargando datos del solicitante por correo:", error);
    }
}

function setInputValue(id, value) {
    const input = document.getElementById(id);
    const normalizedValue = String(value || "").trim();

    if (!input || !normalizedValue || input.value.trim()) return;
    input.value = normalizedValue;
}

function prefillApplicantForm() {
    if (!applicantData) return;

    setInputValue("fullName", buildFullName(applicantData));
    setInputValue("rut", formatRutValue(applicantData));
    setInputValue("email", getUserEmail(applicantData));
    setInputValue("phone", formatPhoneValue(applicantData));
}

function normalizeProperty(rawProperty) {
    const characteristic = rawProperty.caracteristica || rawProperty.characteristic || rawProperty.raw?.caracteristica || {};
    const id = rawProperty.id_propi || rawProperty.id || rawProperty.property_id || rawProperty.raw?.id_propi || "";
    const price = Number(characteristic.price ?? rawProperty.price ?? rawProperty.precio ?? 0);
    const operationType = getOperationType(rawProperty);

    return {
        id,
        title: rawProperty.title || rawProperty.titulo || rawProperty.name || rawProperty.type_desc || rawProperty.raw?.type_desc || "Propiedad",
        location: getPropertyLocation(rawProperty),
        price,
        operationType,
        rooms: Number(characteristic.qty_room ?? rawProperty.rooms ?? rawProperty.bedrooms ?? rawProperty.habitaciones ?? 0),
        bathrooms: Number(characteristic.qty_bath ?? rawProperty.bathrooms ?? rawProperty.banos ?? 0),
        parking: Number(characteristic.h_parkin ? 1 : (rawProperty.parking ?? rawProperty.parkingSpaces ?? 0)),
        area: Number(characteristic.total_mtr ?? rawProperty.area ?? rawProperty.propertyArea ?? 0),
        image: getPropertyImage(rawProperty, id),
        status: isPropertyPublic(rawProperty) ? "disponible" : "no disponible",
    };
}

function setRequestFormAvailability(isAvailable) {
    const form = document.getElementById("requestForm");
    const submitBtn = form?.querySelector(".btn-submit");
    if (!form || !submitBtn) return;

    submitBtn.disabled = !isAvailable;
    if (!isAvailable) {
        submitBtn.innerHTML = '<i class="fas fa-ban"></i> Propiedad no disponible';
    }
}

async function resolvePropertyData() {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("id");
    const savedProperty = getPropertyFromStorage();

    if (propertyId) {
        try {
            const response = await fetch(`/api/properties/${encodeURIComponent(propertyId)}?public=true`, {
                method: "GET",
                credentials: "include",
            });
            const result = await response.json();

            if (response.ok && result.success) {
                propertyData = normalizeProperty(result.data);
                localStorage.setItem("selectedProperty", JSON.stringify(result.data));
                return;
            }
        } catch (error) {
            console.error("Error cargando propiedad para solicitud:", error);
        }
    }

    if (savedProperty && (!propertyId || propertyMatchesId(savedProperty, propertyId))) {
        propertyData = normalizeProperty(savedProperty);
    }
}

// ========== CARGAR DATOS DE PROPIEDAD ==========
function loadPropertyData() {
    if (!propertyData) {
        document.getElementById('propertyTitle').textContent = 'No se encontro la propiedad';
        document.getElementById('propertyLocation').textContent = 'Vuelve al buscador y selecciona una propiedad.';
        document.getElementById('propertyStatus').textContent = 'No disponible';
        document.getElementById('propertyStatus').classList.add('unavailable');
        setRequestFormAvailability(false);
        showToast('No se encontro la propiedad seleccionada', true);
        return;
    }

    const imageElement = document.getElementById('propertyImage');
    imageElement.onerror = () => {
        imageElement.src = DEFAULT_PROPERTY_IMAGE;
    };
    imageElement.src = propertyData.image;
    document.getElementById('propertyTitle').textContent = propertyData.title;
    document.getElementById('propertyLocation').textContent = propertyData.location;
    document.getElementById('propertyPrice').textContent = propertyData.price
        ? `$${propertyData.price.toLocaleString()}`
        : 'Precio no disponible';
    document.getElementById('propertyRooms').textContent = propertyData.rooms;
    document.getElementById('propertyBathrooms').textContent = propertyData.bathrooms;
    document.getElementById('propertyParking').textContent = propertyData.parking;
    document.getElementById('propertyArea').textContent = propertyData.area;

    const pricePeriod = document.querySelector('.price-period');
    if (pricePeriod) {
        pricePeriod.style.display = propertyData.operationType === 'Arriendo' && propertyData.price ? '' : 'none';
    }
    
    const statusElement = document.getElementById('propertyStatus');
    if (propertyData.status === 'disponible') {
        statusElement.textContent = 'Disponible';
        statusElement.classList.remove('unavailable');
    } else {
        statusElement.textContent = 'No disponible';
        statusElement.classList.add('unavailable');
    }

    setRequestFormAvailability(propertyData.status === 'disponible');
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

function getEmploymentNumber(value) {
    const map = {
        dependiente: 1,
        independiente: 2,
        estudiante: 3,
        jubilado: 4,
        cesante: 5,
    };

    return map[value] || 0;
}

function buildRequestMessage(formData) {
    const details = [
        `Fecha de inicio deseada: ${formData.startDate}`,
        `Nombre: ${formData.fullName}`,
        `RUT: ${formData.rut}`,
        `Correo: ${formData.email}`,
        `Telefono: ${formData.phone}`,
    ];

    if (formData.message) {
        details.push(`Mensaje: ${formData.message}`);
    }

    return details.join("\n");
}

// ========== ENVIAR SOLICITUD ==========
async function submitRequest(formData) {
    if (!propertyData?.id) {
        throw new Error("No se encontro la propiedad seleccionada");
    }

    const payload = {
        id_propi: Number(propertyData.id),
        contract_time: Number(formData.duration),
        qty_person: Number(formData.occupants),
        work_situation_key: formData.employment,
        work_situation_nbr: getEmploymentNumber(formData.employment),
        work_situation_desc: formData.employmentText,
        income: Number(formData.income),
        message: buildRequestMessage(formData),
    };

    const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
    });

    let result = null;
    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok || !result?.success) {
        const message = response.status === 401
            ? "Debes iniciar sesion para enviar una solicitud"
            : result?.message || result?.error || "Error al enviar la solicitud";
        throw new Error(message);
    }

    return result.data;
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
document.addEventListener('DOMContentLoaded', async function() {
    await Promise.all([
        resolvePropertyData(),
        resolveApplicantData(),
    ]);
    loadPropertyData();
    prefillApplicantForm();
    
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
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const rut = document.getElementById('rut').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const startDate = document.getElementById('startDate').value;
        const duration = document.getElementById('duration').value;
        const occupants = document.getElementById('occupants').value;
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
            duration,
            occupants,
            employment,
            employmentText: document.getElementById('employment').options[document.getElementById('employment').selectedIndex]?.text,
            income,
            message
        };
        
        // Simular envío
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            const createdRequest = await submitRequest(formData);
            if (createdRequest) {
                const emailDelivery = createdRequest.notificationEmailDelivery;
                if (emailDelivery?.success === false) {
                    console.warn("Solicitud guardada, pero el correo no fue enviado:", emailDelivery);
                    showToast(
                        'La solicitud fue guardada, pero no se pudo enviar el correo al propietario.',
                        true
                    );
                } else {
                    showToast('¡Solicitud y correo enviados correctamente!');
                }
                form.reset();
                prefillApplicantForm();
            } else {
                showToast('Error al enviar la solicitud. Intenta nuevamente.', true);
            }
        } catch (error) {
            showToast(error.message || 'Error al enviar la solicitud. Intenta nuevamente.', true);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            if (propertyData?.status !== 'disponible') {
                setRequestFormAvailability(false);
            }
        }
    });
});
