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
}
