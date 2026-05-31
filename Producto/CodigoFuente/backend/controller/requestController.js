import { RequestService } from "../service/requestService.js";

export class RequestController {
    constructor() {
        this.requestService = new RequestService();
    }

    getAuthenticatedUserId(c) {
        return c.get("authUserId");
    }

    async createRequest(c) {
        try {
            const payload = await c.req.json();
            const data = await this.requestService.createRequest(payload, this.getAuthenticatedUserId(c));
            return c.json({ success: true, data }, 201);
        } catch (error) {
            const isValidationError = /debe ser|invalida|required|requerida|No autorizado/i.test(error.message);
            return c.json({
                success: false,
                error: isValidationError ? "Datos invalidos" : "Error interno del servidor",
                message: error.message,
            }, isValidationError ? 400 : 500);
        }
    }

    async getMyRequests(c) {
        try {
            const data = await this.requestService.getMyRequests(this.getAuthenticatedUserId(c));
            return c.json({ success: true, data, total: data.length }, 200);
        } catch (error) {
            return c.json({
                success: false,
                error: "Error interno del servidor",
                message: error.message,
            }, 500);
        }
    }
}

export default RequestController;
