// Decodes the payload of a JWT for display purposes only (e.g. showing the
// user's name in the sidebar). This does NOT verify the signature — never
// use this for anything security-related, the backend already does that.
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}