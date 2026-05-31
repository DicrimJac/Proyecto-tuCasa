import { analizarSector } from "./backend/controller/analisisController.ts";

const direccion = "Argomedo 350, Santiago, Región Metropolitana, Chile";

console.log("🚀 Iniciando análisis...\n");

const resultado = await analizarSector(direccion);

if (resultado.exito) {
    console.log("✅ DIRECCIÓN:", resultado.direccion);

    console.log("\n📍 COORDENADAS:");
    console.log(resultado.coordenadas);

    console.log("\n📈 INDICADORES DEL SECTOR:");
    console.log(resultado.indicadores);

    console.log("\n📊 ANÁLISIS DE IA:");
    console.log("=".repeat(80));
    console.log(resultado.analisis);
    console.log("=".repeat(80));

    console.log(
        `\n📏 LONGITUD DEL ANÁLISIS: ${
            resultado.analisis?.length || 0
        } caracteres`
    );

    console.log(
        `📏 PALABRAS: ${
            resultado.analisis?.split(" ").length || 0
        } palabras`
    );

    console.log("\n🏙️ RESUMEN DEL SECTOR:");

    console.log(
        `   • Perfil: ${resultado.indicadores.perfilSector}`
    );

    console.log(
        `   • Puntaje: ${resultado.indicadores.puntajeGeneral}/10`
    );

    console.log(
        `   • Centros de salud: ${resultado.indicadores.resumenSector.salud}`
    );

    console.log(
        `   • Educación: ${resultado.indicadores.resumenSector.educacion}`
    );

    console.log(
        `   • Áreas verdes: ${resultado.indicadores.resumenSector.areasVerdes}`
    );

    console.log(
        `   • Gastronomía: ${resultado.indicadores.resumenSector.gastronomia}`
    );

    console.log(
        `   • Farmacias: ${resultado.indicadores.resumenSector.farmacias}`
    );

    console.log(
        `   • Transporte: ${resultado.indicadores.resumenSector.transporte}`
    );

    if (resultado.indicadores.metroMasCercano) {
        console.log(
            `   • Metro más cercano: ${
                resultado.indicadores.metroMasCercano.nombre
            }`
        );

        console.log(
            `   • Distancia al metro: ${
                resultado.indicadores.metroMasCercano.distancia.toFixed(2)
            } km`
        );
    }
} else {
    console.log("❌ ERROR:", resultado.error);
}