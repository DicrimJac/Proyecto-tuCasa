
        function soloNumeros(input) {
            input.value = input.value.replace(/[^0-9]/g, '');
        }

        function validar(input) {
            const error = input.parentElement.querySelector(".error");
            let valido = true;

            if (input.value.trim() === "") {
                if (error) error.textContent = "Campo obligatorio";
                valido = false;
            }

            else if (input.id === "telefono") {
                if (!validarTelefono(input.value)) {
                    if (error) error.textContent = "Teléfono inválido";
                    valido = false;
                }
            }

            else if (input.id === "rut") {
                const dv = document.getElementById("dv").value;

                if (!validarRut(input.value, dv)) {
                    if (error) error.textContent = "RUT inválido";
                    valido = false;
                }
            }

            if (valido) {
                if (error) error.textContent = "";
                input.classList.add("valid");
                input.classList.remove("invalid");
            } else {
                input.classList.add("invalid");
                input.classList.remove("valid");
            }

            return valido;
        }

        function validarTodo() {
            let valido = true;

            document.querySelectorAll("input[required], select[required]").forEach(el => {
                if (!validar(el)) {
                    valido = false;
                }
            });

            document.getElementById("btn").disabled = !valido;
        }

        function validarTelefono(valor) {
            return /^[0-9]{8,9}$/.test(valor);
        }

        function validarRut(rut, dv) {
            if (!/^[0-9]+$/.test(rut)) return false;

            let suma = 0;
            let multiplo = 2;

            for (let i = rut.length - 1; i >= 0; i--) {
                suma += parseInt(rut[i]) * multiplo;
                multiplo = multiplo < 7 ? multiplo + 1 : 2;
            }

            let dvEsperado = 11 - (suma % 11);

            if (dvEsperado === 11) dvEsperado = "0";
            else if (dvEsperado === 10) dvEsperado = "k";
            else dvEsperado = dvEsperado.toString();

            return dvEsperado === dv.toLowerCase();
        }

        document.querySelectorAll("input, select").forEach(el => {
            el.addEventListener("input", () => {
                if (el.id === "telefono" || el.id === "rut") {
                    soloNumeros(el);
                }

                validar(el);
                validarTodo();
            });
        });

        document.querySelectorAll(".toggle").forEach(btn => {
            btn.addEventListener("click", () => {
                const input = btn.parentElement.querySelector("input");
                input.type = input.type === "password" ? "text" : "password";
            });
        });

        document.querySelectorAll("select").forEach(select => {
            select.addEventListener("change", () => {
                if (select.value !== "") {
                    select.classList.add("valid");
                } else {
                    select.classList.remove("valid");
                }
            });
        });

        document.getElementById("dv").addEventListener("input", () => {
            const rut = document.getElementById("rut");
            validar(rut);
            validarTodo();
        });

        document.getElementById("btn").addEventListener("click", () => {
            validarTodo();
        });

