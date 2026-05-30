import { getCookie, setCookie } from "hono/cookie";
import { UserService } from "../service/userService.js";
import { EmailService } from "../service/emailService.js";
import { SessionRepository } from "../repository/sessionRepository.js";

const passwordResetCodes = new Map();
const RESET_CODE_TTL_MS = 10 * 60 * 1000;
const RESET_CODE_TTL_SECONDS = RESET_CODE_TTL_MS / 1000;
const RESET_COOKIE_NAME = "password_reset";
const textEncoder = new TextEncoder();

function createResetCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : textEncoder.encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - normalized.length % 4) % 4),
    "=",
  );

  return atob(padded);
}

async function getResetSigningKey() {
  const secret = Deno.env.get("SESSION_SECRET") ||
    Deno.env.get("RESEND_API_KEY") ||
    "tu-casa-reset-dev-secret";

  return await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signResetPayload(value) {
  const key = await getResetSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return base64UrlEncode(new Uint8Array(signature));
}

async function createResetCookieValue(data) {
  const encodedPayload = base64UrlEncode(JSON.stringify(data));
  const signature = await signResetPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function readResetCookieValue(value) {
  if (!value || !value.includes(".")) return null;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await signResetPayload(encodedPayload);
  if (expectedSignature !== signature) return null;

  try {
    return JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    return null;
  }
}

function clearResetCookie(c) {
  setCookie(c, RESET_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "Lax",
    maxAge: 0,
  });
}

export class UserController {
  constructor() {
    this.userService = new UserService();
    this.emailService = new EmailService();
  }

  // GET /api/users
  // En Hono, el controlador recibe el Context `c`
  async getAllUsers(c) {
    try {
      const result = await this.userService.getAllUsers();

      const status = result.success ? 200 : 400;
      return c.json({
        success: result.success,
        data: result.data,
        total: result.total,
        error: result.error,
      }, status);
    } catch (error) {
      console.error("Error solicitando recuperacion de contrasena:", error);
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // POST /api/login (inicio de sesión básico por correo y contraseña)
  async login(c) {
    try {
      const { email, password } = await c.req.json();
      const result = await this.userService.authenticateByEmail(
        email,
        password,
      );
      const status = result.success ? 200 : 401;
      // Si el login es exitoso, crear una sesión y persistirla en una cookie HttpOnly
      if (result.success) {
        const sessionRepo = new SessionRepository();
        const userId = result.data?.id_usuario || result.data?.id ||
          result.data?.id_user || result.data?.user_id;
        const token = await sessionRepo.createSession(userId);
        // Establecer cookie HttpOnly para mantener la sesión
        setCookie(c, "session_id", token, {
          httpOnly: true,
          path: "/",
          sameSite: "Lax",
          secure: new URL(c.req.url).protocol === "https:",
          maxAge: sessionRepo.maxAge,
        });
      }
      return c.json(result, status);
    } catch (error) {
      console.error("Error confirmando recuperacion de contrasena:", error);
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  async logout(c) {
    const sessionId = getCookie(c, "session_id");
    if (sessionId) {
      const sessionRepo = new SessionRepository();
      sessionRepo.deleteSession(sessionId);
    }

    setCookie(c, "session_id", "", {
      httpOnly: true,
      path: "/",
      sameSite: "Lax",
      maxAge: 0,
    });

    return c.json({ success: true });
  }

  async googleLogin(c) {
    const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
    if (!clientId) {
      return c.json({
        success: false,
        error: "Falta configurar GOOGLE_CLIENT_ID",
      }, 500);
    }

    const redirectUri = new URL(
      "/api/users/google/callback",
      c.req.url,
    ).toString();
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("prompt", "select_account");

    return c.redirect(authUrl.toString());
  }

  async googleCallback(c) {
    try {
      const code = c.req.query("code");
      const oauthError = c.req.query("error");
      if (oauthError) {
        return c.text(`Google rechazó el inicio de sesión: ${oauthError}`, 400);
      }
      if (!code) {
        return c.text("Falta el código de autorización de Google", 400);
      }

      const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
      const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
      if (!clientId || !clientSecret) {
        return c.text(
          "Falta configurar GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET",
          500,
        );
      }

      const redirectUri = new URL(
        "/api/users/google/callback",
        c.req.url,
      ).toString();
      const tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      });

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenBody,
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return c.text(`No se pudo validar Google: ${errorText}`, 401);
      }

      const tokenData = await tokenResponse.json();
      const userResponse = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        return c.text(
          `No se pudo obtener el perfil de Google: ${errorText}`,
          401,
        );
      }

      const googleUser = await userResponse.json();
      const email = googleUser.email || "";
      const firstName = googleUser.given_name ||
        googleUser.name?.split(" ")[0] ||
        email.split("@")[0] ||
        "Usuario";

      const sessionRepo = new SessionRepository();
      const token = await sessionRepo.createSession(googleUser.sub || email);
      setCookie(c, "session_id", token, {
        httpOnly: true,
        path: "/",
        sameSite: "Lax",
        secure: new URL(c.req.url).protocol === "https:",
        maxAge: sessionRepo.maxAge,
      });

      const userData = {
        id: googleUser.sub,
        first_name: firstName,
        name: googleUser.name || firstName,
        mail: email,
        email,
        picture: googleUser.picture,
        provider: "google",
      };
      const safeUserData = JSON.stringify(userData).replaceAll("</", "<\\/");

      return c.html(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Iniciando sesión...</title>
  </head>
  <body>
    <script>
      const userData = ${safeUserData};
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("userEmail", userData.mail || userData.email || "");
      localStorage.setItem("userName", userData.first_name || userData.name || "");
      sessionStorage.setItem("isLoggedIn", "true");
      window.location.replace((userData.mail || userData.email || "").toLowerCase() === "admin@duoc.cl" ? "/admin.html" : "/home.html");
    </script>
  </body>
</html>`);
    } catch (error) {
      return c.text(
        `Error al iniciar sesión con Google: ${error.message}`,
        500,
      );
    }
  }

  // GET /api/users/:id
  async getUserById(c) {
    try {
      const id = c.req.param("id");
      const result = await this.userService.getUserById(id);

      const status = result.success ? 200 : 404;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // GET /api/users/email/:mail
  async getUserByEmail(c) {
    try {
      const mail = decodeURIComponent(c.req.param("mail") || "").trim().toLowerCase();
      const result = await this.userService.getUserByEmail(mail);

      const status = result.success ? 200 : 404;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // GET /api/users/me
  async getCurrentUser(c) {
    try {
      const sessionId = getCookie(c, "session_id");
      const sessionRepo = new SessionRepository();
      const session = await sessionRepo.findSession(sessionId);

      if (!session?.userId) {
        return c.json({ success: false, error: "No autorizado" }, 401);
      }

      const sessionUserId = String(session.userId);
      let result = await this.userService.getUserById(sessionUserId);
      if (!result.success && sessionUserId.includes("@")) {
        result = await this.userService.getUserByEmail(sessionUserId);
      }
      const status = result.success ? 200 : 404;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  async deleteUserById(c) {
    try {
      const id = c.req.param("id");
      const result = await this.userService.deleteUser(id);
      const status = result?.success ? 200 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // POST /api/register
  async register(c) {
    try {
      const payload = await c.req.json();
      const result = await this.userService.register(payload);
      const status = result.success ? 201 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // NEW: CRUD - Update user by mail
  async updateUserByMail(c) {
    try {
      const mail = c.req.param("mail");
      const payload = await c.req.json();
      const result = await this.userService.updateUserByMail(mail, payload);
      const status = result?.success ? 200 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  async changePasswordByMail(c) {
    try {
      const mail = c.req.param("mail");
      const payload = await c.req.json();
      const result = await this.userService.changePasswordByMail(mail, payload);
      const status = result?.success ? 200 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  async requestPasswordReset(c) {
    try {
      const { email } = await c.req.json();
      const normalizedEmail = String(email || "").trim().toLowerCase();

      if (!normalizedEmail) {
        return c.json({ success: false, error: "Email requerido" }, 400);
      }

      const userResult = await this.userService.validateUserEmail(normalizedEmail);
      if (!userResult.success) {
        return c.json(userResult, 404);
      }

      const code = createResetCode();
      const expiresAt = Date.now() + RESET_CODE_TTL_MS;
      passwordResetCodes.set(normalizedEmail, {
        code,
        expiresAt,
      });

      const emailResult = await this.emailService.sendPasswordResetCode(normalizedEmail, code);
      const resetCookieValue = await createResetCookieValue({
        email: normalizedEmail,
        code,
        expiresAt,
      });
      setCookie(c, RESET_COOKIE_NAME, resetCookieValue, {
        httpOnly: true,
        path: "/",
        sameSite: "Lax",
        secure: new URL(c.req.url).protocol === "https:",
        maxAge: RESET_CODE_TTL_SECONDS,
      });

      const payload = {
        success: true,
        message: "Codigo de recuperacion enviado",
        expiresInSeconds: RESET_CODE_TTL_SECONDS,
      };

      if (emailResult.devMode) {
        payload.devResetCode = code;
      }

      return c.json(payload, 200);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  async confirmPasswordReset(c) {
    try {
      const { email, code, newPassword } = await c.req.json();
      const normalizedEmail = String(email || "").trim().toLowerCase();
      const normalizedCode = String(code || "").trim();
      let resetData = passwordResetCodes.get(normalizedEmail);

      if (!resetData) {
        const cookieResetData = await readResetCookieValue(
          getCookie(c, RESET_COOKIE_NAME),
        );

        if (cookieResetData?.email === normalizedEmail) {
          resetData = cookieResetData;
        }
      }

      if (!normalizedEmail || !normalizedCode || !newPassword) {
        return c.json({ success: false, error: "Email, codigo y nueva contrasena son requeridos" }, 400);
      }

      if (!resetData || resetData.expiresAt < Date.now()) {
        passwordResetCodes.delete(normalizedEmail);
        clearResetCookie(c);
        return c.json({ success: false, error: "Codigo expirado o inexistente" }, 400);
      }

      if (resetData.code !== normalizedCode) {
        return c.json({ success: false, error: "Codigo incorrecto" }, 400);
      }

      const result = await this.userService.resetPasswordByMail(normalizedEmail, newPassword);
      if (result.success) {
        passwordResetCodes.delete(normalizedEmail);
        clearResetCookie(c);
      }

      return c.json(result, result.success ? 200 : 400);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }

  // Delete user by mail
  async deleteUserByMail(c) {
    try {
      const mail = decodeURIComponent(c.req.param("mail") || "").trim().toLowerCase();
      const result = await this.userService.deleteUserByMail(mail);
      const status = result?.success ? 200 : 400;
      return c.json(result, status);
    } catch (error) {
      return c.json({
        success: false,
        error: "Error interno del servidor",
        message: error.message,
      }, 500);
    }
  }
}
