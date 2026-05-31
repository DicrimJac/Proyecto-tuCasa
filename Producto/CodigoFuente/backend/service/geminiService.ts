// backend/service/geminiService.ts - VERSIÓN SIMPLE QUE FUNCIONA

const GEMINI_API_KEY = "AQ.Ab8RN6J_h8nmyZJzzGy8YXkCnH_hV2eLIx7PzcZGv4sIZr46ww";

export class GeminiService {
    private apiKey: string;
    private apiUrl: string;

    constructor(apiKey?: string) {
        this.apiKey = apiKey || GEMINI_API_KEY;
        this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
    }

    private construirPrompt(datos: any) {
        const indicadores = datos.indicadores;

        return `
Actúa como un asesor inmobiliario especializado en arriendos en Chile.

Analiza objetivamente el siguiente sector.

Dirección:
${datos.direccion}

Indicadores del sector:

- Perfil del sector: ${indicadores.perfilSector}

${indicadores.metroMasCercano
                ? `Metro más cercano: ${indicadores.metroMasCercano.nombre} (${indicadores.metroMasCercano.distancia.toFixed(2)} km)`
                : "No se identificó una estación de metro cercana."
            }

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
- No menciones reseñas.
- Mantén un tono profesional, objetivo e inmobiliario.
- Basa todas las conclusiones únicamente en los datos proporcionados.
`;
    }


    async generarReseniaSector(datosSector: any) {
        try {
            if (!datosSector.exito) {
                return { exito: false, error: datosSector.error };
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
            console.log("\n===== RESPUESTA COMPLETA GEMINI =====");
            console.log(JSON.stringify(data, null, 2));
            console.log("=====================================\n");

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