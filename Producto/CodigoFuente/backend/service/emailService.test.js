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
