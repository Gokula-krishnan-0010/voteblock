import "server-only";
import { generateRandomKeys } from "paillier-bigint";

let keys = null;

export async function initKeys() {
  if (!keys) {
    keys = await generateRandomKeys(2048);
  }
  return keys;
}

export async function getPublicKey() {
  const { publicKey } = await initKeys();
  return {
    n: publicKey.n.toString(),
    g: publicKey.g.toString()
  };
}

export async function decrypt(ciphertext) {
  const { privateKey } = await initKeys();
  return privateKey.decrypt(BigInt(ciphertext)).toString();
}