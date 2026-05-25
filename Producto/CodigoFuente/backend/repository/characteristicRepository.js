import { BaseRepository } from "./baseRepository.js";

export class CharacteristicRepository extends BaseRepository {
    async findByPropertyIds(propertyIds) {
        if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from("CARACTERISTICA")
            .select("*")
            .in("id_propi", propertyIds);

        if (error) {
            throw new Error(`Error al obtener caracteristicas: ${error.message}`);
        }

        return data || [];
    }

    async create(characteristicData) {
        const { data, error } = await this.supabase
            .from("CARACTERISTICA")
            .insert(characteristicData)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear caracteristica: ${error.message}`);
        }

        return data;
    }

    async deleteByPropertyId(propertyId) {
        const { data, error } = await this.supabase
            .from("CARACTERISTICA")
            .delete()
            .eq("id_propi", propertyId)
            .select();

        if (error) {
            throw new Error(`Error al eliminar caracteristicas de propiedad ${propertyId}: ${error.message}`);
        }

        return data || [];
    }
}

export default CharacteristicRepository;
