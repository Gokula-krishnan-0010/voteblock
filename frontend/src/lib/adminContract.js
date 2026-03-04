'use client';

import { ethers } from "ethers";
import adminAbi from "../abi/Admin.json";
import { getSigner, getProvider } from "./provider";

const ADMIN_ADDRESS = process.env.PUBLIC_ADMIN_ADDRESS;

export async function getAdminContract(withSigner = false) {
  if(withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(ADMIN_ADDRESS, adminAbi, signer);
  }

  const provider = getProvider();
  return new ethers.Contract(ADMIN_ADDRESS, adminAbi, provider);
}