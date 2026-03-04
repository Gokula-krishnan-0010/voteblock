import "server-only";

import { PublicKey, PrivateKey } from "paillier-bigint";

// ── Validate env vars at startup ─────────────────────────────────────
const { 
  PAILLIER_N, 
  PAILLIER_G, 
  PAILLIER_LAMBDA, 
  PAILLIER_MU 
} = process.env;

if (!PAILLIER_N || !PAILLIER_G || !PAILLIER_LAMBDA || !PAILLIER_MU) {
  throw new Error(
    "Missing Paillier keys in environment variables. " +
    "Run: node src/scripts/generatePaillierKeys.js"
  );
}

// ── Reconstruct keys from env (BigInt-safe) ──────────────────────────
const n      = BigInt(PAILLIER_N);
const g      = BigInt(PAILLIER_G);
const lambda = BigInt(PAILLIER_LAMBDA);
const mu     = BigInt(PAILLIER_MU);

const publicKey  = new PublicKey(n, g);
const privateKey = new PrivateKey(lambda, mu, publicKey);

// ── Exports ──────────────────────────────────────────────────────────

// Used by API route to send public key to client
export function getPublicKey() {           // sync now — no await needed
  return {
    n: PAILLIER_N,                         // already strings from env
    g: PAILLIER_G,
  };
}

// Used by /api/voting/decrypt/route.js
export function decrypt(ciphertext) {      // sync now — no await needed
  return privateKey.decrypt(BigInt(ciphertext)).toString();
}