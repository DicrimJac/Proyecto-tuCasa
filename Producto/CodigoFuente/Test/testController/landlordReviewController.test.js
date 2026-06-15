import { assertEquals } from "jsr:@std/assert@1";

import { LandlordReviewController } from "../../backend/controller/landlordReviewController.js";

Deno.test("debe obtener todas las evaluaciones", async () => {

    const controller = new LandlordReviewController();

    const reviews = [
        { id: 1, comentario: "Excelente" }
    ];

    controller.landlordReviewService.getAllReviews = async ({ userId }) => {
        assertEquals(userId, "10");
        return reviews;
    };

    let response;
    let status;

    const c = {
        req: {
            query: () => "10"
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.getAllReviews(c);

    assertEquals(status, 200);
    assertEquals(response, {
        success: true,
        data: reviews,
        total: 1
    });

});

Deno.test("debe crear una evaluacion correctamente", async () => {

    const controller = new LandlordReviewController();

    const payload = {
        id_usuario: 1,
        rating: 5,
        comentario: "Muy bueno"
    };

    controller.landlordReviewService.createReview = async (data) => {
        assertEquals(data, payload);
        return payload;
    };

    let response;
    let status;

    const c = {
        req: {
            json: async () => payload
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.createReview(c);

    assertEquals(status, 201);
    assertEquals(response, {
        success: true,
        data: payload
    });

});

Deno.test("debe retornar 400 cuando rating es invalido", async () => {

    const controller = new LandlordReviewController();

    controller.landlordReviewService.createReview = async () => {
        throw new Error("rating debe ser un numero entre 1 y 5");
    };

    let response;
    let status;

    const c = {
        req: {
            json: async () => ({})
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.createReview(c);

    assertEquals(status, 400);
    assertEquals(response, {
        success: false,
        error: "Datos invalidos",
        message: "rating debe ser un numero entre 1 y 5"
    });

});

Deno.test("debe eliminar una evaluacion", async () => {

    const controller = new LandlordReviewController();

    controller.landlordReviewService.deleteReview = async (id) => {
        assertEquals(id, "5");

        return {
            deleted: true
        };
    };

    let response;
    let status;

    const c = {
        req: {
            param: () => "5"
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.deleteReview(c);

    assertEquals(status, 200);
    assertEquals(response, {
        success: true,
        data: {
            deleted: true
        }
    });

});

Deno.test("debe retornar 404 si la evaluacion no existe", async () => {

    const controller = new LandlordReviewController();

    controller.landlordReviewService.deleteReview = async () => {
        throw new Error("La evaluacion no existe");
    };

    let response;
    let status;

    const c = {
        req: {
            param: () => "99"
        },
        json: (data, code) => {
            response = data;
            status = code;
        }
    };

    await controller.deleteReview(c);

    assertEquals(status, 404);
    assertEquals(response, {
        success: false,
        error: "No encontrado",
        message: "La evaluacion no existe"
    });

});