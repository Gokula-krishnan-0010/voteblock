'use client';

import { ethers } from "ethers";

export function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}