import { BaseRepository } from "./baseRepository.js";

export class AddressRepository extends BaseRepository {
    async create(addressData) {
        const { data, error } = await this.supabase
            .from("DIRECCION")
            .insert(addressData)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al crear direccion: ${error.message}`);
        }

        return data;
    }
}

export default AddressRepository;
