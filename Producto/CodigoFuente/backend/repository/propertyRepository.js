import { BaseRepository } from "./baseRepository.js";

export class PropertyRepository extends BaseRepository {
    async findAll() {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .select('*');
        if (error) throw new Error(`Error al obtener propiedades: ${error.message}`);
        return data;
    }

    async findById(id) {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .select('*')
            .eq('id_propi', id)
            .single();
        if (error) throw new Error(`Propiedad ${id} no encontrado: ${error.message}`);
        return data;
    }

    async create(propertyData) {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .insert(propertyData)
            .select()
            .single();
        if (error) throw new Error(`Error al crear propiedad: ${error.message}`);
        return data;
    }

    async update(id, propertyData) {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .update(propertyData)
            .eq('id_propi', id)
            .select()
            .single();
        if (error) throw new Error(`Error al actualizar propiedad ${id}: ${error.message}`);
        return data;
    }

    async delete(id) {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .delete()
            .eq('id_propi', id)
            .select()
            .single();
        if (error) throw new Error(`Error al eliminar propiedad ${id}: ${error.message}`);
        return data;
    }
}


