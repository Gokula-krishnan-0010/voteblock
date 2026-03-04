'use client';

import { PublicKey } from "paillier-bigint";

export function encryptVote(vote, publicKeyData) {
  const n = BigInt(publicKeyData.n);
  const g = BigInt(publicKeyData.g);

  const publicKey = new PublicKey(n, g);

  const ciphertext = publicKey.encrypt(BigInt(vote));

  return ciphertext.toString();
}