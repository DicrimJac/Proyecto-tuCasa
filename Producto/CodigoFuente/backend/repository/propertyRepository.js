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

    async findById2(id) {
        // Sintaxis correcta: nombre_tabla!nombre_foreign_key(*)
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .select(`
                *,
                DIRECCION!fk_direccion(*)
            `)
            .eq('id_propi', id)
            .single();
        
        if (error) {
            console.error("Error en findById:", error);
            throw new Error(`Propiedad ${id} no encontrada: ${error.message}`);
        }
        
        console.log("Propiedad encontrada con dirección:", data?.DIRECCION);
        
        // Renombrar la propiedad para que sea más legible
        if (data && data.DIRECCION) {
            data.direccion = data.DIRECCION;
            delete data.DIRECCION;
        }
        
        return data;
    }

    async findByOwnerId(ownerId) {
        const { data, error } = await this.supabase
            .from('PROPIEDAD')
            .select('*')
            .eq('id_usuario', ownerId);

        if (error && /column .*id_usuario.* does not exist/i.test(error.message)) {
            return [];
        }

        if (error) throw new Error(`Error al obtener propiedades del usuario ${ownerId}: ${error.message}`);
        return data || [];
    }

    async findByAddress(direccion) {
        const { data, error } = await this.supabase
            .from("PROPIEDAD")
            .select("*")
            .ilike("direccion", direccion)
            .maybeSingle();

        if (error) {
            throw new Error(`Error buscando propiedad: ${error.message}`);
        }

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


