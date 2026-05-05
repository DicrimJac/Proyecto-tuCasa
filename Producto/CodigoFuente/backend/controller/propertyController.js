import { PropertyService } from "../service/propertyService.js";

export class PropertyController {
    constructor() {
        this.propertyService = new PropertyService();
    }

    // GET /api/properties
    async getAllProperties(c) {
        try {
        const data = await this.propertyService.getAllProperties();
        return c.json({ success: true, data, total: data?.length ?? 0 }, 200);
        } catch (error) {
        return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // GET /api/properties/:id
    async getPropertyById(c) {
        try {
        const id = c.req.param("id");
        const data = await this.propertyService.getPropertyById(id);
        return c.json({ success: true, data }, 200);
        } catch (error) {
        return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // POST /api/properties
    async createProperty(c) {
        try {
        const payload = await c.req.json();
        const data = await this.propertyService.createProperty(payload);
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
        const data = await this.propertyService.updateProperty(id, payload);
        return c.json({ success: true, data }, 200);
        } catch (error) {
        return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }

    // DELETE /api/properties/:id
    async deleteProperty(c) {
        try {
        const id = c.req.param("id");
        const data = await this.propertyService.deleteProperty(id);
        return c.json({ success: true, data }, 200);
        } catch (error) {
        return c.json({ success: false, error: "Error interno del servidor", message: error.message }, 500);
        }
    }
}

export default PropertyController;
