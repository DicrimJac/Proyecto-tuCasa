export class EmailService {
  constructor() {
    const defaultApiUrl = "http://chokitaapi.dev:3000/api/send";
    const configuredApiUrl = Deno.env.get("EMAIL_API_URL") || "";
    this.apiUrl = configuredApiUrl.includes("resend.com")
      ? defaultApiUrl
      : configuredApiUrl || defaultApiUrl;
    this.apiToken = Deno.env.get("EMAIL_API_TOKEN") ||
      Deno.env.get("SMTP_LOCAL_SECRET") ||
      "smtp-local-secret";
    const configuredTimeout = Number(Deno.env.get("EMAIL_API_TIMEOUT_MS"));
    this.timeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : 10000;
    this.enabled = Boolean(this.apiUrl && this.apiToken);
  }

  normalizeRecipients(to) {
    return Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  }

  async sendEmail({ to, subject, html, attachments = [] }) {
    const recipients = this.normalizeRecipients(to);
    if (!recipients.length) {
      return { success: false, skipped: true };
    }

    if (!this.enabled) {
      console.log(`[DEV] Correo para ${recipients.join(", ")}: ${subject}`);
      return { success: true, devMode: true };
    }

    console.log(`[EmailService] Enviando correo via ${this.apiUrl}`);

    let response;
    try {
      response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: recipients.length === 1 ? recipients[0] : recipients,
          subject,
          html,
          attachments,
        }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        throw new Error(
          `La API de correo no respondio en ${this.timeoutMs} ms`,
        );
      }
      throw new Error(`No se pudo conectar con la API de correo: ${error.message}`);
    }

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        result?.message || result?.error || "No se pudo enviar el correo",
      );
    }

    return { success: true, data: result };
  }

  async sendPasswordResetCode(to, code) {
    return await this.sendEmail({
      to,
      subject: "Codigo de recuperacion - Tu Casa",
      html: `
        <div style="font-family:Arial,sans-serif;color:#1F3B4C;line-height:1.5">
          <h2>Recuperacion de contrasena</h2>
          <p>Usa este codigo para cambiar la contrasena de tu cuenta Tu Casa:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:24px 0">${code}</p>
          <p>Este codigo vence en 10 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        </div>
      `,
    });
  }

  escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character]);
  }

  formatMoney(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0
      ? `$${Math.round(amount).toLocaleString("es-CL")}`
      : "Precio no informado";
  }

  getPropertyAddress(property = {}) {
    const address = property.direccion || property.address || {};
    return [
      address.street && address.number
        ? `${address.street} ${address.number}`
        : address.street,
      address.comuna,
      address.city,
      address.state,
    ].filter(Boolean).join(", ") || "Ubicación no informada";
  }

  getAbsoluteUrl(value, baseUrl) {
    if (!value) return "";
    try {
      return new URL(value, baseUrl || undefined).toString();
    } catch {
      return "";
    }
  }

  buildStars(value) {
    const score = Math.max(0, Math.min(5, Number(value) || 0));
    return `${"★".repeat(Math.round(score))}${
      "☆".repeat(5 - Math.round(score))
    }`;
  }

  async sendRentalRequestNotification({
    to,
    ownerName,
    applicant = {},
    property = {},
    reviews = [],
    request = {},
    propertyUrl = "",
    baseUrl = "",
  }) {
    if (!to) {
      return { success: false, skipped: true, reason: "owner_without_email" };
    }

    const characteristic = property.caracteristica || property.characteristic ||
      {};
    const title = property.title || property.titulo || property.name ||
      property.type_desc || "Propiedad";
    const image = this.getAbsoluteUrl(
      property.image || property.fotos?.[0]?.url_foto || property.imagen,
      baseUrl,
    );
    const validReviews = reviews.filter((review) =>
      Number(review.total_rank) > 0
    );
    const average = validReviews.length
      ? validReviews.reduce(
        (sum, review) => sum + Number(review.total_rank),
        0,
      ) / validReviews.length
      : 0;
    const categories = [
      ["Pago", "pay_rank"],
      ["Limpieza", "clean_rank"],
      ["Respeto", "respect_rank"],
      ["Comunicación", "comunic_rank"],
      ["Convivencia", "noise_rank"],
      ["Responsabilidad", "respons_rank"],
      ["Experiencia", "exp_rank"],
    ];
    const categoryRows = categories.map(([label, field]) => {
      const values = validReviews.map((review) => Number(review[field])).filter(
        (value) => value > 0,
      );
      const score = values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;
      return `<td style="padding:7px 8px;border:1px solid #dce5e9;text-align:center"><strong style="color:#1f3b4c">${label}</strong><br><span style="color:#d99b2b">${
        score ? score.toFixed(1) : "—"
      }</span></td>`;
    }).join("");
    const reviewCards = validReviews.map((review) => `
      <div style="border-top:1px solid #dce5e9;padding:14px 0">
        <div style="color:#d99b2b;font-size:17px;letter-spacing:1px">${
      this.buildStars(review.total_rank)
    } <span style="color:#1f3b4c;font-size:14px">${
      Number(review.total_rank).toFixed(1)
    }/5</span></div>
        ${
      review.comment
        ? `<p style="margin:7px 0 0;color:#51656f">“${
          this.escapeHtml(review.comment)
        }”</p>`
        : ""
    }
      </div>`).join("");
    const applicantMessage = this.getRequestMessage(request.message);

    return this.sendEmail({
      to,
      subject: `Nueva solicitud de arriendo para ${title} - Tu Casa`,
      html: `
        <div style="margin:0;background:#f3f6f7;padding:24px 10px;font-family:Arial,sans-serif;color:#1f3b4c;line-height:1.5">
          <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 3px 14px rgba(31,59,76,.12)">
            <div style="background:#2c5a6e;padding:22px 28px;color:#fff">
              <div style="font-size:25px;font-weight:700">Tu Casa</div>
              <div style="opacity:.9;margin-top:3px">Nueva solicitud de arriendo</div>
            </div>
            <div style="padding:28px">
              <h1 style="font-size:23px;margin:0 0 12px;color:#1f3b4c">Hola${
        ownerName ? `, ${this.escapeHtml(ownerName)}` : ""
      }</h1>
              <p style="margin:0 0 22px">${
        this.escapeHtml(applicant.name)
      } está interesado en arrendar tu propiedad. Estos son sus datos para que puedas ponerte en contacto:</p>

              <div style="background:#edf3f5;border-left:4px solid #2c5a6e;border-radius:6px;padding:16px 18px;margin-bottom:22px">
                <div><strong>Nombre:</strong> ${
        this.escapeHtml(applicant.name)
      }</div>
                <div><strong>Correo:</strong> <a style="color:#2c5a6e" href="mailto:${
        this.escapeHtml(applicant.email)
      }">${this.escapeHtml(applicant.email || "No informado")}</a></div>
                <div><strong>Teléfono:</strong> ${
        this.escapeHtml(applicant.phone || "No informado")
      }</div>
              </div>

              ${
        applicantMessage
          ? `<div style="margin-bottom:22px"><strong>Mensaje del solicitante</strong><p style="background:#faf7ef;border-radius:6px;padding:13px;margin:7px 0 0;color:#51656f">${
            this.escapeHtml(applicantMessage)
          }</p></div>`
          : ""
      }

              <h2 style="font-size:18px;margin:0 0 10px">Detalle de la solicitud</h2>
              <div style="border:1px solid #dce5e9;border-radius:6px;padding:14px 16px;margin-bottom:22px;color:#51656f">
                <div><strong>Inicio deseado:</strong> ${
        this.escapeHtml(
          this.getRequestField(request.message, "Fecha de inicio deseada") ||
            "No informado",
        )
      }</div>
                <div><strong>Duración:</strong> ${
        Number(request.contract_time || 0)
      } meses</div>
                <div><strong>Ocupantes:</strong> ${
        Number(request.qty_person || 0)
      }</div>
                <div><strong>Situación laboral:</strong> ${
        this.escapeHtml(request.work_situation_desc || "No informada")
      }</div>
                <div><strong>Ingreso mensual:</strong> ${
        this.formatMoney(request.income)
      }</div>
              </div>

              <h2 style="font-size:18px;margin:0 0 10px">Propiedad solicitada</h2>
              <div style="border:1px solid #dce5e9;border-radius:9px;overflow:hidden;margin-bottom:24px">
                ${
        image
          ? `<img src="${this.escapeHtml(image)}" alt="${
            this.escapeHtml(title)
          }" style="width:100%;height:220px;object-fit:cover;display:block">`
          : ""
      }
                <div style="padding:16px">
                  <div style="font-size:19px;font-weight:700">${
        this.escapeHtml(title)
      }</div>
                  <div style="color:#657780;margin:4px 0">${
        this.escapeHtml(this.getPropertyAddress(property))
      }</div>
                  <div style="font-size:18px;font-weight:700;color:#2c5a6e">${
        this.formatMoney(characteristic.price ?? property.price)
      } / mes</div>
                  <div style="margin-top:5px;color:#657780">${
        Number(characteristic.qty_room || 0)
      } dormitorios · ${Number(characteristic.qty_bath || 0)} baños · ${
        Number(characteristic.total_mtr || 0)
      } m²</div>
                  ${
        propertyUrl
          ? `<a href="${
            this.escapeHtml(propertyUrl)
          }" style="display:inline-block;margin-top:14px;background:#2c5a6e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:700">Ver propiedad</a>`
          : ""
      }
                </div>
              </div>

              <h2 style="font-size:18px;margin:0">Valoraciones como arrendatario</h2>
              ${
        validReviews.length
          ? `
                <p style="margin:5px 0 14px"><span style="color:#d99b2b;font-size:20px">${
            this.buildStars(average)
          }</span> <strong>${
            average.toFixed(1)
          }/5</strong> · ${validReviews.length} ${
            validReviews.length === 1 ? "valoración" : "valoraciones"
          }</p>
                <table role="presentation" style="width:100%;border-collapse:collapse;font-size:12px"><tr>${categoryRows}</tr></table>
                ${reviewCards}
              `
          : `<p style="background:#f5f7f8;border-radius:6px;padding:13px;color:#657780">Este solicitante todavía no tiene valoraciones como arrendatario.</p>`
      }

              <p style="margin:24px 0 0;color:#657780;font-size:13px">La solicitud quedó registrada en Tu Casa. Revisa los antecedentes y contacta al solicitante antes de tomar una decisión.</p>
            </div>
          </div>
        </div>`,
    });
  }

  getRequestMessage(message) {
    const marker = "\nMensaje:";
    const normalizedMessage = `\n${String(message || "")}`;
    const index = normalizedMessage.toLowerCase().indexOf(marker.toLowerCase());
    return index >= 0
      ? normalizedMessage.slice(index + marker.length).trim()
      : "";
  }

  getRequestField(message, label) {
    const line = String(message || "").split(/\r?\n/).find((item) =>
      item.toLowerCase().startsWith(`${String(label).toLowerCase()}:`)
    );
    return line ? line.slice(line.indexOf(":") + 1).trim() : "";
  }

  async sendReviewLink(to, { subject, title, message, url }) {
    if (!to || !url) {
      return { success: false, skipped: true };
    }

    const safeTitle = this.escapeHtml(title);
    const safeMessage = this.escapeHtml(message);
    const safeUrl = this.escapeHtml(url);

    return await this.sendEmail({
      to,
      subject,
      html: `
        <div style="margin:0;background:#f3f6f7;padding:24px 10px;font-family:Arial,sans-serif;color:#1f3b4c;line-height:1.5">
          <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 3px 14px rgba(31,59,76,.12)">
            <div style="background:#2c5a6e;padding:22px 28px;color:#ffffff">
              <div style="font-size:25px;font-weight:700">Tu Casa</div>
              <div style="opacity:.9;margin-top:3px">Tu experiencia importa</div>
            </div>
            <div style="padding:32px 28px;text-align:center">
              <div style="width:62px;height:62px;margin:0 auto 20px;background:#edf3f5;border-radius:50%;color:#d99b2b;font-size:32px;line-height:62px;font-weight:700">&#9733;</div>
              <h1 style="font-size:23px;margin:0 0 12px;color:#1f3b4c">${safeTitle}</h1>
              <p style="max-width:500px;margin:0 auto;color:#51656f;font-size:16px">${safeMessage}</p>
              <div style="background:#faf7ef;border:1px solid #eee4cc;border-radius:9px;padding:17px 18px;margin:24px auto;max-width:500px;color:#51656f">
                Tu opini&oacute;n ayuda a construir una comunidad m&aacute;s segura y transparente. Completar la evaluaci&oacute;n solo te tomar&aacute; unos minutos.
              </div>
              <a href="${safeUrl}" style="display:inline-block;background:#2c5a6e;color:#ffffff;text-decoration:none;padding:13px 24px;border-radius:7px;font-weight:700;font-size:16px">
                Realizar evaluaci&oacute;n
              </a>
              <div style="border-top:1px solid #dce5e9;margin-top:30px;padding-top:20px;text-align:left;color:#657780;font-size:13px">
                <p style="margin:0 0 8px">Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:</p>
                <a href="${safeUrl}" style="color:#2c5a6e;word-break:break-all">${safeUrl}</a>
              </div>
            </div>
            <div style="background:#edf3f5;padding:16px 28px;text-align:center;color:#657780;font-size:12px">
              Este correo fue enviado autom&aacute;ticamente por Tu Casa.
            </div>
          </div>
        </div>
      `,
    });
  }

  async sendRentalApprovedReviewLinks(
    { ownerEmail, tenantEmail, tenantReviewUrl, landlordReviewUrl },
  ) {
    const emails = [
      {
        role: "owner",
        to: ownerEmail,
        payload: {
          subject: "Evalua a tu arrendatario - Tu Casa",
          title: "Solicitud de arriendo aprobada",
          message:
            "Ya puedes evaluar al arrendatario asociado a esta solicitud.",
          url: tenantReviewUrl,
        },
      },
      {
        role: "tenant",
        to: tenantEmail,
        payload: {
          subject: "Evalua a tu arrendador - Tu Casa",
          title: "Tu solicitud fue aprobada",
          message: "Ya puedes evaluar al arrendador de la propiedad.",
          url: landlordReviewUrl,
        },
      },
    ];

    const results = await Promise.allSettled(
      emails.map((email) => this.sendReviewLink(email.to, email.payload)),
    );

    return results.map((result, index) => {
      const email = emails[index];
      if (result.status === "rejected") {
        console.error(
          `Error enviando correo de resena a ${email.role} (${
            email.to || "sin correo"
          }):`,
          result.reason,
        );
        return {
          role: email.role,
          to: email.to || null,
          success: false,
          error: result.reason?.message || String(result.reason),
        };
      }

      if (!result.value?.success) {
        console.warn(
          `Correo de resena no enviado a ${email.role}:`,
          result.value,
        );
      }

      return {
        role: email.role,
        to: email.to || null,
        ...result.value,
      };
    });
  }
}
