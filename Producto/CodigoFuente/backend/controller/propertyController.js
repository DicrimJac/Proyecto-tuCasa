import { PropertyService } from "../service/propertyService.js";

export class PropertyController {
    constructor() {
        this.propertyService = new PropertyService();
    }

    getAuthenticatedUserId(c) {
        return c.get("authUserId");
    }

    // GET /api/properties
    async getAllProperties(c) {
        try {
            const publicOnly = c.req.query("public") === "true";
            const data = await this.propertyService.getAllProperties({ publicOnly });
            return c.json({ success: true, data, total: data?.length ?? 0 }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // GET /api/properties/:id
    async getPropertyById(c) {
        try {
            const id = c.req.param("id");
            const publicOnly = c.req.query("public") === "true";
            const data = await this.propertyService.getPropertyById(id, { publicOnly });
            if (!data) {
                return c.json({ success: false, error: "Propiedad no disponible" }, 404);
            }
            return c.json({ success: true, data }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // GET /api/properties/mine
    async getMyProperties(c) {
        try {
            const ownerId = this.getAuthenticatedUserId(c);
            if (!ownerId) {
                return c.json({ success: false, error: "No autorizado" }, 401);
            }

            const data = await this.propertyService.getPropertiesByOwner(ownerId);
            return c.json({ success: true, data, total: data?.length ?? 0 }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // POST /api/properties
    async createProperty(c) {
        try {
            const ownerId = this.getAuthenticatedUserId(c);
            if (!ownerId) {
                return c.json({ success: false, error: "No autorizado" }, 401);
            }

            const payload = await c.req.json();
            const { direccion, propiedad, caracteristica } = payload || {};

            // Validaciones mínimas del payload
            if (!direccion || !propiedad || !caracteristica) {
                return c.json({
                    success: false,
                    error: "Payload inválido",
                    message: "Se requieren los objetos direccion, propiedad y caracteristica",
                }, 400);
            }

            if (!direccion.street || !direccion.number || !direccion.comuna || !direccion.city || !direccion.state) {
                return c.json({
                    success: false,
                    error: "Datos de dirección incompletos",
                }, 400);
            }

            if (typeof propiedad.type_nbr === "undefined") {
                return c.json({
                    success: false,
                    error: "Falta type_nbr en propiedad",
                }, 400);
            }

            if (!String(propiedad.describe || "").trim()) {
                return c.json({
                    success: false,
                    error: "Falta describe en propiedad",
                }, 400);
            }

            if (typeof caracteristica.total_mtr === "undefined" || typeof caracteristica.price === "undefined") {
                return c.json({
                    success: false,
                    error: "Faltan campos obligatorios en caracteristica (total_mtr, price)",
                }, 400);
            }

            const data = await this.propertyService.createPropertyWithAll({
                direccion,
                propiedad,
                caracteristica,
                ownerId,
            });

            return c.json({ success: true, data }, 201);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // PUT /api/properties/:id
    async updateProperty(c) {
        try {
            const id = c.req.param("id");
            const payload = await c.req.json();
            const ownerId = this.getAuthenticatedUserId(c);
            const data = await this.propertyService.updateProperty(id, payload, { ownerId });
            return c.json({ success: true, data }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // POST /api/properties/:id/photos
    async uploadPropertyPhotos(c) {
        try {
            const ownerId = this.getAuthenticatedUserId(c);
            if (!ownerId) {
                return c.json({ success: false, error: "No autorizado" }, 401);
            }

            const id = c.req.param("id");
            const body = await c.req.parseBody({ all: true });
            const rawPhotos = body.photos || body.fotos || body.files || [];
            const photos = (Array.isArray(rawPhotos) ? rawPhotos : [rawPhotos])
                .filter((file) => file instanceof File && file.size > 0);

            if (photos.length === 0) {
                return c.json({ success: false, error: "Debes enviar al menos una foto" }, 400);
            }

            const data = await this.propertyService.uploadPropertyPhotos(id, photos, { ownerId });
            return c.json({ success: true, data, total: data.length }, 201);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // PATCH /api/properties/:id/status
    async updatePropertyStatus(c) {
        try {
            const id = c.req.param("id");
            const payload = await c.req.json();
            const ownerId = this.getAuthenticatedUserId(c);
            const data = await this.propertyService.updatePropertyStatus(id, payload, { ownerId });
            return c.json({ success: true, data }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // DELETE /api/properties/:id
    async deleteProperty(c) {
        try {
            const id = c.req.param("id");
            const ownerId = this.getAuthenticatedUserId(c);
            const data = await this.propertyService.deleteProperty(id, { ownerId });
            return c.json({ success: true, data }, 200);
        } catch (error) {
            return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }
}

export default PropertyController;
