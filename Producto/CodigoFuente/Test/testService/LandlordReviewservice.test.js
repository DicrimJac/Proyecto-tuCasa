import {
    assertEquals,
    assertThrows,
    assertRejects,
} from "jsr:@std/assert@1";

import { LandlordReviewService } from "../../backend/service/landlordReviewService.js";

Deno.test("debe aceptar un rank valido", () => {

    const service = new LandlordReviewService();

    const result = service.normalizeRank(5, "trust_rank");

    assertEquals(result, 5);

});

Deno.test("debe lanzar error si rank es menor a 1", () => {

    const service = new LandlordReviewService();

    assertThrows(
        () => service.normalizeRank(0, "trust_rank"),
        Error,
        "trust_rank debe ser un numero entre 1 y 5"
    );

});

Deno.test("debe lanzar error si rank es mayor a 5", () => {

    const service = new LandlordReviewService();

    assertThrows(
        () => service.normalizeRank(6, "trust_rank"),
        Error,
        "trust_rank debe ser un numero entre 1 y 5"
    );

});

Deno.test("debe aceptar id_usuario valido", () => {

    const service = new LandlordReviewService();

    const result = service.normalizeOptionalUserId("10");

    assertEquals(result, 10);

});

Deno.test("debe retornar null si id_usuario esta vacio", () => {

    const service = new LandlordReviewService();

    const result = service.normalizeOptionalUserId("");

    assertEquals(result, null);

});

Deno.test("debe lanzar error si id_usuario es invalido", () => {

    const service = new LandlordReviewService();

    assertThrows(
        () => service.normalizeOptionalUserId(-1),
        Error,
        "id_usuario invalido"
    );

});

Deno.test("debe construir correctamente el payload", () => {

    const service = new LandlordReviewService();

    const review = {
        comunicacion_rank: 5,
        respect_rank: 5,
        mainte_rank: 4,
        timeless_rank: 4,
        trasparency_rank: 5,
        availability_rank: 4,
        trust_rank: 5,
        general_exp_rank: 4,
        descr: "Excelente arrendador",
        id_usuario: 10
    };

    const payload = service.buildPayload(review);

    assertEquals(payload.id_usuario, 10);

    assertEquals(
        payload.descr,
        "Excelente arrendador"
    );

    assertEquals(payload.total_point, 4.5);

});

Deno.test("debe crear una evaluacion", async () => {

    const service = new LandlordReviewService();

    const mockResult = {
        id: 1
    };

    let repositoryFueLlamado = false;

    service.repository.create = async () => {

        repositoryFueLlamado = true;

        return mockResult;
    };

    const review = {
        comunicacion_rank: 5,
        respect_rank: 5,
        mainte_rank: 5,
        timeless_rank: 5,
        trasparency_rank: 5,
        availability_rank: 5,
        trust_rank: 5,
        general_exp_rank: 5
    };

    const result = await service.createReview(review);

    assertEquals(result, mockResult);
    assertEquals(repositoryFueLlamado, true);

});

Deno.test("debe eliminar una evaluacion", async () => {

    const service = new LandlordReviewService();

    service.repository.delete = async () => ({
        deleted: true
    });

    const result = await service.deleteReview(5);

    assertEquals(result, {
        deleted: true
    });

});

Deno.test("debe lanzar error cuando id es invalido", async () => {

    const service = new LandlordReviewService();

    await assertRejects(
        () => service.deleteReview("abc"),
        Error,
        "ID de evaluacion invalido"
    );

});