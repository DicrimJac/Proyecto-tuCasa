export class EmailService {
  constructor() {
    this.apiKey = Deno.env.get("RESEND_API_KEY") || "";
    this.from = Deno.env.get("EMAIL_FROM") || "Tu Casa <onboarding@resend.dev>";
    this.enabled = Boolean(this.apiKey);
  }

  async sendPasswordResetCode(to, code) {
    if (!this.enabled) {
      console.log(`[DEV] Codigo de recuperacion para ${to}: ${code}`);
      return { success: true, devMode: true };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
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
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.message || result?.error || "No se pudo enviar el correo");
    }

    return { success: true, data: result };
  }

  async sendReviewLink(to, { subject, title, message, url }) {
    if (!to || !url) {
      return { success: false, skipped: true };
    }

    if (!this.enabled) {
      console.log(`[DEV] Link de resena para ${to}: ${url}`);
      return { success: true, devMode: true };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to,
        subject,
        html: `
          <div style="font-family:Arial,sans-serif;color:#1F3B4C;line-height:1.5">
            <h2>${title}</h2>
            <p>${message}</p>
            <p style="margin:24px 0">
              <a href="${url}" style="background:#2C5A6E;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px;display:inline-block">
                Abrir reseña
              </a>
            </p>
            <p>Si el boton no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break:break-all">${url}</p>
          </div>
        `,
      }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result?.message || result?.error || "No se pudo enviar el correo");
    }

    return { success: true, data: result };
  }

  async sendRentalApprovedReviewLinks({ ownerEmail, tenantEmail, tenantReviewUrl, landlordReviewUrl }) {
    const emails = [
      {
        role: "owner",
        to: ownerEmail,
        payload: {
        subject: "Evalua a tu arrendatario - Tu Casa",
        title: "Solicitud de arriendo aprobada",
        message: "Ya puedes evaluar al arrendatario asociado a esta solicitud.",
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
        console.error(`Error enviando correo de resena a ${email.role} (${email.to || "sin correo"}):`, result.reason);
        return {
          role: email.role,
          to: email.to || null,
          success: false,
          error: result.reason?.message || String(result.reason),
        };
      }

      if (!result.value?.success) {
        console.warn(`Correo de resena no enviado a ${email.role}:`, result.value);
      }

      return {
        role: email.role,
        to: email.to || null,
        ...result.value,
      };
    });
  }
}
