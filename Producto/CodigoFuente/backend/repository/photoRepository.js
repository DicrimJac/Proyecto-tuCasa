import { BaseRepository } from "./baseRepository.js";

const PHOTO_TABLE = "FOTO";
const DEFAULT_BUCKET = "fotos_propiedades";

function safeFileName(name = "foto.jpg") {
    return String(name)
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "foto.jpg";
}

export class PhotoRepository extends BaseRepository {
    bucketName = Deno.env.get("SUPABASE_PHOTOS_BUCKET") ||
        Deno.env.get("SUPABASE_PROPERTY_PHOTOS_BUCKET") ||
        DEFAULT_BUCKET;

    async findByPropertyIds(propertyIds) {
        if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(PHOTO_TABLE)
            .select("*")
            .in("id_propi", propertyIds)
            .order("id_foto", { ascending: true });

        if (error) {
            throw new Error(`Error al obtener fotos: ${error.message}`);
        }

        return data || [];
    }

    async createMany(photos) {
        if (!Array.isArray(photos) || photos.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(PHOTO_TABLE)
            .insert(photos)
            .select();

        if (error) {
            throw new Error(`Error al guardar fotos: ${error.message}`);
        }

        return data || [];
    }

    async deleteByPropertyId(propertyId) {
        const { data, error } = await this.supabase
            .from(PHOTO_TABLE)
            .delete()
            .eq("id_propi", propertyId)
            .select();

        if (error) {
            throw new Error(`Error al eliminar fotos de propiedad ${propertyId}: ${error.message}`);
        }

        return data || [];
    }

    async uploadPropertyPhotos(propertyId, files) {
        if (!Array.isArray(files) || files.length === 0) {
            return [];
        }

        const uploadedPhotos = [];

        for (const file of files) {
            const fileName = safeFileName(file.name);
            const storagePath = `propiedades/${propertyId}/${crypto.randomUUID()}-${fileName}`;
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(storagePath, file, {
                    contentType: file.type || "image/jpeg",
                    upsert: false,
                });

            if (error) {
                throw new Error(`Error al subir foto ${fileName} al bucket ${this.bucketName}: ${error.message}`);
            }

            const { data } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(storagePath);

            uploadedPhotos.push({
                id_propi: propertyId,
                url_foto: data.publicUrl,
            });
        }

        return this.createMany(uploadedPhotos);
    }
}

export default PhotoRepository;
