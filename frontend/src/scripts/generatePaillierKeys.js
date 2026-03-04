// src/scripts/generatePaillierKeys.js
// Run this ONCE: node src/scripts/generatePaillierKeys.js

import { generateRandomKeys } from "paillier-bigint";

const { publicKey, privateKey } = await generateRandomKeys(2048);

console.log("Add these to your .env.local:\n");
console.log(`PAILLIER_N=${publicKey.n.toString()}`);
console.log(`PAILLIER_G=${publicKey.g.toString()}`);
console.log(`PAILLIER_LAMBDA=${privateKey.lambda.toString()}`);
console.log(`PAILLIER_MU=${privateKey.mu.toString()}`);