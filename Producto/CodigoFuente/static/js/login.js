(function () {
  const form = document.getElementById("loginForm");
  const mailInput = document.getElementById("mailInput");
  const passwordInput = document.getElementById("passwordInput");
  const mailErrorDiv = document.getElementById("mailError");
  const passErrorDiv = document.getElementById("passError");
  const messageContainer = document.getElementById("loginMessage");
  const submitBtn = document.getElementById("submitBtn");
  const createAccountBtn = document.getElementById("createAccountBtn");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const loginRedirectUrl = "home.html";

  const allowedDomains = [
    "gmail.com",
    "hotmail.com",
    "yahoo.com",
    "duoc.cl",
    "outlook.com",
  ];

  function showMessage(msg, type = "danger") {
    messageContainer.innerHTML = `
      <div class="alert alert-${type} alert-custom d-flex align-items-center" role="alert" style="padding: 0.7rem 1rem;">
        <i class="bi bi-${
      type === "success"
        ? "check-circle-fill"
        : type === "danger"
        ? "exclamation-triangle-fill"
        : "info-circle-fill"
    } me-2"></i>
        <div>${msg}</div>
      </div>
    `;
  }

  function clearMessage() {
    messageContainer.innerHTML = "";
  }

  function clearValidationStyles() {
    mailInput.classList.remove("is-invalid", "is-valid");
    passwordInput.classList.remove("is-invalid", "is-valid");
    mailErrorDiv.style.display = "none";
    passErrorDiv.style.display = "none";
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
    if (!mail.includes("@")) {
      return 'El correo debe contener el simbolo "@". Ejemplo: usuario@dominio.com';
    }

    const mailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!mailRegex.test(mail)) {
      return "Formato de correo invalido. Ejemplo: usuario@dominio.com";
    }

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
    const mail = mailInput.value.trim();

    if (!validateEmailFormat(mail)) {
      mailInput.classList.add("is-invalid");
      mailInput.classList.remove("is-valid");
      mailErrorDiv.textContent = getEmailErrorMessage(mail);
      mailErrorDiv.style.display = "block";
      return false;
    }

    mailInput.classList.remove("is-invalid");
    mailInput.classList.add("is-valid");
    mailErrorDiv.style.display = "none";
    return true;
  }

  function validatePasswordOnBlur() {
    const password = passwordInput.value;

    if (!password) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      passErrorDiv.textContent = "Por favor ingresa tu contrasena.";
      passErrorDiv.style.display = "block";
      return false;
    }

    if (!validatePasswordStrength(password)) {
      passwordInput.classList.add("is-invalid");
      passwordInput.classList.remove("is-valid");
      passErrorDiv.textContent =
        "La contrasena debe tener al menos 6 caracteres.";
      passErrorDiv.style.display = "block";
      return false;
    }

    passwordInput.classList.remove("is-invalid");
    passwordInput.classList.add("is-valid");
    passErrorDiv.style.display = "none";
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    const mail = mailInput.value.trim();
    const password = passwordInput.value;
    const isEmailValid = validateEmailOnBlur();
    const isPasswordValid = validatePasswordOnBlur();

    if (!isEmailValid || !isPasswordValid) {
      showMessage(
        "Revisa el correo y la contrasena antes de continuar.",
        "danger",
      );
      return;
    }

    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Ingresando...';
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          email: mail,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showMessage(
          result?.error || "Correo o contrasena incorrectos",
          "danger",
        );
        return;
      }

      const user = result.data || {};
      const firstName = user.first_name || user.firstName || user.nombre ||
        mail.split("@")[0];
      const userData = {
        ...user,
        first_name: firstName,
        mail,
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userEmail", mail);
      localStorage.setItem("userName", firstName);
      sessionStorage.setItem("isLoggedIn", "true");

      showMessage("Inicio de sesion exitoso, redirigiendo...", "success");
      setTimeout(() => {
        window.location.href = loginRedirectUrl;
      }, 800);
    } catch (error) {
      console.error("Error al iniciar sesion:", error);
      showMessage(
        "Error al conectar con el servidor. Intenta nuevamente.",
        "danger",
      );
    } finally {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
  }

  form.addEventListener("submit", handleSubmit);
  mailInput.addEventListener("blur", validateEmailOnBlur);
  passwordInput.addEventListener("blur", validatePasswordOnBlur);

  mailInput.addEventListener("input", () => {
    clearMessage();
    if (mailInput.classList.contains("is-invalid")) {
      mailInput.classList.remove("is-invalid");
      mailErrorDiv.style.display = "none";
    }
  });

  passwordInput.addEventListener("input", () => {
    clearMessage();
    if (passwordInput.classList.contains("is-invalid")) {
      passwordInput.classList.remove("is-invalid");
      passErrorDiv.style.display = "none";
    }
  });

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", (event) => {
      event.preventDefault();
      clearMessage();
      clearValidationStyles();
      window.location.href = "register.html";
    });
  }

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showMessage(
        "Funcionalidad de Google en desarrollo. Proximamente disponible.",
        "info",
      );
    });
  }
})();
