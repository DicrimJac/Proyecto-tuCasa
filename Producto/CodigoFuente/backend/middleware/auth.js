import { SessionRepository } from "../repository/sessionRepository.js";

// Middleware de autenticación basado en cookies (session_id)
export const requireAuth = async (c, next) => {
  const cookieHeader = c.req.headers.get("cookie") || "";
  const sessionId = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith("session_id="))
    ?.split("=")[1];

  if (!sessionId) {
    return c.json({ success: false, error: "No autorizado" }, 401);
  }

  const repo = new SessionRepository();
  const sess = repo.findSession(sessionId);
  if (!sess) {
    return c.json({ success: false, error: "No autorizado" }, 401);
  }

  return next();
};
