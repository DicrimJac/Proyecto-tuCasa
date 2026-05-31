import { BaseRepository } from "./baseRepository.js";

export class LandlordReviewRepository extends BaseRepository {
    async findAll({ userId } = {}) {
        let query = this.supabase
            .from("EVALULANDLORD")
            .select("*")
            .order("date", { ascending: false })
            .order("id_landlord", { ascending: false });

        if (userId) {
            query = query.eq("id_usuario", userId);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error al obtener evaluaciones de arrendador: ${error.message}`);
        return data || [];
    }

    async create(reviewData) {
        const { data, error } = await this.supabase
            .from("EVALULANDLORD")
            .insert(reviewData)
            .select()
            .single();

        if (error) throw new Error(`Error al crear evaluacion de arrendador: ${error.message}`);
        return data;
    }

    async delete(id) {
        const { data, error } = await this.supabase
            .from("EVALULANDLORD")
            .delete()
            .eq("id_landlord", id)
            .select()
            .maybeSingle();

        if (error) throw new Error(`Error al eliminar evaluacion de arrendador: ${error.message}`);
        if (!data) throw new Error("La evaluacion no existe");
        return data;
    }
}
