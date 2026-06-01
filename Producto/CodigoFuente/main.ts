// main.ts
import { Hono } from "hono";
import { serveDir } from "jsr:@std/http/file-server";
import { fromFileUrl, join } from "jsr:@std/path@1";
import userRoute from "./backend/route/userRoute.js";
import propertyRoute from "./backend/route/propertyRoute.js";
import tenantReviewRoute from "./backend/route/tenantReviewRoute.js";
import landlordReviewRoute from "./backend/route/landlordReviewRoute.js";
import propertyReviewRoute from "./backend/route/propertyReviewRoute.js";
import requestRoute from "./backend/route/requestRoute.js";

const app = new Hono();
const APP_VERSION = "received-requests-refresh-1";

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
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
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
// Montar rutas de evaluaciones de arrendadores
app.route("/api/landlord-reviews", landlordReviewRoute);
// Montar rutas de evaluaciones de propiedades
app.route("/api/property-reviews", propertyReviewRoute);
// Montar rutas de solicitudes de arriendo
app.route("/api/requests", requestRoute);

app.get("/api/health", (c) => {
  return c.json({
    success: true,
    version: APP_VERSION,
    runtime: "deno",
    deploymentId: Deno.env.get("DENO_DEPLOYMENT_ID") || null,
    env: {
      hasSupabaseUrl: Boolean(Deno.env.get("SUPABASE_URL")),
      hasSupabaseServiceRoleKey: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
      hasSupabaseAnonKey: Boolean(Deno.env.get("SUPABASE_ANON_KEY")),
      hasSessionSecret: Boolean(Deno.env.get("SESSION_SECRET")),
      hasGoogleMapsApiKey: Boolean(Deno.env.get("GOOGLE_MAPS_API_KEY")),
      hasGeminiApiKey: Boolean(Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY")),
      frontendOrigin: Deno.env.get("FRONTEND_ORIGIN") || null,
    },
    routes: [
      "GET /api/properties/mine",
      "POST /api/properties",
      "POST /api/properties/analyze",
      "GET /api/requests/mine",
      "GET /api/requests/received",
      "PATCH /api/requests/:id/status",
      "GET /api/landlord-reviews",
      "POST /api/landlord-reviews",
      "GET /api/property-reviews",
      "POST /api/property-reviews",
    ],
  });
});

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

  const headers = new Headers(response.headers);
  const pathname = new URL(c.req.url).pathname;
  if (/\.(html|js|css)$/i.test(pathname)) {
    headers.set("Cache-Control", "no-store, max-age=0");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const port = 3000;

console.log("   Servidor corriendo en http://localhost:" + port);
console.log("   Archivos estáticos: carpeta /static");
console.log("   API endpoints:");
console.log("   Version: " + APP_VERSION);
console.log("   GET    /api/health");
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
console.log("   GET    /api/landlord-reviews");
console.log("   POST   /api/landlord-reviews");
console.log("   DELETE /api/landlord-reviews/:id");
console.log("   GET    /api/property-reviews");
console.log("   POST   /api/property-reviews");
console.log("   DELETE /api/property-reviews/:id");
console.log("   GET    /api/requests/mine");
console.log("   GET    /api/requests/received");
console.log("   POST   /api/requests");
console.log("   PATCH  /api/requests/:id/status");

Deno.serve({ port }, app.fetch);
