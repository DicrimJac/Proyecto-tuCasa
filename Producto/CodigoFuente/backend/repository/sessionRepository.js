const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const textEncoder = new TextEncoder();

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

async function getSigningKey() {
  const secret = Deno.env.get("SESSION_SECRET") ||
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
    Deno.env.get("SUPABASE_ANON_KEY") ||
    "tu-casa-dev-session-secret";

  return await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value) {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value),
  );

  return base64UrlEncode(new Uint8Array(signature));
}

async function verify(value, signature) {
  const expectedSignature = await sign(value);
  return expectedSignature === signature;
}

// Stateless signed session cookie, safe for serverless/multi-instance deploys.
export class SessionRepository {
  maxAge = DEFAULT_SESSION_MAX_AGE;

  async createSession(userId) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      userId,
      iat: now,
      exp: now + this.maxAge,
    };
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = await sign(encodedPayload);

    return `${encodedPayload}.${signature}`;
  }

  async findSession(token) {
    if (!token || !token.includes(".")) return null;

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const isValid = await verify(encodedPayload, signature);
    if (!isValid) return null;

    try {
      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return {
        userId: payload.userId,
        createdAt: payload.iat ? payload.iat * 1000 : null,
      };
    } catch {
      return null;
    }
  }

  deleteSession(token) {
    return !!token;
  }
}
