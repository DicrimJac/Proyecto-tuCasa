import { SessionRepository } from "../repository/sessionRepository.js";

// Middleware de autenticación basado en cookies (session_id)
export const requireAuth = async (c, next) => {
  const cookieHeader = c.req.header("cookie") || "";
  const sessionId = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith("session_id="))
    ?.split("=")[1];

  if (!sessionId) {
    return c.json({ success: false, error: "No autorizado" }, 401);
  }

  const repo = new SessionRepository();
  const sess = await repo.findSession(sessionId);
  if (!sess?.userId) {
    return c.json({ success: false, error: "No autorizado" }, 401);
  }

  c.set("authUserId", sess.userId);
  return next();
};
