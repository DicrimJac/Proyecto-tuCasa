import { BaseRepository } from "./baseRepository.js";

export class RequestRepository extends BaseRepository {
    async create(requestData) {
        const { data, error } = await this.supabase
            .from("SOLICITUD")
            .insert(requestData)
            .select()
            .single();

        if (error) throw new Error(`Error al crear solicitud: ${error.message}`);
        return data;
    }

    async findByUserId(userId) {
        const { data, error } = await this.supabase
            .from("SOLICITUD")
            .select("*")
            .eq("id_usuario", userId)
            .order("date", { ascending: false })
            .order("id_request", { ascending: false });

        if (error) throw new Error(`Error al obtener solicitudes del usuario: ${error.message}`);
        return data || [];
    }

    async findAll() {
        const { data, error } = await this.supabase
            .from("SOLICITUD")
            .select("*")
            .order("date", { ascending: false })
            .order("id_request", { ascending: false });

        if (error) throw new Error(`Error al obtener solicitudes: ${error.message}`);
        return data || [];
    }

    async findByPropertyIds(propertyIds = []) {
        if (propertyIds.length === 0) return [];

        const { data, error } = await this.supabase
            .from("SOLICITUD")
            .select("*")
            .in("id_propi", propertyIds)
            .order("date", { ascending: false })
            .order("id_request", { ascending: false });

        if (error) throw new Error(`Error al obtener solicitudes de propiedades: ${error.message}`);
        return data || [];
    }

    async updateStatus(id, statusData) {
        const { data, error } = await this.supabase
            .from("SOLICITUD")
            .update(statusData)
            .eq("id_request", id)
            .select()
            .maybeSingle();

        if (error) throw new Error(`Error al actualizar estado de solicitud: ${error.message}`);
        if (!data) throw new Error("La solicitud no existe");
        return data;
    }
}
