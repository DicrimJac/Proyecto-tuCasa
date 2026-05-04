import { BaseRepository } from "./baseRepository.js";

export class UserRepository extends BaseRepository {
    
    async findAll() {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .select('*');
        
        if (error) throw new Error(`Error al obtener usuarios: ${error.message}`);
        return data;
    }
    
    async findById(id) {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw new Error(`Usuario ${id} no encontrado: ${error.message}`);
        return data;
    }
    
    async create(userData) {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .insert(userData)
            .select()
            .single();
        
        if (error) throw new Error(`Error al crear usuario: ${error.message}`);
        return data;
    }
}