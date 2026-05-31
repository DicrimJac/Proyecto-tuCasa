import { analizarSector } from "./analisisController.ts";
import { PropertyRepository } from "../repository/propertyRepository.ts";

const propertyRepository = new PropertyRepository();

export const handler = async (req: Request) => {
    try {
        const { id_propi } = await req.json();

        if (!id_propi) {
            return Response.json(
                { exito: false, error: "ID de propiedad requerido" },
                { status: 400 }
            );
        }

        const propiedad = await propertyRepository.findById(id_propi);

        if (!propiedad) {
            return Response.json(
                { exito: false, error: "Propiedad no existe" },
                { status: 404 }
            );
        }
       
        if (propiedad.analisis_ia) {
            return Response.json({
                exito: true,
                cached: true,
                data: propiedad
            });
        }
        
        const resultado = await analizarSector(propiedad.direccion);

        if (!resultado.exito) {
            return Response.json(resultado, { status: 500 });
        }

        const i = resultado.indicadores;

        const updateData = {
            perfil_sector: i.perfilSector,
            metro_cercano: i.metroMasCercano?.nombre || null,
            distancia_metro: i.metroMasCercano?.distancia || null,
            resumen_sector: i.resumenSector,
            analisis_ia: resultado.analisis,
            analisis_updated_at: new Date().toISOString()
        };

        const propiedadActualizada = await propertyRepository.update(
            propiedad.id_propi,
            updateData
        );

        return Response.json({
            exito: true,
            cached: false,
            data: propiedadActualizada
        });

    } catch (error) {
        return Response.json(
            { exito: false, error: "Error interno" },
            { status: 500 }
        );
    }
};