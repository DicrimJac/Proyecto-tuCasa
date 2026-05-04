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
    
    // Buscar usuario por email (priorizando columnas posibles: mail, email, correo)
    async findByEmail(email) {
        // Intento con la columna 'mail'
        let { data, error } = await this.supabase
            .from('USUARIO')
            .select('*')
            .eq('mail', email)
            .single();

        if (error || !data) {
            // Intento con columna 'email'
            const alt1 = await this.supabase
                .from('USUARIO')
                .select('*')
                .eq('email', email)
                .single();
            if (!alt1?.data && alt1?.error) {
                // Intento con columna 'correo'
                const alt2 = await this.supabase
                    .from('USUARIO')
                    .select('*')
                    .eq('correo', email)
                    .single();
                if (alt2?.error) {
                    throw new Error(`Usuario con email ${email} no encontrado: ${alt2.error.message}`);
                }
                data = alt2?.data;
            } else {
                data = alt1?.data;
            }
        }

        if (!data) {
            throw new Error(`Usuario con email ${email} no encontrado: ${error?.message || 'no data'}`);
        }
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