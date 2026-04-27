// import { serveFile } from "jsr:@std/http/file-server";

// Deno.serve((req: Request) => {
//     return serveFile(req, "./index.html");
// });

import { serveDir } from "jsr:@std/http/file-server";

Deno.serve((req: Request) => {
  return serveDir(req, {
    fsRoot: "static",   // carpeta raíz que quieres servir (puedes poner "./public" si tienes una carpeta específica)
    urlRoot: "",   // prefijo de URL ("" = raíz del servidor)
    showDirListing: false, // muestra listado de directorios si no hay index.html
    enableCors: true,     // útil si quieres probar desde frontend
  });
});
