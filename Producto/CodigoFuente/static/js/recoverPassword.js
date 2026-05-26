let currentStep = 1;
let userEmail = "";
let verificationCode = "";
let timerInterval = null;

const allowedDomains = ["gmail.com", "hotmail.com", "yahoo.com", "duoc.cl", "outlook.com"];

const step1Content = document.getElementById("step1Content");
const step2Content = document.getElementById("step2Content");
const step3Content = document.getElementById("step3Content");
const messageContainer = document.getElementById("messageContainer");
const recoveryEmail = document.getElementById("recoveryEmail");
const emailErrorDiv = document.getElementById("emailError");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const newPassError = document.getElementById("newPassError");
const confirmError = document.getElementById("confirmError");

function showMessage(msg, type = "danger") {
    messageContainer.innerHTML = `
        <div class="alert alert-${type} alert-custom d-flex align-items-center" role="alert">
            <i class="bi bi-${type === "success" ? "check-circle-fill" : "exclamation-triangle-fill"} me-2"></i>
            <div>${msg}</div>
        </div>
    `;
}

function clearMessage() {
    messageContainer.innerHTML = "";
}

async function requestResetCode(email) {
    const response = await fetch("/api/users/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result?.error || result?.message || "No se pudo enviar el codigo");
    }

    return result;
}

async function confirmPasswordReset(email, code, newPasswordValue) {
    const response = await fetch("/api/users/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: newPasswordValue }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result?.error || result?.message || "No se pudo actualizar la contrasena");
    }

    return result;
}

function validateEmailFormat(mail) {
    if (!mail || !mail.includes("@")) return false;

    const mailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!mailRegex.test(mail)) return false;

    const domain = mail.split("@")[1].toLowerCase();
    return allowedDomains.includes(domain);
}

function getEmailErrorMessage(mail) {
    if (!mail) return "Por favor ingresa un correo electronico.";
    if (!mail.includes("@")) return 'El correo debe contener el simbolo "@". Ejemplo: usuario@dominio.com';

    const mailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!mailRegex.test(mail)) return "Formato de correo invalido. Ejemplo: usuario@dominio.com";

    const domain = mail.split("@")[1]?.toLowerCase();
    if (domain && !allowedDomains.includes(domain)) {
        return `Dominio no permitido. Usa: ${allowedDomains.join(", ")}`;
    }

    return "Por favor ingresa un correo electronico valido.";
}

function validatePasswordStrength(pass) {
    return Boolean(pass && pass.length >= 6);
}

function validateEmailOnBlur() {
    const email = recoveryEmail.value.trim();

    if (!validateEmailFormat(email)) {
        recoveryEmail.classList.add("is-invalid");
        recoveryEmail.classList.remove("is-valid");
        emailErrorDiv.textContent = getEmailErrorMessage(email);
        emailErrorDiv.style.display = "block";
        return;
    }

    recoveryEmail.classList.remove("is-invalid");
    recoveryEmail.classList.add("is-valid");
    emailErrorDiv.style.display = "none";
}

function validateNewPasswordOnBlur() {
    const password = newPassword.value;

    if (!validatePasswordStrength(password)) {
        newPassword.classList.add("is-invalid");
        newPassword.classList.remove("is-valid");
        newPassError.textContent = password
            ? "La contrasena debe tener al menos 6 caracteres."
            : "Por favor ingresa tu nueva contrasena.";
        newPassError.style.display = "block";
    } else {
        newPassword.classList.remove("is-invalid");
        newPassword.classList.add("is-valid");
        newPassError.style.display = "none";
    }

    if (confirmPassword.value) validateConfirmPassword();
}

function validateConfirmPassword() {
    const isValid = confirmPassword.value && newPassword.value === confirmPassword.value;
    confirmPassword.classList.toggle("is-invalid", !isValid);
    confirmPassword.classList.toggle("is-valid", Boolean(isValid));
    confirmError.style.display = isValid ? "none" : "block";
}

function updateSteps() {
    document.querySelectorAll(".step").forEach((step, index) => {
        step.classList.remove("active", "completed");
        if (index + 1 < currentStep) step.classList.add("completed");
        if (index + 1 === currentStep) step.classList.add("active");
    });
}

function goToStep(step) {
    currentStep = step;
    step1Content.style.display = step === 1 ? "block" : "none";
    step2Content.style.display = step === 2 ? "block" : "none";
    step3Content.style.display = step === 3 ? "block" : "none";
    updateSteps();
    clearMessage();
}

function startTimer() {
    let seconds = 30;
    const timerSpan = document.getElementById("timer");
    const resendLink = document.getElementById("resendCode");

    resendLink.style.pointerEvents = "none";
    resendLink.style.opacity = "0.5";
    timerSpan.textContent = `(${seconds}s)`;

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        seconds--;
        timerSpan.textContent = `(${seconds}s)`;

        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerSpan.textContent = "";
            resendLink.style.pointerEvents = "auto";
            resendLink.style.opacity = "1";
        }
    }, 1000);
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return Math.min(strength, 4);
}

