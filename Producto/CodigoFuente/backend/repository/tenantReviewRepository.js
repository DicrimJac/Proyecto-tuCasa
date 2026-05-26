import { BaseRepository } from "./baseRepository.js";

export class TenantReviewRepository extends BaseRepository {
    async findAll() {
        const { data, error } = await this.supabase
            .from("EVALTENANT")
            .select("*")
            .order("date_review", { ascending: false })
            .order("id_review", { ascending: false });

        if (error) throw new Error(`Error al obtener evaluaciones de arrendatario: ${error.message}`);
        return data || [];
    }

    async create(reviewData) {
        const { data, error } = await this.supabase
            .from("EVALTENANT")
            .insert(reviewData)
            .select()
            .single();

        if (error) throw new Error(`Error al crear evaluacion de arrendatario: ${error.message}`);
        return data;
    }
}
