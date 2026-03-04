"use client";

import { useEffect, useState } from "react";
import { getAdminContract } from "../../../lib/adminContract";
import { getElectionContract } from "../../../lib/electionContract";

export default function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [electionName, setElectionName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    loadElections();
  }, []);

  async function loadElections() {
    const admin = await getAdminContract();
    const addresses = await admin.getElections();
    setElections(addresses);
    setLoading(false);
  }

  async function createElection() {
    const admin = await getAdminContract(true);

    const start = Math.floor(new Date(startTime).getTime() / 1000);
    const end = Math.floor(new Date(endTime).getTime() / 1000);

    const tx = await admin.createElection(
      await admin.runner.getAddress(),
      electionName,
      start,
      end
    );

    await tx.wait();
    alert("Election Created!");
    loadElections();
  }

  async function addVoter(electionAddress) {
    const voterId = prompt("Enter Voter ID:");
    const wallet = prompt("Enter Wallet Address:");

    const election = await getElectionContract(electionAddress, true);
    const tx = await election.addVoter(voterId, wallet);
    await tx.wait();

    alert("Voter Added");
  }

  async function addCandidate(electionAddress) {
    const id = prompt("Candidate ID:");
    const name = prompt("Candidate Name:");
    const party = prompt("Candidate Party:");

    const election = await getElectionContract(electionAddress, true);
    const tx = await election.addCandidate(id, name, party);
    await tx.wait();

    alert("Candidate Added");
  }

  async function announceWinner(electionAddress) {
    const winnerId = prompt("Enter Winner Candidate ID:");

    const election = await getElectionContract(electionAddress, true);
    const tx = await election.declareWinner(winnerId);
    await tx.wait();

    alert("Winner Announced!");
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>

      <h2>Create Election</h2>
      <input
        type="text"
        placeholder="Election Name"
        value={electionName}
        onChange={(e) => setElectionName(e.target.value)}
      />
      <br /><br />

      <label>Start Time:</label>
      <input
        type="datetime-local"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      <br /><br />

      <label>End Time:</label>
      <input
        type="datetime-local"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
      />
      <br /><br />

      <button onClick={createElection}>Create Election</button>

      <hr />

      <h2>All Elections</h2>

      {loading && <p>Loading...</p>}

      {elections.map((address, index) => (
        <div
          key={index}
          style={{
            border: "1px solid gray",
            padding: "15px",
            marginBottom: "20px",
          }}
        >
          <p><strong>Contract:</strong> {address}</p>

          <button onClick={() => addVoter(address)}>
            Add Voter
          </button>

          <button onClick={() => addCandidate(address)}>
            Add Candidate
          </button>

          <button onClick={() => announceWinner(address)}>
            Announce Winner
          </button>
        </div>
      ))}
    </div>
  );
}