function getEnteredCode() {
    return Array.from(document.querySelectorAll(".code-input"))
        .map((input) => input.value)
        .join("");
}

function initStep1() {
    recoveryEmail.addEventListener("blur", validateEmailOnBlur);
    recoveryEmail.addEventListener("input", () => {
        clearMessage();
        if (recoveryEmail.classList.contains("is-invalid")) {
            recoveryEmail.classList.remove("is-invalid");
            emailErrorDiv.style.display = "none";
        }
    });

    document.getElementById("emailForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        clearMessage();

        const email = recoveryEmail.value.trim().toLowerCase();
        validateEmailOnBlur();

        if (!validateEmailFormat(email)) {
            showMessage(getEmailErrorMessage(email), "danger");
            return;
        }

        const sendCodeBtn = document.getElementById("sendCodeBtn");
        const originalText = sendCodeBtn.innerHTML;
        sendCodeBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Enviando...';
        sendCodeBtn.disabled = true;

        try {
            const result = await requestResetCode(email);
            userEmail = email;
            verificationCode = result.devResetCode || "";
            document.getElementById("emailDisplay").innerText = email;

            const devMessage = result.devResetCode
                ? `<br><small>Modo desarrollo: codigo ${result.devResetCode}</small>`
                : "";
            goToStep(2);
            showMessage(`Hemos enviado un codigo de verificacion de 4 digitos a ${email}${devMessage}`, "success");
            startTimer();
        } catch (error) {
            showMessage(error.message || "No se pudo enviar el codigo", "danger");
        } finally {
            sendCodeBtn.innerHTML = originalText;
            sendCodeBtn.disabled = false;
        }
    });
}

function initStep2() {
    const codeInputs = document.querySelectorAll(".code-input");

    codeInputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
            if (e.target.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            document.getElementById("codeError").style.display = "none";
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !e.target.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    document.getElementById("codeForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const code = getEnteredCode();

        if (code.length !== 4) {
            document.getElementById("codeError").style.display = "block";
            return;
        }

        verificationCode = code;
        goToStep(3);
    });

    document.getElementById("resendCode").addEventListener("click", async (e) => {
        e.preventDefault();

        try {
            const result = await requestResetCode(userEmail);
            verificationCode = result.devResetCode || "";
            const devMessage = result.devResetCode ? ` Modo desarrollo: codigo ${result.devResetCode}` : "";
            startTimer();
            showMessage(`Se ha enviado un nuevo codigo de 4 digitos a tu email.${devMessage}`, "success");
        } catch (error) {
            showMessage(error.message || "No se pudo reenviar el codigo", "danger");
        }
    });
}

function initStep3() {
    newPassword.addEventListener("input", (e) => {
        const password = e.target.value;
        const strength = checkPasswordStrength(password);
        const strengthBar = document.getElementById("strengthBar");
        const strengthText = document.getElementById("strengthText");
        const colors = ["#dc3545", "#ffc107", "#17a2b8", "#28a745"];
        const texts = ["Muy debil", "Debil", "Buena", "Fuerte"];

        if (!password) {
            strengthBar.style.width = "0%";
            strengthText.textContent = "";
        } else {
            strengthBar.style.width = `${(strength + 1) * 20}%`;
            strengthBar.style.backgroundColor = colors[strength];
            strengthText.textContent = texts[strength];
        }

        if (newPassword.classList.contains("is-invalid")) {
            newPassword.classList.remove("is-invalid");
            newPassError.style.display = "none";
        }

        if (confirmPassword.value) validateConfirmPassword();
    });

    newPassword.addEventListener("blur", validateNewPasswordOnBlur);
    confirmPassword.addEventListener("blur", validateConfirmPassword);
    confirmPassword.addEventListener("input", validateConfirmPassword);

    document.getElementById("passwordForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const newPass = newPassword.value;
        const confirmPass = confirmPassword.value;

        validateNewPasswordOnBlur();
        validateConfirmPassword();

        if (!validatePasswordStrength(newPass)) {
            showMessage("La contrasena debe tener al menos 6 caracteres", "danger");
            return;
        }

        if (newPass !== confirmPass) {
            showMessage("Las contrasenas no coinciden", "danger");
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Actualizando...';
        submitBtn.disabled = true;

        try {
            await confirmPasswordReset(userEmail, verificationCode, newPass);
            showMessage("Contrasena actualizada correctamente. Redirigiendo...", "success");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } catch (error) {
            showMessage(error.message || "No se pudo actualizar la contrasena", "danger");
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function init() {
    initStep1();
    initStep2();
    initStep3();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
