'use client';

import { ethers } from "ethers";
import { getProvider, getSigner } from "@/lib/provider";
import AdminABI from "@/abi/Admin.json";

const ADMIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS;

// ── Internal: get contract instance ─────────────────────────────────
function getAdminContract(signerOrProvider) {
  if (!ADMIN_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS not set in .env");
  }
  return new ethers.Contract(ADMIN_CONTRACT_ADDRESS, AdminABI, signerOrProvider);
}

// ────────────────────────────────────────────────────────────────────
// WRITE — requires MetaMask (signer)
// ────────────────────────────────────────────────────────────────────

/**
 * SUPER_ADMIN: Deploy a new Election contract via Admin.sol
 * 
 * @param {string} adminAddress   - wallet address of the election admin
 * @param {string} electionName   - name of the election
 * @param {number} startTime      - unix timestamp (seconds)
 * @param {number} endTime        - unix timestamp (seconds)
 * @returns {string}              - address of the newly deployed Election contract
 */
export async function createElection(adminAddress, electionName, startTime, endTime) {
  const signer   = await getSigner();
  const contract = getAdminContract(signer);

  // Validate inputs before sending tx (save gas on obvious errors)
  if (!ethers.isAddress(adminAddress)) {
    throw new Error("Invalid admin wallet address");
  }
  if (!electionName?.trim()) {
    throw new Error("Election name cannot be empty");
  }

  const now = Math.floor(Date.now() / 1000);
  if (startTime <= now) throw new Error("Start time must be in the future");
  if (endTime <= startTime) throw new Error("End time must be after start time");

  // MetaMask popup appears here
  const tx      = await contract.createElection(
    adminAddress,
    electionName,
    startTime,
    endTime
  );

  const receipt = await tx.wait(); // wait for block confirmation

  // Parse ElectionCreated event to get the new contract address
  const event = receipt.logs
    .map(log => {
      try { return contract.interface.parseLog(log); }
      catch { return null; }
    })
    .find(e => e?.name === "ElectionCreated");

  if (!event) throw new Error("ElectionCreated event not found in receipt");

  const electionAddress = event.args.electionAddress;

  return {
    electionAddress,        // address of the new Election.sol
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

// ────────────────────────────────────────────────────────────────────
// READ — only needs provider (no MetaMask popup)
// ────────────────────────────────────────────────────────────────────

/**
 * Get all deployed election addresses
 * @returns {string[]} array of Election contract addresses
 */
export async function getAllElections() {
  const provider = getProvider();
  const contract  = getAdminContract(provider);
  const elections = await contract.getElections();
  return elections; // string[]
}