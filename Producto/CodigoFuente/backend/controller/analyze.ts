// backend/controller/analizy.ts
import { analizarSector } from "./analisisController.ts";
import { PropertyRepository } from "../repository/propertyRepository.js";

const propertyRepository = new PropertyRepository();

// Función para construir la dirección a partir del objeto
function construirDireccion(propiedad: any): string | null {
    console.log("🔍 construyendo dirección, propiedad.direccion:", propiedad.direccion);
    
    // Si la dirección es un string y no está vacío
    if (typeof propiedad.direccion === 'string' && propiedad.direccion.trim()) {
        return propiedad.direccion;
    }
    
    // Si la dirección es un objeto con los campos
    if (propiedad.direccion && typeof propiedad.direccion === 'object') {
        const dir = propiedad.direccion;
        console.log("📦 Objeto dirección:", dir);
        console.log("   street:", dir.street);
        console.log("   number:", dir.number);
        console.log("   comuna:", dir.comuna);
        console.log("   city:", dir.city);
        console.log("   state:", dir.state);
        
        const partes = [];
        
        if (dir.street && dir.number) {
            partes.push(`${dir.street} ${dir.number}`);
        } else if (dir.street) {
            partes.push(dir.street);
        } else if (dir.number) {
            partes.push(dir.number);
        }
        
        if (dir.comuna) partes.push(dir.comuna);
        if (dir.city) partes.push(dir.city);
        if (dir.state) partes.push(dir.state);
        
        console.log("📝 Partes de la dirección:", partes);
        
        if (partes.length > 0) {
            const direccion = partes.join(", ");
            console.log("✅ Dirección construida:", direccion);
            return direccion;
        }
    }
    
    console.log("❌ No se pudo construir la dirección");
    return null;
}

export const handler = async (c: any) => {
    try {
        const body = await c.req.json();
        console.log("📦 Body recibido:", body);
        
        const { id_propi } = body;
        console.log("🆔 ID recibido:", id_propi);

        if (!id_propi) {
            return c.json(
                { exito: false, error: "ID de propiedad requerido" },
                400
            );
        }

        const propiedad = await propertyRepository.findById2(id_propi);
        console.log("🏠 Propiedad encontrada, tipo de dirección:", typeof propiedad.direccion);

        if (!propiedad) {
            return c.json(
                { exito: false, error: "Propiedad no existe" },
                404
            );
        }
       
        if (propiedad.analisis_ia) {
            console.log("📝 Usando análisis cacheado");
            return c.json({
                exito: true,
                cached: true,
                data: propiedad
            });
        }
        
        // CONSTRUIR LA DIRECCIÓN
        const direccionCompleta = construirDireccion(propiedad);
        console.log("📍 Dirección construida final:", direccionCompleta);
        
        if (!direccionCompleta) {
            console.log("❌ No se pudo construir la dirección");
            return c.json({
                exito: false,
                error: "La propiedad no tiene dirección registrada"
            }, 400);
        }
        
        console.log("🌍 Analizando sector para:", direccionCompleta);
        const resultado = await analizarSector(direccionCompleta);

        if (!resultado.exito) {
            console.log("❌ Error en análisis:", resultado.error);
            return c.json(resultado, 500);
        }

        const i = resultado.indicadores;

        const updateData = {
            perfil_sector: i.perfilSector || null,
            metro_cercano: i.metroMasCercano?.nombre || null,
            distancia_metro: i.metroMasCercano?.distancia || null,
            resumen_sector: i.resumenSector || null,
            analisis_ia: resultado.analisis || null,
            analisis_updated_at: new Date().toISOString()
        };

        console.log("💾 Actualizando propiedad con datos del sector");
        const propiedadActualizada = await propertyRepository.update(
            propiedad.id_propi,
            updateData
        );

        return c.json({
            exito: true,
            cached: false,
            data: propiedadActualizada
        });

    } catch (error) {
        console.error("🔴 Error en analyze handler:", error);
        return c.json(
            { exito: false, error: "Error interno del servidor: " + error.message },
            500
        );
    }
};