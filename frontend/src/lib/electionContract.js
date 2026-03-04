'use client';

import { ethers } from "ethers";
import electionAbi from "../abi/Election.json";
import { getSigner, getProvider } from "./provider";

export async function getElectionContract(address) {
  if(withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(address, electionAbi, signer);
  }

  const provider = getProvider();
  return new ethers.Contract(address, electionAbi, provider);
}