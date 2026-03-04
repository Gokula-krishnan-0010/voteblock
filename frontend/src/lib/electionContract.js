// src/lib/electionContract.js
'use client';

import { ethers } from "ethers";
import { getProvider, getSigner } from "@/lib/provider";
import ElectionABI from "@/abi/Election.json";

// ── Internal: get contract instance ─────────────────────────────────
function getElectionContract(electionAddress, signerOrProvider) {
  if (!ethers.isAddress(electionAddress)) {
    throw new Error("Invalid election contract address");
  }
  return new ethers.Contract(electionAddress, ElectionABI, signerOrProvider);
}

// ────────────────────────────────────────────────────────────────────
// ADMIN WRITES — requires MetaMask (signer) + must be election ADMIN
// ────────────────────────────────────────────────────────────────────

/**
 * ADMIN: Register a voter before election starts
 * 
 * @param {string} electionAddress  - Election contract address
 * @param {string} voterId          - unique voter ID string
 * @param {string} walletAddress    - voter's MetaMask wallet address
 */
export async function addVoter(electionAddress, voterId, walletAddress) {
  if (!voterId?.trim())              throw new Error("Voter ID cannot be empty");
  if (!ethers.isAddress(walletAddress)) throw new Error("Invalid wallet address");

  const signer   = await getSigner();
  const contract = getElectionContract(electionAddress, signer);

  // MetaMask popup
  const tx      = await contract.addVoter(voterId, walletAddress);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * ADMIN: Register a candidate before election starts
 * 
 * @param {string} electionAddress  - Election contract address
 * @param {string} candidateId      - unique candidate ID
 * @param {string} candidateName    - full name
 * @param {string} candidateParty   - party name
 */
export async function addCandidate(electionAddress, candidateId, candidateName, candidateParty) {
  if (!candidateId?.trim())   throw new Error("Candidate ID cannot be empty");
  if (!candidateName?.trim()) throw new Error("Candidate name cannot be empty");

  const signer   = await getSigner();
  const contract = getElectionContract(electionAddress, signer);

  // MetaMask popup
  const tx      = await contract.addCandidate(candidateId, candidateName, candidateParty);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * ADMIN: Announce winner after election ends
 * Off-chain decryption should happen before calling this.
 * 
 * @param {string} electionAddress  - Election contract address
 * @param {string} winnerId         - candidateId of the winner
 */
export async function announceWinner(electionAddress, winnerId) {
  if (!winnerId?.trim()) throw new Error("Winner ID cannot be empty");

  const signer   = await getSigner();
  const contract = getElectionContract(electionAddress, signer);

  // MetaMask popup
  const tx      = await contract.announceWinner(winnerId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

// ────────────────────────────────────────────────────────────────────
// VOTER WRITE — requires MetaMask (signer) + must be registered voter
// ────────────────────────────────────────────────────────────────────

/**
 * VOTER: Cast encrypted vote during election window
 * encryptedVote comes from src/lib/pallierEncrypt.js
 * 
 * @param {string} electionAddress  - Election contract address
 * @param {string} encryptedVote    - paillier ciphertext as string
 */
export async function castVote(electionAddress, encryptedVote) {
  if (!encryptedVote) throw new Error("Encrypted vote cannot be empty");

  const signer   = await getSigner();
  const contract = getElectionContract(electionAddress, signer);

  // MetaMask popup — voter signs and sends the transaction
  const tx      = await contract.castVote(encryptedVote);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

// ────────────────────────────────────────────────────────────────────
// READS — only needs provider (no MetaMask popup)
// ────────────────────────────────────────────────────────────────────

/**
 * Get all general info about an election
 */
export async function getElectionInfo(electionAddress) {
  const provider = getProvider();
  const contract  = getElectionContract(electionAddress, provider);

  const [
    name,
    startTime,
    endTime,
    voterCount,
    votedCount,
    candidateCount,
    winnerDeclared,
  ] = await Promise.all([
    contract.getElectionName(),
    contract.getStartTime(),
    contract.getEndTime(),
    contract.getRegisteredVoterCount(),
    contract.getVotedVoterCount(),
    contract.getCandidateCount(),
    contract.winnerDeclared(),
  ]);

  // Determine election status from timestamps
  const now = Math.floor(Date.now() / 1000);
  const start = Number(startTime);
  const end   = Number(endTime);

  let status;
  if (now < start)      status = "upcoming";
  else if (now <= end)  status = "active";
  else                  status = "ended";

  return {
    name,
    startTime:      new Date(start * 1000),
    endTime:        new Date(end   * 1000),
    voterCount:     Number(voterCount),
    votedCount:     Number(votedCount),
    candidateCount: Number(candidateCount),
    winnerDeclared,
    status,           // "upcoming" | "active" | "ended"
  };
}

/**
 * Get candidate details (public read)
 */
export async function getCandidateInfo(electionAddress, candidateId) {
  const provider = getProvider();
  const contract  = getElectionContract(electionAddress, provider);

  const [id, name, party] = await contract.getCandidateInfo(candidateId);
  return { candidateId: id, candidateName: name, candidateParty: party };
}

/**
 * ADMIN READ: Get voter details — signer must be the election admin
 */
export async function getVoterInfo(electionAddress, walletAddress) {
  if (!ethers.isAddress(walletAddress)) throw new Error("Invalid wallet address");

  const signer   = await getSigner();  // must be admin wallet
  const contract = getElectionContract(electionAddress, signer);

  const [voterId, wallet, hasVoted, encryptedVote] =
    await contract.getVoterInfo(walletAddress);

  return { voterId, wallet, hasVoted, encryptedVote };
}

/**
 * Get winner of a completed election (public read)
 */
export async function getWinner(electionAddress) {
  const provider = getProvider();
  const contract  = getElectionContract(electionAddress, provider);

  const [winner, declared] = await Promise.all([
    contract.WINNER(),
    contract.winnerDeclared(),
  ]);

  return { winner, winnerDeclared: declared };
}


// ---

// ## Complete Transaction Flow
// ```
// ──── ADMIN FLOW ─────────────────────────────────────────────────────

// SUPER_ADMIN                    Admin.sol               Election.sol
//     │                              │                        │
//     │  createElection(...)         │                        │
//     │─────────────────────────────▶│                        │
//     │  MetaMask popup              │  new Election(...)     │
//     │                              │───────────────────────▶│
//     │◀── { electionAddress } ──────│                        │
//     │                                                       │
//     │  addVoter(electionAddr, ...) │                        │
//     │──────────────────────────────────────────────────────▶│
//     │  MetaMask popup              │                        │
//     │                                                       │
//     │  addCandidate(...)           │                        │
//     │──────────────────────────────────────────────────────▶│
//     │  MetaMask popup              │                        │

// ──── VOTER FLOW ─────────────────────────────────────────────────────

// VOTER                    pallierEncrypt.js         Election.sol
//     │                              │                    │
//     │  fetch("/api/auth/public-key")                    │
//     │─────────────────────────────▶│                    │
//     │◀── { n, g } ─────────────────│                    │
//     │                              │                    │
//     │  encryptVote(candidateId)     │                    │
//     │─────────────────────────────▶│                    │
//     │◀── encryptedVote (string) ───│                    │
//     │                                                   │
//     │  castVote(electionAddr, encryptedVote)             │
//     │──────────────────────────────────────────────────▶│
//     │  MetaMask popup                                   │
//     │◀── { txHash, blockNumber } ──────────────────────│

// ──── TALLY FLOW (after election ends) ───────────────────────────────

// ADMIN          getVoterInfo()      /api/voting/decrypt    announceWinner()
//     │                │                     │                     │
//     │  fetch all     │                     │                     │
//     │  voted voters  │                     │                     │
//     │───────────────▶│                     │                     │
//     │◀── encryptedVotes[] ────────────────│                     │
//     │                                      │                     │
//     │  POST { encryptedVote }              │                     │
//     │─────────────────────────────────────▶│                     │
//     │◀── { candidateId } ─────────────────│                     │
//     │                                                            │
//     │  tally votes off-chain, find winner                        │
//     │                                                            │
//     │  announceWinner(electionAddr, winnerId)                    │
//     │───────────────────────────────────────────────────────────▶│
//     │  MetaMask popup                                            │