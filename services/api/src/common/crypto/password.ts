import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [scheme, salt, stored] = encoded.split("$");
  if (scheme !== "scrypt" || !salt || !stored) return false;
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const expected = Buffer.from(stored, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
