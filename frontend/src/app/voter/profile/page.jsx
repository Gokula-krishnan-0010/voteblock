"use client";

import { useEffect, useState } from "react";
import { getAdminContract } from "../../../lib/adminContract";
import { getElectionContract } from "../../../lib/electionContract";
import { getSigner } from "../../../lib/provider";

export default function VoterDashboard() {
  const [wallet, setWallet] = useState("");
  const [eligibleElections, setEligibleElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEligibleElections();
  }, []);

  async function loadEligibleElections() {
    try {
      const signer = await getSigner();
      const userAddress = await signer.getAddress();
      setWallet(userAddress);

      const admin = await getAdminContract();
      const elections = await admin.getElections();

      const eligible = [];

      for (let i = 0; i < elections.length; i++) {
        const electionAddress = elections[i];
        const election = await getElectionContract(electionAddress);

        try {
          const voterInfo = await election.getVoterInfo(userAddress);

          const name = await election.getElectionName();
          const startTime = await election.getStartTime();
          const endTime = await election.getEndTime();

          eligible.push({
            address: electionAddress,
            name,
            start: Number(startTime),
            end: Number(endTime),
            hasVoted: voterInfo[2],
          });
        } catch (err) {
          // not eligible → skip
        }
      }

      setEligibleElections(eligible);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Voter Dashboard</h2>
      <p><strong>Connected Wallet:</strong> {wallet}</p>

      {loading && <p>Loading elections...</p>}

      {!loading && eligibleElections.length === 0 && (
        <p>No eligible elections found.</p>
      )}

      {eligibleElections.map((election, index) => (
        <div
          key={index}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "8px",
          }}
        >
          <h3>{election.name}</h3>
          <p><strong>Contract:</strong> {election.address}</p>
          <p>
            <strong>Start:</strong>{" "}
            {new Date(election.start * 1000).toLocaleString()}
          </p>
          <p>
            <strong>End:</strong>{" "}
            {new Date(election.end * 1000).toLocaleString()}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {election.hasVoted ? "Already Voted" : "Not Voted"}
          </p>
        </div>
      ))}
    </div>
  );
}