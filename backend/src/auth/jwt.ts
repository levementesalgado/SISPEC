const SECRET = Deno.env.get("JWT_SECRET");
const TOKEN_TTL_SEC = 60 * 60;
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

export type TokenType = "access" | "refresh";

export interface AccessClaims {
  sub: string;
  username: string;
  role: string;
  type: "access";
  iat: number;
  exp: number;
  jti: string;
}

export interface RefreshClaims {
  sub: string;
  username: string;
  type: "refresh";
  iat: number;
  exp: number;
  jti: string;
}

export type Claims = AccessClaims | RefreshClaims;

export class AuthConfigError extends Error {}

function getSecret(): string {
  if (!SECRET) {
    throw new AuthConfigError(
      "JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar o servidor.",
    );
  }
  return SECRET;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeJson(value: unknown): string {
  return base64UrlEncode(encoder.encode(JSON.stringify(value)));
}

function decodeJson(value: string): unknown {
  return JSON.parse(decoder.decode(base64UrlDecode(value)));
}

async function hmacKey(usage: KeyUsage): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export function newJti(): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
}

export async function signAccessToken(
  user: { username: string; role: string },
  jti: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: AccessClaims = {
    sub: user.username,
    username: user.username,
    role: user.role,
    type: "access",
    iat: now,
    exp: now + TOKEN_TTL_SEC,
    jti,
  };
  const data = `${encodeJson(header)}.${encodeJson(payload)}`;
  const key = await hmacKey("sign");
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${base64UrlEncode(new Uint8Array(sig))}`;
}

export async function signRefreshToken(
  user: { username: string },
  jti: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: RefreshClaims = {
    sub: user.username,
    username: user.username,
    type: "refresh",
    iat: now,
    exp: now + REFRESH_TTL_SEC,
    jti,
  };
  const data = `${encodeJson(header)}.${encodeJson(payload)}`;
  const key = await hmacKey("sign");
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return `${data}.${base64UrlEncode(new Uint8Array(sig))}`;
}

export async function verifyToken(token: string, expected: TokenType): Promise<Claims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  let payload: Claims;
  try {
    payload = decodeJson(payloadB64) as Claims;
  } catch {
    return null;
  }

  if (payload.type !== expected) return null;
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  if (typeof payload.sub !== "string" || typeof payload.jti !== "string") return null;

  const key = await hmacKey("verify");
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlDecode(sigB64),
    encoder.encode(`${headerB64}.${payloadB64}`),
  );
  if (!valid) return null;

  return payload;
}

export const TOKEN_EXPIRY_SECONDS = TOKEN_TTL_SEC;
export const REFRESH_EXPIRY_SECONDS = REFRESH_TTL_SEC;
