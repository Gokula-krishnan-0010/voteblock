'use client';
import React from "react";
import { useRouter } from 'next/navigation';

export default function connectWallet() {
  const router = useRouter(); // Router for navigation

  async function connectMetamask() {
    if(!window.ethereum) {
      alert("Please install Metamask.");
      return;
    }

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
      alert("Metamask account connected.");
      router.push('/login');
    } catch(error) {
      console.log(error);
      alert("Please try again later.")
    }
  }

  return (
    <div>
      <button onClick={connectMetamask}>Connect Metamask</button>
    </div>
  );
}