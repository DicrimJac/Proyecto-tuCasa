// backend/service/geminiService.ts - VERSIÓN SIMPLE QUE FUNCIONA

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

export class GeminiService {
    private apiKey: string;
    private apiUrl: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || GEMINI_API_KEY;
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    }

    private construirPrompt(datos: any) {
        const indicadores = datos.indicadores;
        const r = indicadores.resumenSector;

        return `
Actúa como un analista inmobiliario.

Describe objetivamente el sector utilizando únicamente la información entregada.

Dirección:
${datos.direccion}

Perfil del sector:
${indicadores.perfilSector}

${indicadores.metroMasCercano
    ? `Metro más cercano: ${indicadores.metroMasCercano.nombre} (${indicadores.metroMasCercano.distancia.toFixed(2)} km)`
    : "No se identificó una estación de metro cercana."
}

Servicios encontrados en el entorno:

- Hospitales o centros de salud: ${r.hospitales.length}
- Colegios: ${r.colegios.length}
- Parques y áreas verdes: ${r.parques.length}
- Restaurantes: ${r.restaurantes.length}
- Farmacias: ${r.farmacias.length}
- Supermercados: ${r.supermercados.length}
- Gimnasios: ${r.gimnasios.length}

Genera un único párrafo entre 80 y 150 palabras.

Describe:

- Cómo es el sector.
- Nivel de conectividad.
- Disponibilidad de servicios.
- Perfil de personas que podrían beneficiarse de vivir allí.
- Principales fortalezas del entorno.

Reglas:

- No menciones negocios específicos.
- No inventes problemas de seguridad.
- No inventes aspectos negativos.
- Mantén un tono profesional y objetivo.
- Basa todas las conclusiones únicamente en los datos proporcionados.
- No asumas que el sector es bueno ni malo.
- No afirmes que falta información sobre servicios si se han proporcionado datos de servicios.
- No generes elogios que no puedan justificarse con los datos recibidos.
`;
    }


    async generarReseniaSector(datosSector: any) {
        try {
            if (!datosSector.exito) {
                return { exito: false, error: datosSector.error };
            }

            if (!this.apiKey) {
                return { exito: false, error: "Falta configurar GEMINI_API_KEY" };
            }

            const prompt = this.construirPrompt(datosSector);
            console.log("🤖 Enviando a Gemini...");

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 500,
                        thinkingConfig: {
                            thinkingBudget: 0
                        }
                    }
                }),
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error.message);
            }

            const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            return {
                exito: true,                
                analisis: texto
            };
        } catch (error) {
            console.error("Error en Gemini:", error);
            return {
                exito: false,
                error: error instanceof Error ? error.message : "Error en Gemini",
            };
        }
    }
}
