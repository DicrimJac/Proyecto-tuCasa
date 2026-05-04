// main.ts
import { Hono } from "hono";
import { serveDir } from "jsr:@std/http/file-server";
import { fromFileUrl, join } from "jsr:@std/path@1";
import userRoute from "./backend/route/userRoute.js";

const app = new Hono();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// Logger
app.use("*", async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// CORS
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  if (c.req.method === "OPTIONS") {
    return c.text("", 204);
  }
  await next();
});

// ============================================
// RUTAS DE API
// ============================================

// Montar rutas de usuarios
app.route("/api/users", userRoute);

// O si prefieres rutas directas:
// app.get("/api/users", (c) => userController.getAllUsers(c));
// app.get("/api/users/:id", (c) => userController.getUserById(c));

// ============================================
// RUTAS DE ARCHIVOS ESTÁTICOS
// ============================================

// Resolver ruta absoluta a la carpeta "static" relativa a este archivo, no al cwd
const moduleDir = fromFileUrl(new URL("./", import.meta.url));
const staticRoot = join(moduleDir, "static");

// Servir archivos estáticos desde la carpeta "static" (agnóstico del cwd)
app.get("/*", async (c) => {
  // Convertir el request de Hono a Request nativo de Deno
  const request = new Request(c.req.url, {
    method: c.req.method,
    headers: c.req.header(),
  });

  const response = await serveDir(request, {
    fsRoot: staticRoot,
    urlRoot: "",
    showDirListing: false,
    enableCors: true,
  });
  
  // Copiar el status y headers
  c.status(response.status);
  response.headers.forEach((value, key) => {
    c.header(key, value);
  });
  
  return c.body(response.body);
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const port = 3000;

console.log("   Servidor corriendo en http://localhost:" + port);
console.log("   Archivos estáticos: carpeta /static");
console.log("   API endpoints:");
console.log("   GET    /api/users");
console.log("   GET    /api/users/:id");
console.log("   POST   /api/users");
console.log("   PUT    /api/users/:id");
console.log("   DELETE /api/users/:id");

Deno.serve({ port }, app.fetch);
