import { BaseRepository } from "./baseRepository.js";

export class PropertyReviewRepository extends BaseRepository {
    async findAll({ propertyId } = {}) {
        let query = this.supabase
            .from("EVALUPROPI")
            .select("*")
            .order("date_register", { ascending: false })
            .order("id_evalupropi", { ascending: false });

        if (propertyId) {
            query = query.eq("id_propi", propertyId);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Error al obtener evaluaciones de propiedad: ${error.message}`);
        return data || [];
    }

    async create(reviewData) {
        const { data, error } = await this.supabase
            .from("EVALUPROPI")
            .insert(reviewData)
            .select()
            .single();

        if (error) throw new Error(`Error al crear evaluacion de propiedad: ${error.message}`);
        return data;
    }

    async delete(id) {
        const { data, error } = await this.supabase
            .from("EVALUPROPI")
            .delete()
            .eq("id_evalupropi", id)
            .select()
            .maybeSingle();

        if (error) throw new Error(`Error al eliminar evaluacion de propiedad: ${error.message}`);
        if (!data) throw new Error("La evaluacion no existe");
        return data;
    }
}
