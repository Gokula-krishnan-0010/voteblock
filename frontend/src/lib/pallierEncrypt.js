'use client';

import { PublicKey } from "paillier-bigint"; // ✅ import from the npm package

// ── Fetch public key from your server API ────────────────────────────
export async function fetchPublicKey() {
  const res = await fetch("/api/auth/public-key");

  if (!res.ok) throw new Error("Failed to fetch public key");

  const { n, g } = await res.json();

  // Reconstruct PublicKey object from the n and g strings
  return new PublicKey(BigInt(n), BigInt(g));  // ✅ correct usage
}

// ── Encrypt the vote ─────────────────────────────────────────────────
export async function encryptVote(candidateId) {
  const publicKey = await fetchPublicKey();

  // Convert candidateId string → BigInt for paillier
  const encoded  = new TextEncoder().encode(candidateId);
  const voteBigInt = BigInt("0x" + Buffer.from(encoded).toString("hex"));

  const ciphertext = publicKey.encrypt(voteBigInt);

  return ciphertext.toString(); // hex string → goes to castVote()
}