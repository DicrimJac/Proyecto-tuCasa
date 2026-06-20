import { strict as assert } from "node:assert";
import { EmailService } from "./emailService.js";

Deno.test("correo de solicitud incluye contacto, propiedad y valoraciones de forma segura", async () => {
  const service = new EmailService();
  let sentEmail = null;
  service.sendEmail = (email) => {
    sentEmail = email;
    return Promise.resolve({ success: true });
  };

  const result = await service.sendRentalRequestNotification({
    to: "dueno@example.com",
    ownerName: "Ana",
    applicant: {
      name: "Tomás <script>alert(1)</script>",
      email: "tomas@example.com",
      phone: "9 1234 5678",
    },
    property: {
      type_desc: "Departamento nuevo",
      direccion: { street: "Los Robles", number: "123", comuna: "Providencia" },
      image: "https://cdn.example.com/property.jpg",
      caracteristica: {
        price: 550000,
        qty_room: 2,
        qty_bath: 1,
        total_mtr: 55,
      },
    },
    reviews: [{
      total_rank: 4.5,
      pay_rank: 5,
      clean_rank: 4,
      respect_rank: 5,
      comunic_rank: 4,
      noise_rank: 5,
      respons_rank: 4,
      exp_rank: 4.5,
      comment: "Muy responsable <b>siempre</b>",
    }],
    request: {
      contract_time: 12,
      qty_person: 2,
      work_situation_desc: "Trabajador dependiente",
      income: 1200000,
      message:
        "Fecha de inicio deseada: 2026-07-01\nMensaje: Me interesa mucho\nPodemos coordinar una visita.",
    },
    propertyUrl: "https://tucasa.example/detail.html?id=10",
  });

  assert.equal(result.success, true);
  assert.equal(sentEmail.to, "dueno@example.com");
  assert.match(sentEmail.subject, /Departamento nuevo/);
  assert.match(sentEmail.html, /tomas@example\.com/);
  assert.match(sentEmail.html, /Los Robles 123/);
  assert.match(sentEmail.html, /4\.5\/5/);
  assert.match(sentEmail.html, /Podemos coordinar una visita\./);
  assert.match(sentEmail.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(sentEmail.html, /&lt;b&gt;siempre&lt;\/b&gt;/);
  assert.doesNotMatch(sentEmail.html, /<script>/);
});

Deno.test("correo se omite cuando el propietario no tiene email", async () => {
  const service = new EmailService();
  const result = await service.sendRentalRequestNotification({ to: "" });

  assert.deepEqual(result, {
    success: false,
    skipped: true,
    reason: "owner_without_email",
  });
});

Deno.test("API recibe un string cuando hay un solo destinatario", async () => {
  const service = new EmailService();
  service.apiUrl = "https://email.example/api/send";
  service.apiToken = "test-token";
  service.enabled = true;

  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = (_url, options) => {
    requestBody = JSON.parse(options.body);
    return Promise.resolve(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
  };

  try {
    await service.sendEmail({
      to: "dueno@example.com",
      subject: "Solicitud",
      html: "<p>Hola</p>",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requestBody.to, "dueno@example.com");
});

Deno.test("correo de evaluacion usa la identidad visual de Tu Casa", async () => {
  const service = new EmailService();
  let sentEmail;
  service.sendEmail = (email) => {
    sentEmail = email;
    return Promise.resolve({ success: true });
  };

  await service.sendReviewLink("usuario@example.com", {
    subject: "Evalua a tu arrendatario - Tu Casa",
    title: "Solicitud de arriendo aprobada",
    message: "Ya puedes realizar tu evaluacion.",
    url: "https://tucasa.example/tenantReview.html?id_request=10",
  });

  assert.match(sentEmail.html, /background:#2c5a6e/);
  assert.match(sentEmail.html, /Tu experiencia importa/);
  assert.match(sentEmail.html, /Realizar evaluaci&oacute;n/);
  assert.match(sentEmail.html, /comunidad m&aacute;s segura/);
  assert.match(sentEmail.html, /tenantReview\.html\?id_request=10/);
});

Deno.test("envio de correo termina con un error claro cuando la API expira", async () => {
  const service = new EmailService();
  service.apiUrl = "https://email.example/api/send";
  service.apiToken = "test-token";
  service.enabled = true;
  service.timeoutMs = 5;

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(options.signal.reason));
  });

  try {
    await assert.rejects(
      () => service.sendEmail({
        to: "dueno@example.com",
        subject: "Solicitud",
        html: "<p>Hola</p>",
      }),
      /no respondio en 5 ms/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
