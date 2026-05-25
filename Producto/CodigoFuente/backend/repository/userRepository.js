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

    async update(id, userData) {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .update(userData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(`Error al actualizar usuario ${id}: ${error.message}`);
        return data;
    }

    async updateByEmail(currentEmail, userData) {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .update(userData)
            .eq('mail', currentEmail)
            .select()
            .maybeSingle();

        if (error) throw new Error(`Error al actualizar usuario ${currentEmail}: ${error.message}`);
        if (!data) throw new Error(`No se actualizÃ³ ningÃºn usuario con mail ${currentEmail}`);
        return data;
    }

    async updateByUserRecord(existingUser, userData) {
        const idUsuario = existingUser?.id_usuario;
        const id = existingUser?.id;
        const mail = existingUser?.mail;

        let query = this.supabase
            .from('USUARIO')
            .update(userData);

        let identifier = "";
        if (idUsuario !== undefined && idUsuario !== null) {
            query = query.eq('id_usuario', idUsuario);
            identifier = `id_usuario ${idUsuario}`;
        } else if (id !== undefined && id !== null) {
            query = query.eq('id', id);
            identifier = `id ${id}`;
        } else if (mail) {
            query = query.eq('mail', mail);
            identifier = `mail ${mail}`;
        } else {
            throw new Error("No se pudo identificar el usuario para actualizar");
        }

        const { data, error } = await query.select().maybeSingle();

        if (error) throw new Error(`Error al actualizar usuario con ${identifier}: ${error.message}`);
        if (!data) throw new Error(`No se actualizÃ³ ningÃºn usuario con ${identifier}`);
        return data;
    }

    async delete(id) {
        const { data, error } = await this.supabase
            .from('USUARIO')
            .delete()
            .eq('id', id)
            .select()
            .single();
        if (error) throw new Error(`Error al eliminar usuario ${id}: ${error.message}`);
        return data;
    }

    async deleteByUserRecord(existingUser) {
        const idUsuario = existingUser?.id_usuario;
        const id = existingUser?.id;
        const mail = existingUser?.mail || existingUser?.email || existingUser?.correo;

        let query = this.supabase
            .from('USUARIO')
            .delete();

        let identifier = "";
        if (idUsuario !== undefined && idUsuario !== null) {
            query = query.eq('id_usuario', idUsuario);
            identifier = `id_usuario ${idUsuario}`;
        } else if (id !== undefined && id !== null) {
            query = query.eq('id', id);
            identifier = `id ${id}`;
        } else if (mail) {
            query = query.eq('mail', mail);
            identifier = `mail ${mail}`;
        } else {
            throw new Error("No se pudo identificar el usuario para eliminar");
        }

        const { data, error } = await query.select().maybeSingle();
        if (error) throw new Error(`Error al eliminar usuario con ${identifier}: ${error.message}`);
        if (!data) throw new Error(`No se eliminó ningún usuario con ${identifier}`);
        return data;
    }
}
