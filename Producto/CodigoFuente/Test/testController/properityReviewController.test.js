import { assertEquals } from "jsr:@std/assert@1";

import { PropertyReviewController } from "../../backend/controller/propertyReviewController.js";

Deno.test("debe obtener todas las evaluaciones de una propiedad", async () => {

    const controller = new PropertyReviewController();

    const reviews = [
        {
            id: 1,
            description: "Excelente propiedad"
        }
    ];

    controller.propertyReviewService.getAllReviews = async ({ propertyId }) => {
        assertEquals(propertyId, "10");
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

    const controller = new PropertyReviewController();

    const payload = {
        id_propi: 1,
        neight: 5
    };

    controller.propertyReviewService.createReview = async (data) => {
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

Deno.test("debe retornar 400 cuando id_propi es invalido", async () => {

    const controller = new PropertyReviewController();

    controller.propertyReviewService.createReview = async () => {
        throw new Error("id_propi invalido");
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
        message: "id_propi invalido"
    });

});

Deno.test("debe eliminar una evaluacion", async () => {

    const controller = new PropertyReviewController();

    controller.propertyReviewService.deleteReview = async (id) => {

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

Deno.test("debe retornar 404 cuando la evaluacion no existe", async () => {

    const controller = new PropertyReviewController();

    controller.propertyReviewService.deleteReview = async () => {
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