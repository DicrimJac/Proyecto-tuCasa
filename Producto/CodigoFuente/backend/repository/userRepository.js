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
            .eq('id_usuario', id)
            .maybeSingle();

        if (error) throw new Error(`Usuario ${id} no encontrado: ${error.message}`);
        if (!data) throw new Error(`Usuario ${id} no encontrado`);
        return data;
    }

    // Buscar usuario por email usando la columna real de la tabla USUARIO: mail
    async findByEmail(email) {
        const normalizedEmail = decodeURIComponent(String(email || "")).trim().toLowerCase();

        const { data, error } = await this.supabase
            .from('USUARIO')
            .select('*')
            .eq('mail', normalizedEmail)
            .maybeSingle();

        if (error) throw new Error(`Error al buscar usuario con email ${normalizedEmail}: ${error.message}`);

        if (!data) {
            throw new Error(`Usuario con email ${normalizedEmail} no encontrado`);
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
            .eq('id_usuario', id)
            .select()
            .maybeSingle();
        if (error) throw new Error(`Error al eliminar usuario ${id}: ${error.message}`);
        if (!data) throw new Error(`No se elimino ningun usuario con id_usuario ${id}`);
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
