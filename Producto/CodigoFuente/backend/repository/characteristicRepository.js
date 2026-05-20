import { BaseRepository } from "./baseRepository.js";

export class CharacteristicRepository extends BaseRepository {
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
}

export default CharacteristicRepository;
