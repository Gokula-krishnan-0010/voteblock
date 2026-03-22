import "server-only";
import { decrypt, getPublicKey } from "@/server/paillierKeys";
import { ethers }    from "ethers";
import ElectionABI   from "@/abi/Election.json";
// import { cookies }   from "next/headers";
// import { verifyAdminSession } from "@/server/auth";

export async function POST(req) {
  try {
    // ── Auth ─────────────────────────────────────────────────────
    // const session = await verifyAdminSession(cookies());
    // if (!session) {
    //   return Response.json({ error: "Unauthorized" }, { status: 401 });
    // }

    let body;
    try { body = await req.json(); }
    catch { return Response.json({ error: "Invalid request body" }, { status: 400 }); }

    const { electionAddress } = body;
    if (!electionAddress) {
      return Response.json({ error: "electionAddress required" }, { status: 400 });
    }

    if (!process.env.RPC_URL) {
      return Response.json({ error: "RPC_URL not configured" }, { status: 500 });
    }

    // ── Pure read-only — zero private keys ───────────────────────
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(electionAddress, ElectionABI, provider);

    // ── Candidates ───────────────────────────────────────────────
    const candidateIds   = await contract.getCandidateList();
    const candidateCount = candidateIds.length;
    if (candidateCount === 0) {
      return Response.json({ error: "No candidates registered" }, { status: 400 });
    }

    // ── Voters — now public after redeployment ───────────────────
    const voterList = await contract.getVoterList();
    if (voterList.length === 0) {
      return Response.json({ error: "No voters registered" }, { status: 400 });
    }

    // ── Homomorphic accumulation ─────────────────────────────────
    const { n, g }      = getPublicKey();
    const { PublicKey } = await import("paillier-bigint");
    const pubKey        = new PublicKey(BigInt(n), BigInt(g));

    let tallies = candidateIds.map(() => pubKey.encrypt(0n));
    let counted = 0;

    for (const voterAddr of voterList) {
      try {
        // ✅ getEncryptedVote — public, no auth needed
        const [hasVoted, encryptedVector] = await contract.getEncryptedVote(voterAddr);
        if (!hasVoted || encryptedVector.length !== candidateCount) continue;

        for (let i = 0; i < candidateCount; i++) {
          tallies[i] = pubKey.addition(tallies[i], BigInt(encryptedVector[i]));
        }
        counted++;
      } catch (err) {
        console.warn(`Skipping voter ${voterAddr}:`, err.message);
      }
    }

    // ── Decrypt once — private key stays in env ───────────────────
    const counts = tallies.map(t => Number(decrypt(t.toString())));
    const tally  = Object.fromEntries(candidateIds.map((id, i) => [id, counts[i]]));

    const winnerIndex = counts.indexOf(Math.max(...counts));
    const winnerId    = candidateIds[winnerIndex];

    // ✅ Return winnerId — MetaMask announces on-chain
    return Response.json({
      tally,
      winnerId,
      winnerVotes:       counts[winnerIndex],
      totalVotesCounted: counted,
    });

  } catch (err) {
    console.error("[/api/voting/tally] Error:", err);
    return Response.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}
// ```

// ---

// ### Complete Checklist
// ```
// □ Election.sol    → remove onlyAdmin from getVoterList()
// □ Compile         → npx hardhat compile
// □ Deploy          → npx hardhat run scripts/deploy.ts --network sepolia
// □ Copy ABI        → artifacts → src/abi/Election.json + Admin.json
// □ .env.local      → update NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS
// □ .env.local      → set RPC_URL to Alchemy Sepolia URL
// □ .env.local      → remove ADMIN_PRIVATE_KEY and SUPER_ADMIN_READ_KEY
// □ tally/route.js  → use simplified version above
// □ Restart         → ctrl+c → npm run dev