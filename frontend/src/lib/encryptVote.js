'use client';

import { PublicKey } from "paillier-bigint"; 

export async function encryptVoteVector(chosenIndex, totalCandidates) {
  if (chosenIndex < 0 || chosenIndex >= totalCandidates) {
    throw new Error("Invalid candidate index");
  }

  // Fetch n and g from server — private key never exposed
  const res = await fetch("/api/voting/public-key");
  if (!res.ok) throw new Error("Failed to fetch public key");
  const { n, g } = await res.json();

  const pubKey = new PublicKey(BigInt(n), BigInt(g));

  return Array.from({ length: totalCandidates }, (_, i) =>
    pubKey.encrypt(BigInt(i === chosenIndex ? 1 : 0)).toString()
  );
}