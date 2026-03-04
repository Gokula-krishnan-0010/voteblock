'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
// import AdminABI from '@/lib/abis/Admin.json';

export default function CreateElection() {
  const router = useRouter();

  const [adminAddress, setAdminAddress] = useState('');
  const [electionName, setElectionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateElection = async () => {
    try {
      if (!window.ethereum) {
        alert("Install MetaMask");
        return;
      }

      setLoading(true);

      // Convert datetime-local to UNIX timestamp (seconds)
      const startUnix = Math.floor(new Date(startTime).getTime() / 1000);
      const endUnix = Math.floor(new Date(endTime).getTime() / 1000);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // const contract = new ethers.Contract(
      //   adminAddress,
      //   AdminABI.abi,
      //   signer
      // );

      // const tx = await contract.createElection(
      //   electionName,
      //   startUnix,
      //   endUnix
      // );

      // await tx.wait();

      alert("Election Created Successfully");

      router.push('/admin/dashboard');

    } catch (error) {
      console.error(error);
      alert("Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create New Election</h2>

      <input
        placeholder="Election Name"
        value={electionName}
        onChange={(e) => setElectionName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Admin Contract Address"
        value={adminAddress}
        onChange={(e) => setAdminAddress(e.target.value)}
      />
      <br /><br />

      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <br /><br />

      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <br /><br />

      <button onClick={handleCreateElection} disabled={loading}>
        {loading ? "Creating..." : "Create Election"}
      </button>
    </div>
  );
}