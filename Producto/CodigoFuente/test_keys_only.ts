// test_keys_only.ts - Verificar que las keys funcionan

// 🔴 PON AQUÍ TUS KEYS REALES PARA PROBAR
const GOOGLE_KEY = "AIzaSyCHldzkKhkn7QOS0cuAivFkgtbgV-RlFTc";
const GEMINI_KEY = "AQ.Ab8RN6J_h8nmyZJzzGy8YXkCnH_hV2eLIx7PzcZGv4sIZr46ww";

console.log("🔑 Probando Google Maps API...");

const testGoogle = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?address=Plaza+de+Armas+Santiago&key=${GOOGLE_KEY}`
);
const dataGoogle = await testGoogle.json();

if (dataGoogle.status === "OK") {
  console.log("✅ Google Maps API funciona correctamente");
  console.log(`   Dirección encontrada: ${dataGoogle.results[0].formatted_address}`);
} else {
  console.log(`❌ Google Maps API falló: ${dataGoogle.status}`);
  console.log(`   Mensaje: ${dataGoogle.error_message || "Sin mensaje"}`);
}

console.log("\n🔑 Probando Gemini API...");

const testGemini = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`
);
const dataGemini = await testGemini.json();

if (dataGemini.models) {
  console.log("✅ Gemini API funciona correctamente");
} else {
  console.log(`❌ Gemini API falló: ${dataGemini.error?.message || "Error desconocido"}`);
}