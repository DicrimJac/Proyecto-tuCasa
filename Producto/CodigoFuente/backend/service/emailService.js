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
}
