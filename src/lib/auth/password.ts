import "server-only";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Password hashing with Node's built-in scrypt (memory-hard, no native deps).
 * Format: scrypt$N$r$p$saltB64$hashB64 — parameters are stored with the hash
 * so they can be raised later without invalidating existing passwords.
 */
const N = 2 ** 15;
const r = 8;
const p = 1;
const KEYLEN = 64;
const MAXMEM = 128 * N * r * 2;

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r, p, maxmem: MAXMEM });
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string | undefined | null): Promise<boolean> {
  if (!stored) return false;
  const [algo, n, rr, pp, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const params = { N: Number(n), r: Number(rr), p: Number(pp) };
  const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    ...params,
    maxmem: 128 * params.N * params.r * 2,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A dummy hash used to equalise timing when an account does not exist. */
let dummyHash: Promise<string> | null = null;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(12).toString("hex"));
  return dummyHash;
}
