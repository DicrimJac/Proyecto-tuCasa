import { TenantReviewService } from "../service/tenantReviewService.js";

export class TenantReviewController {
    constructor() {
        this.tenantReviewService = new TenantReviewService();
    }

    async getAllReviews(c) {
        try {
            const data = await this.tenantReviewService.getAllReviews();
            return c.json({ success: true, data, total: data.length }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    async createReview(c) {
        try {
            const payload = await c.req.json();
            const data = await this.tenantReviewService.createReview(payload);
            return c.json({ success: true, data }, 201);
        } catch (error) {
            const isValidationError = /debe ser un numero entre 1 y 5/.test(error.message);
            return c.json({
                success: false,
                error: isValidationError ? "Datos invalidos" : "Error interno del servidor",
                message: error.message,
            }, isValidationError ? 400 : 500);
        }
    }

    async deleteReview(c) {
        try {
            const id = c.req.param("id");
            const data = await this.tenantReviewService.deleteReview(id);
            return c.json({ success: true, data }, 200);
        } catch (error) {
            const isInvalidId = /ID de evaluacion invalido/.test(error.message);
            const isNotFound = /no existe/.test(error.message);

            return c.json({
                success: false,
                error: isInvalidId ? "Datos invalidos" : isNotFound ? "No encontrado" : "Error interno del servidor",
                message: error.message,
            }, isInvalidId ? 400 : isNotFound ? 404 : 500);
        }
    }
}

export default TenantReviewController;
