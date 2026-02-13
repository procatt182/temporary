/**
 * Checks if a string is already a valid SHA-256 hex hash (64 hex characters).
 */
export function isSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

/**
 * Hashes a string using SHA-256 in the browser using the Web Crypto API.
 * If the input is already a SHA-256 hash, returns it as-is (lowercase).
 */
export async function sha256(input: string): Promise<string> {
  if (isSha256(input)) {
    return input.toLowerCase();
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
