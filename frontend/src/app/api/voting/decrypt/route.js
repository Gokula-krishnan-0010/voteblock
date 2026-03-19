import "server-only";

import { decrypt }   from "@/server/paillierKeys";
import { ethers }    from "ethers";
import ElectionABI   from "@/abi/Election.json";
import { cookies }   from "next/headers";
import { verifyAdminSession } from "@/server/auth";  // your auth util

export async function POST(req) {
  // ── Auth guard — never skip this ──────────────────────────────
  const session = await verifyAdminSession(cookies());
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { electionAddress } = await req.json();

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer   = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(electionAddress, ElectionABI, signer);

  // 1. Get ordered candidate list
  const candidateIds   = await contract.getCandidateList();
  const candidateCount = candidateIds.length;

  // 2. Get all voters
  const voterList = await contract.getVoterList();

  // 3. Homomorphic accumulation — multiply ciphertexts per slot
  //    We work with BigInt strings; actual Paillier addition = (a * b) mod n²
  const { n, g }   = getPublicKey();            // reuse loaded keys
  const { PublicKey } = await import("paillier-bigint");
  const pubKey     = new PublicKey(BigInt(n), BigInt(g));

  let tallies = candidateIds.map(() => pubKey.encrypt(0n));  // E(0) identity

  for (const voterAddr of voterList) {
    const [, , hasVoted, encryptedVector] = await contract.getVoterInfo(voterAddr);
    if (!hasVoted || encryptedVector.length !== candidateCount) continue;

    for (let i = 0; i < candidateCount; i++) {
      tallies[i] = pubKey.addition(tallies[i], BigInt(encryptedVector[i]));
    }
  }

  // 4. Decrypt ONCE per slot — decrypt() uses the private key on the server
  const counts = tallies.map(t => Number(decrypt(t.toString())));

  const tally = Object.fromEntries(candidateIds.map((id, i) => [id, counts[i]]));

  // 5. Find and announce winner
  const winnerIndex = counts.indexOf(Math.max(...counts));
  const winnerId    = candidateIds[winnerIndex];

  const tx = await contract.announceWinner(winnerId);
  await tx.wait();

  return Response.json({ tally, winnerId, txHash: tx.hash });
}



// ## Client-Side Vote Encryption Flow

// The `paillierKeys.js` file **doesn't change client encryption at all** — that's intentional. Here's exactly how the two sides interact:
// ```
// Server (paillierKeys.js)                Client (VoterDashboard.jsx)
// ────────────────────────                ───────────────────────────
// getPublicKey() → {n, g}   ──GET──▶    fetch("/api/auth/public-key")
//                                         │
//                                         ▼
//                                        new PublicKey(BigInt(n), BigInt(g))
//                                        encryptVoteVector(chosenIndex, ...)
//                                        → string[]  (ciphertexts)
//                                         │
//                                        contract.castVote(string[])
//                                         │
//                                        stored on-chain in encryptedVoteVector

// POST /api/voting/tally    ◀──────      (admin triggers after election ends)
// decrypt(tally_ciphertext)              announces winner on-chain