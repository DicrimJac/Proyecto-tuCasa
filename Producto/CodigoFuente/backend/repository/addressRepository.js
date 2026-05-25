import { BaseRepository } from "./baseRepository.js";

export class AddressRepository extends BaseRepository {
    async findByIds(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from("DIRECCION")
            .select("*")
            .in("id_address", ids);

        if (error) {
            throw new Error(`Error al obtener direcciones: ${error.message}`);
        }

        return data || [];
    }

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

    async update(id, addressData) {
        const { data, error } = await this.supabase
            .from("DIRECCION")
            .update(addressData)
            .eq("id_address", id)
            .select()
            .single();

        if (error) {
            throw new Error(`Error al actualizar direccion ${id}: ${error.message}`);
        }

        return data;
    }

    async delete(id) {
        const { data, error } = await this.supabase
            .from("DIRECCION")
            .delete()
            .eq("id_address", id)
            .select()
            .maybeSingle();

        if (error) {
            throw new Error(`Error al eliminar direccion ${id}: ${error.message}`);
        }

        return data;
    }
}

export default AddressRepository;
