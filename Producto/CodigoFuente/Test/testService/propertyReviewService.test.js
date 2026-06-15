import { assertEquals, assertThrows } from "jsr:@std/assert@1";

import { PropertyReviewService } from "../../backend/service/propertyReviewService.js";

Deno.test("debe aceptar un rank valido", () => {

    const service = new PropertyReviewService();

    const result = service.normalizeRank(4, "neight");

    assertEquals(result, 4);

});

Deno.test("debe lanzar error cuando rank es mayor a 5", () => {

    const service = new PropertyReviewService();

    assertThrows(
        () => service.normalizeRank(6, "neight"),
        Error,
        "neight debe ser un numero entre 1 y 5"
    );

});

Deno.test("debe aceptar un id_propi valido", () => {

    const service = new PropertyReviewService();

    const result = service.normalizePropertyId("12");

    assertEquals(result, 12);

});

Deno.test("debe lanzar error cuando id_propi es invalido", () => {

    const service = new PropertyReviewService();

    assertThrows(
        () => service.normalizePropertyId(-1),
        Error,
        "id_propi invalido"
    );

});

Deno.test("debe construir correctamente el payload", () => {

    const service = new PropertyReviewService();

    const review = {
        neight: 5,
        service_near: 5,
        segurity: 4,
        service_bus: 4,
        neightbors: 5,
        clean: 4,
        maintenance: 5,
        quality_price: 4,
        level_noise: 5,
        signal: 4,
        lighting: 5,
        parking: 4,
        description: "Muy buena propiedad",
        id_propi: 10
    };

    const payload = service.buildPayload(review);

    assertEquals(payload.id_propi, 10);
    assertEquals(
        payload.description,
        "Muy buena propiedad"
    );
    assertEquals(payload.total_point, 4.5);

});

Deno.test("debe crear una evaluacion", async () => {

    const service = new PropertyReviewService();

    const mockResult = {
        id: 1
    };

    let repositoryFueLlamado = false;

    service.repository.create = async () => {

        repositoryFueLlamado = true;

        return mockResult;
    };

    const review = {
        neight: 5,
        service_near: 5,
        segurity: 5,
        service_bus: 5,
        neightbors: 5,
        clean: 5,
        maintenance: 5,
        quality_price: 5,
        level_noise: 5,
        signal: 5,
        lighting: 5,
        parking: 5,
        id_propi: 1
    };

    const result = await service.createReview(review);

    assertEquals(result, mockResult);
    assertEquals(repositoryFueLlamado, true);

});

Deno.test("debe eliminar una evaluacion", async () => {

    const service = new PropertyReviewService();

    service.repository.delete = async () => ({
        deleted: true
    });

    const result = await service.deleteReview(5);

    assertEquals(result, {
        deleted: true
    });

});

Deno.test("debe lanzar error cuando id es invalido", async () => {

    const service = new PropertyReviewService();

    let error;

    try {
        await service.deleteReview("abc");
    } catch (e) {
        error = e;
    }

    assertEquals(
        error.message,
        "ID de evaluacion invalido"
    );

});