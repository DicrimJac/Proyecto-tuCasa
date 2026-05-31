// main.ts
import { Hono } from "hono";
import { serveDir } from "jsr:@std/http/file-server";
import { fromFileUrl, join } from "jsr:@std/path@1";
import userRoute from "./backend/route/userRoute.js";
import propertyRoute from "./backend/route/propertyRoute.js";
import tenantReviewRoute from "./backend/route/tenantReviewRoute.js";

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
  const origin = c.req.header("origin");
  const allowedOrigins = (Deno.env.get("FRONTEND_ORIGIN") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowOrigin = origin &&
    (allowedOrigins.length === 0 || allowedOrigins.includes(origin))
    ? origin
    : "";

  if (allowOrigin) {
    c.header("Access-Control-Allow-Origin", allowOrigin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  }
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (c.req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  await next();
});

// ============================================
// RUTAS DE API
// ============================================

// Montar rutas de usuarios
app.route("/api/users", userRoute);
// Montar rutas de propiedades
app.route("/api/properties", propertyRoute);
// Montar rutas de evaluaciones de arrendatarios
app.route("/api/tenant-reviews", tenantReviewRoute);

// ============================================
// RUTAS DE ARCHIVOS ESTÁTICOS
// ============================================

// Resolver ruta absoluta a la carpeta "static" relativa a este archivo, no al cwd
const moduleDir = fromFileUrl(new URL("./", import.meta.url));
const staticRoot = join(moduleDir, "static");

app.get("/", async (c) => {
  return new Response(await Deno.readFile(join(staticRoot, "home.html")), {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});

app.get("/favicon.ico", async (c) => {
  return new Response(
    await Deno.readFile(join(staticRoot, "assets", "image", "favicon.png")),
    {
      headers: {
        "content-type": "image/png",
      },
    },
  );
});

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

  return response;
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
console.log("   GET    /api/properties");
console.log("   GET    /api/properties/:id");
console.log("   POST   /api/properties");
console.log("   PUT    /api/properties/:id");
console.log("   DELETE /api/properties/:id");
console.log("   GET    /api/tenant-reviews");
console.log("   POST   /api/tenant-reviews");
console.log("   DELETE /api/tenant-reviews/:id");

Deno.serve({ port }, app.fetch);
