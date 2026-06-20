import { BaseRepository } from "./baseRepository.js";

export class RequestRepository extends BaseRepository {
  async create(requestData) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .insert(requestData)
      .select()
      .single();

    if (error) throw new Error(`Error al crear solicitud: ${error.message}`);
    return data;
  }

  async findByUserId(userId) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .select("*")
      .eq("id_usuario", userId)
      .order("date", { ascending: false })
      .order("id_request", { ascending: false });

    if (error) {
      throw new Error(
        `Error al obtener solicitudes del usuario: ${error.message}`,
      );
    }
    return data || [];
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .select("*")
      .order("date", { ascending: false })
      .order("id_request", { ascending: false });

    if (error) {
      throw new Error(`Error al obtener solicitudes: ${error.message}`);
    }
    return data || [];
  }

  async findReceivedByOwnerId(ownerId) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .select(`
                *,
                propiedad:PROPIEDAD!SOLICITUD_id_propi_fkey!inner(*),
                usuario:USUARIO!SOLICITUD_id_usuario_fkey(*)
            `)
      .eq("propiedad.id_usuario", ownerId)
      .order("date", { ascending: false })
      .order("id_request", { ascending: false });

    if (error) {
      throw new Error(
        `Error al obtener solicitudes recibidas del arrendador: ${error.message}`,
      );
    }
    return data || [];
  }

  async findByPropertyIds(propertyIds = []) {
    if (propertyIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .select("*")
      .in("id_propi", propertyIds)
      .order("date", { ascending: false })
      .order("id_request", { ascending: false });

    if (error) {
      throw new Error(
        `Error al obtener solicitudes de propiedades: ${error.message}`,
      );
    }
    return data || [];
  }

  async updateStatus(id, statusData) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .update(statusData)
      .eq("id_request", id)
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(
        `Error al actualizar estado de solicitud: ${error.message}`,
      );
    }
    if (!data) throw new Error("La solicitud no existe");
    return data;
  }

  async finalizeApprovedByPropertyId(propertyId) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .update({ status_nbr: 4, status_desc: "Finalizada" })
      .eq("id_propi", propertyId)
      .eq("status_nbr", 2)
      .select();

    if (error) {
      throw new Error(
        `Error al finalizar solicitudes de la propiedad ${propertyId}: ${error.message}`,
      );
    }
    return data || [];
  }

  async deleteByPropertyId(propertyId) {
    const { data, error } = await this.supabase
      .from("SOLICITUD")
      .delete()
      .eq("id_propi", propertyId)
      .select();

    if (error) {
      throw new Error(
        `Error al eliminar solicitudes de propiedad ${propertyId}: ${error.message}`,
      );
    }
    return data || [];
  }
}
