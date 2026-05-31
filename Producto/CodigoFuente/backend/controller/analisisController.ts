import { GoogleMapsService } from "../service/googleMapsService.ts";
import { GeminiService } from "../service/geminiService.ts";

const googleMapsService = new GoogleMapsService();
const geminiService = new GeminiService();

export async function analizarSector(direccion: string) {
    console.log(`🔍 Analizando: ${direccion}`);

    const datosSector =
        await googleMapsService.obtenerContextoSector(direccion);

    if (!datosSector.exito) {
        return {
            exito: false,
            mensaje: "Error al obtener datos del sector",
            error: datosSector.error,
        };
    }

    const analisisIA =
        await geminiService.generarReseniaSector(datosSector);

    if (!analisisIA.exito) {
        return {
            exito: false,
            mensaje: "Error al generar análisis",
            error: analisisIA.error,
        };
    }

    return {
        exito: true,
        direccion: datosSector.direccion,
        coordenadas: datosSector.coordenadas,
        indicadores: datosSector.indicadores,
        analisis: analisisIA.analisis,
    };
}