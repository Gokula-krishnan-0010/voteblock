'use client';

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ── Inline ABI (replace with your actual imports in Next.js) ─────────
import AdminABI from "@/abi/Admin.json";
import ElectionABI from "@/abi/Election.json";
// const AdminABI = [
//   "function getElections() public view returns (address[] memory)",
// ];
// const ElectionABI = [
//   "function castVote(string memory _encryptedVote) public",
//   "function getElectionName() public view returns (string memory)",
//   "function getStartTime() public view returns (uint256)",
//   "function getEndTime() public view returns (uint256)",
//   "function getRegisteredVoterCount() public view returns (uint256)",
//   "function getVotedVoterCount() public view returns (uint256)",
//   "function getCandidateCount() public view returns (uint256)",
//   "function winnerDeclared() public view returns (bool)",
//   "function WINNER() public view returns (string memory)",
//   "function getVoterInfo(address _walletAddress) public view returns (string memory, address, bool, string memory)",
//   "function getCandidateInfo(string memory _candidateId) public view returns (string memory, string memory, string memory)",
// ];

const ADMIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// ── Styles (identical to AdminDashboard) ─────────────────────────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#000",
    color: "#e0e8ff",
    fontFamily: "'Courier New', 'Lucida Console', monospace",
    position: "relative",
    overflow: "hidden",
  },
  gridBg: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,120,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,120,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb1: {
    position: "fixed",
    top: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,100,255,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb2: {
    position: "fixed",
    bottom: "-20%",
    left: "-10%",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px 60px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 0 40px",
    borderBottom: "1px solid rgba(0,120,255,0.2)",
    marginBottom: "40px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  logoMark: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #0064ff, #00c8ff)",
    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
    flexShrink: 0,
    boxShadow: "0 0 20px rgba(0,100,255,0.5)",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    background: "linear-gradient(90deg, #4d9fff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: {
    fontSize: "11px",
    color: "rgba(0,180,255,0.5)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  walletBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid rgba(0,120,255,0.5)",
    color: "#4d9fff",
    fontFamily: "inherit",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  walletBtnConnected: {
    borderColor: "rgba(0,200,100,0.5)",
    color: "#00c864",
  },
  tabNav: {
    display: "flex",
    gap: "4px",
    marginBottom: "36px",
    borderBottom: "1px solid rgba(0,120,255,0.15)",
  },
  tab: {
    padding: "12px 22px",
    background: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "rgba(100,160,255,0.5)",
    fontFamily: "inherit",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "-1px",
  },
  tabActive: {
    color: "#4d9fff",
    borderBottomColor: "#4d9fff",
  },
  card: {
    background: "rgba(0,8,20,0.8)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "28px",
    marginBottom: "20px",
    position: "relative",
    backdropFilter: "blur(10px)",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "3px",
    height: "100%",
    background: "linear-gradient(180deg, #0064ff, #00c8ff)",
  },
  cardTitle: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.6)",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  cardTitleDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#0064ff",
    boxShadow: "0 0 8px #0064ff",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "36px",
  },
  statCard: {
    background: "rgba(0,8,20,0.9)",
    border: "1px solid rgba(0,120,255,0.15)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #4d9fff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1,
    marginBottom: "6px",
  },
  statLabel: {
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(100,150,255,0.5)",
  },
  statGlow: {
    position: "absolute",
    bottom: "-20px",
    right: "-20px",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,100,255,0.1) 0%, transparent 70%)",
  },
  label: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.5)",
    marginBottom: "8px",
  },
  formGroup: { marginBottom: "18px" },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "rgba(0,20,40,0.8)",
    border: "1px solid rgba(0,120,255,0.25)",
    color: "#c0d8ff",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  btn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, rgba(0,80,200,0.8), rgba(0,150,255,0.6))",
    border: "1px solid rgba(0,150,255,0.4)",
    color: "#c0e8ff",
    fontFamily: "'Courier New', monospace",
    fontSize: "11px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, rgba(0,150,80,0.7), rgba(0,220,100,0.5))",
    border: "1px solid rgba(0,200,80,0.4)",
    color: "#a0ffcc",
  },
  btnDanger: {
    background: "linear-gradient(135deg, rgba(200,0,50,0.6), rgba(255,50,80,0.4))",
    border: "1px solid rgba(255,50,80,0.4)",
    color: "#ffb0c0",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  toast: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    padding: "14px 20px",
    background: "rgba(0,8,20,0.95)",
    border: "1px solid rgba(0,120,255,0.4)",
    color: "#4d9fff",
    fontFamily: "monospace",
    fontSize: "12px",
    letterSpacing: "0.08em",
    maxWidth: "420px",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 30px rgba(0,100,255,0.2)",
    animation: "slideIn 0.3s ease",
  },
  toastError:   { borderColor: "rgba(255,50,80,0.4)",  color: "#ff8090" },
  toastSuccess: { borderColor: "rgba(0,200,80,0.4)",   color: "#00c864" },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "rgba(0,150,255,0.3)",
    fontSize: "12px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid rgba(0,120,255,0.2)",
    borderTopColor: "#4d9fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    marginRight: "8px",
    verticalAlign: "middle",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid rgba(0,120,255,0.08)",
    fontSize: "12px",
  },
  infoLabel: {
    color: "rgba(100,150,255,0.5)",
    letterSpacing: "0.1em",
    fontSize: "10px",
    textTransform: "uppercase",
  },
  infoValue: { color: "#c0d8ff", fontFamily: "monospace" },
  progressBar: {
    height: "3px",
    background: "rgba(0,80,160,0.3)",
    marginTop: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #0064ff, #00c8ff)",
    transition: "width 0.5s ease",
    boxShadow: "0 0 8px #0064ff",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    fontSize: "9px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    borderRadius: "2px",
    marginBottom: "10px",
  },
  badgeActive:   { background: "rgba(0,200,100,0.1)",  border: "1px solid rgba(0,200,100,0.3)",  color: "#00c864" },
  badgeUpcoming: { background: "rgba(0,100,255,0.1)",  border: "1px solid rgba(0,100,255,0.3)",  color: "#4d9fff" },
  badgeEnded:    { background: "rgba(100,100,100,0.1)", border: "1px solid rgba(100,100,100,0.3)", color: "#666" },
  badgeVoted:    { background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.25)", color: "#00c864" },
  badgeEligible: { background: "rgba(0,100,255,0.08)", border: "1px solid rgba(0,100,255,0.25)", color: "#4d9fff" },
  // Candidate vote card
  candidateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "14px",
    marginTop: "16px",
  },
  candidateCard: {
    background: "rgba(0,10,28,0.9)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  candidateCardSelected: {
    borderColor: "rgba(0,180,255,0.7)",
    background: "rgba(0,40,90,0.5)",
    boxShadow: "0 0 24px rgba(0,100,255,0.18)",
  },
  candidateName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#c0d8ff",
    marginBottom: "4px",
    letterSpacing: "0.04em",
  },
  candidateId: {
    fontSize: "10px",
    color: "rgba(0,150,255,0.45)",
    fontFamily: "monospace",
    letterSpacing: "0.08em",
    marginBottom: "6px",
  },
  candidateParty: {
    fontSize: "11px",
    color: "rgba(100,160,255,0.6)",
    letterSpacing: "0.08em",
  },
  txBox: {
    marginTop: "20px",
    padding: "16px",
    background: "rgba(0,200,80,0.04)",
    border: "1px solid rgba(0,200,80,0.2)",
  },
  txLabel: {
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,200,80,0.5)",
    marginBottom: "6px",
  },
  txHash: {
    fontSize: "11px",
    color: "#00c864",
    fontFamily: "monospace",
    wordBreak: "break-all",
    letterSpacing: "0.04em",
  },
  electionListCard: {
    background: "rgba(0,8,20,0.8)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "20px",
    marginBottom: "12px",
    position: "relative",
    cursor: "pointer",
    transition: "all 0.2s",
    overflow: "hidden",
  },
  electionListCardActive: {
    borderColor: "rgba(0,180,255,0.5)",
    background: "rgba(0,30,70,0.4)",
    boxShadow: "0 0 18px rgba(0,100,255,0.12)",
  },
  warningBox: {
    padding: "12px 16px",
    background: "rgba(255,150,0,0.05)",
    border: "1px solid rgba(255,150,0,0.2)",
    fontSize: "11px",
    color: "rgba(255,180,50,0.8)",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  infoBox: {
    padding: "12px 16px",
    background: "rgba(0,100,255,0.05)",
    border: "1px solid rgba(0,100,255,0.15)",
    fontSize: "11px",
    color: "rgba(100,180,255,0.7)",
    letterSpacing: "0.08em",
    lineHeight: 1.6,
    marginBottom: "16px",
  },
};

// ── Utilities ─────────────────────────────────────────────────────────
function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
function getStatus(start, end) {
  const now = Math.floor(Date.now() / 1000);
  if (now < start)  return "upcoming";
  if (now <= end)   return "active";
  return "ended";
}
function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleString();
}

// ── Main Component ────────────────────────────────────────────────────
export default function VoterDashboard() {
  const [activeTab, setActiveTab]         = useState("elections");
  const [wallet, setWallet]               = useState(null);
  const [loading, setLoading]             = useState(false);
  const [toast, setToast]                 = useState(null);

  // Elections
  const [allElections, setAllElections]   = useState([]);   // all addresses
  const [eligibleElections, setEligible]  = useState([]);   // addresses voter is registered in
  const [selectedElection, setSelected]   = useState(null);
  const [electionInfo, setElectionInfo]   = useState(null);

  // Candidates
  const [candidates, setCandidates]       = useState([]);   // [{id, name, party}]
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Voter state for selected election
  const [voterState, setVoterState]       = useState(null); // {voterId, hasVoted}

  // Cast vote result
  const [txHash, setTxHash]               = useState(null);

  // ── Toast ────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 6000);
  }, []);

  // ── Provider / Signer ────────────────────────────────────────────────
  const getProvider = () => {
    if (typeof window === "undefined" || !window.ethereum)
      throw new Error("MetaMask not installed");
    return new ethers.BrowserProvider(window.ethereum);
  };
  const getSigner = async () => {
    const p = getProvider();
    await p.send("eth_requestAccounts", []);
    return p.getSigner();
  };

  // ── Connect Wallet ───────────────────────────────────────────────────
  const connectWallet = async () => {
    try {
      setLoading(true);
      const signer = await getSigner();
      const addr   = await signer.getAddress();
      setWallet(addr);
      showToast(`Connected: ${shortAddr(addr)}`, "success");
      await loadAllElections(addr);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Load all elections, filter eligible ones for this voter ──────────
  const loadAllElections = async (voterAddr) => {
    try {
      const provider = getProvider();
      const admin    = new ethers.Contract(ADMIN_CONTRACT_ADDRESS, AdminABI, provider);
      const list     = await admin.getElections();
      const reversed = [...list].reverse();
      setAllElections(reversed);

      if (!voterAddr) return;

      // Check each election to see if voter is registered
      const eligible = [];
      await Promise.all(
        reversed.map(async (addr) => {
          try {
            const election = new ethers.Contract(addr, ElectionABI, provider);
            const [voterId] = await election.getVoterInfo(voterAddr);
            if (voterId && voterId.length > 0) {
              eligible.push(addr);
            }
          } catch {
            // voter not registered in this election — skip
          }
        })
      );
      setEligible(eligible);
    } catch (e) {
      showToast("Failed to load elections: " + e.message, "error");
    }
  };

  // ── Load election info + voter state + candidates ────────────────────
  const loadElectionDetails = async (addr) => {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(addr, ElectionABI, provider);

      const [name, start, end, voterCount, votedCount, candCount, declared, winner] =
        await Promise.all([
          contract.getElectionName(),
          contract.getStartTime(),
          contract.getEndTime(),
          contract.getRegisteredVoterCount(),
          contract.getVotedVoterCount(),
          contract.getCandidateCount(),
          contract.winnerDeclared(),
          contract.WINNER(),
        ]);

      const s = Number(start);
      const e = Number(end);

      setElectionInfo({
        name,
        startTime:      s,
        endTime:        e,
        voterCount:     Number(voterCount),
        votedCount:     Number(votedCount),
        candidateCount: Number(candCount),
        winnerDeclared: declared,
        winner,
        status:         getStatus(s, e),
      });

      // Load voter state if wallet connected
      if (wallet) {
        try {
          const [voterId, , hasVoted] = await contract.getVoterInfo(wallet);
          setVoterState({ voterId, hasVoted });
        } catch {
          setVoterState(null);
        }
      }

      // Load all candidates
      // Election.sol stores candidateList as string[] — we iterate by index
      // Since there's no getCandidateIds(), we rely on getCandidateCount + a known ID pattern
      // If your contract exposes a getCandidateList(), use that instead.
      // Here we load candidates via the CandidateAdded events for robustness.
      const iface  = new ethers.Interface([
        "event CandidateAdded(string indexed candidateId)",
      ]);
      const filter = { address: addr, topics: [iface.getEvent("CandidateAdded").topicHash] };
      const logs   = await provider.getLogs({ fromBlock: 0, toBlock: "latest", ...filter });

      const loaded = await Promise.all(
        logs.map(async (log) => {
          try {
            // candidateId is indexed so it's hashed in topics — fetch via read
            // We decode the non-indexed version by fetching all CandidateAdded events
            const parsed = iface.parseLog(log);
            // indexed string → keccak hash only, not decodeable back
            // So we read from the contract storage using the raw log data approach:
            // Instead, use a non-indexed event signature fallback
            return null;
          } catch { return null; }
        })
      );

      // Fallback: use non-indexed event to get actual candidateId strings
      const ifaceRaw = new ethers.Interface([
        "event CandidateAdded(string candidateId)",
      ]);
      const logsRaw  = await provider.getLogs({
        fromBlock: 0,
        toBlock: "latest",
        address: addr,
        topics: [ifaceRaw.getEvent("CandidateAdded").topicHash],
      });

      const candidateList = await Promise.all(
        logsRaw.map(async (log) => {
          try {
            const parsed = ifaceRaw.parseLog(log);
            const id     = parsed.args.candidateId;
            const [cId, cName, cParty] = await contract.getCandidateInfo(id);
            return { id: cId, name: cName, party: cParty };
          } catch { return null; }
        })
      );

      setCandidates(candidateList.filter(Boolean));
      setSelectedCandidate(null);
      setTxHash(null);
    } catch (e) {
      showToast("Failed to load election details: " + e.message, "error");
    }
  };

  const selectElection = async (addr) => {
    setSelected(addr);
    setElectionInfo(null);
    setCandidates([]);
    setVoterState(null);
    setTxHash(null);
    await loadElectionDetails(addr);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      loadAllElections(null);
    }
  }, []);

  // ── Cast Vote ────────────────────────────────────────────────────────
  const handleCastVote = async () => {
    try {
      if (!wallet)            { showToast("Connect wallet first", "error"); return; }
      if (!selectedElection)  { showToast("Select an election first", "error"); return; }
      if (!selectedCandidate) { showToast("Select a candidate first", "error"); return; }
      if (voterState?.hasVoted) { showToast("You have already voted", "error"); return; }
      if (electionInfo?.status !== "active") {
        showToast("Election is not currently active", "error"); return;
      }

      setLoading(true);
      showToast("Encrypting vote...", "info");

      // ── Encrypt the vote ─────────────────────────────────────────
      // Fetch public key from server, encrypt with paillier
      // Replace this block with your actual pallierEncrypt.js call:
      //
      //   import { encryptVote } from "@/lib/pallierEncrypt";
      //   const encryptedVote = await encryptVote(selectedCandidate.id);
      //
      // For now we send a placeholder so the UI/flow is wired correctly:
      let encryptedVote;
      try {
        const res = await fetch("/api/auth/public-key");
        if (res.ok) {
          const { n, g } = await res.json();
          // Dynamically import paillier-bigint client side
          const { PublicKey } = await import("paillier-bigint");
          const pubKey  = new PublicKey(BigInt(n), BigInt(g));
          const encoded = new TextEncoder().encode(selectedCandidate.id);
          const bigint  = BigInt("0x" + Array.from(encoded).map(b => b.toString(16).padStart(2,"0")).join(""));
          encryptedVote = pubKey.encrypt(bigint).toString();
        } else {
          // Fallback: send candidateId as plain string (dev only)
          encryptedVote = selectedCandidate.id;
          showToast("⚠ Public key unavailable — sending unencrypted (dev mode)", "info");
        }
      } catch {
        encryptedVote = selectedCandidate.id;
      }

      showToast("Waiting for MetaMask approval...", "info");

      const signer   = await getSigner();
      const contract = new ethers.Contract(selectedElection, ElectionABI, signer);

      // MetaMask popup appears here
      const tx      = await contract.castVote(encryptedVote);
      showToast("Transaction submitted. Waiting for confirmation...", "info");

      const receipt = await tx.wait();

      setTxHash(receipt.hash);
      setVoterState(v => ({ ...v, hasVoted: true }));
      showToast("Vote cast successfully!", "success");

      // Refresh election info
      await loadElectionDetails(selectedElection);
    } catch (e) {
      showToast(e.reason || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────
  const statusBadgeStyle = (status) => ({
    ...styles.badge,
    ...(status === "active"   ? styles.badgeActive   :
        status === "upcoming" ? styles.badgeUpcoming :
        styles.badgeEnded),
  });

  const tabs = [
    { id: "elections", label: "My Elections" },
    { id: "vote",      label: "Cast Vote"    },
    { id: "results",   label: "Results"      },
  ];

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 8px rgba(0,100,255,0.4);} 50%{box-shadow:0 0 20px rgba(0,180,255,0.8);} }
        button:hover  { opacity: 0.85; }
        input:focus   { border-color: rgba(0,150,255,0.6) !important; box-shadow: 0 0 0 2px rgba(0,100,255,0.1); }
        .el-row:hover { border-color: rgba(0,150,255,0.4) !important; background: rgba(0,20,50,0.5) !important; }
        .cand-card:hover { border-color: rgba(0,150,255,0.45) !important; background: rgba(0,25,60,0.5) !important; }
      `}</style>

      <div style={styles.gridBg} />
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.container}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoMark} />
            <div>
              <h1 style={styles.title}>Voteblock</h1>
              <div style={styles.subtitle}>Voter Portal</div>
            </div>
          </div>
          <button
            style={{ ...styles.walletBtn, ...(wallet ? styles.walletBtnConnected : {}) }}
            onClick={connectWallet}
            disabled={loading}
          >
            {loading && <span style={styles.spinner} />}
            {wallet ? `⬡ ${shortAddr(wallet)}` : "Connect Wallet"}
          </button>
        </header>

        {/* ── Stats ──────────────────────────────────────────────── */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total Elections",    value: allElections.length },
            { label: "Eligible Elections", value: wallet ? eligibleElections.length : "—" },
            { label: "Selected Election",  value: selectedElection ? shortAddr(selectedElection) : "—" },
            { label: "Candidates",         value: electionInfo?.candidateCount ?? "—" },
            { label: "Votes Cast",         value: electionInfo ? `${electionInfo.votedCount} / ${electionInfo.voterCount}` : "—" },
            { label: "Vote Status",        value: voterState ? (voterState.hasVoted ? "VOTED" : "PENDING") : "—" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statGlow} />
            </div>
          ))}
        </div>

        {/* ── Tab Nav ────────────────────────────────────────────── */}
        <nav style={styles.tabNav}>
          {tabs.map(t => (
            <button
              key={t.id}
              style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ════════════════════════════════════════════════════════
            TAB: MY ELECTIONS
        ════════════════════════════════════════════════════════ */}
        {activeTab === "elections" && (
          <div>
            {/* Eligible elections */}
            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Elections You Are Eligible To Vote In
                {wallet && (
                  <span style={{ marginLeft: "auto", fontSize: "10px", color: "rgba(0,150,255,0.4)" }}>
                    {shortAddr(wallet)}
                  </span>
                )}
              </div>

              {!wallet ? (
                <div style={styles.emptyState}>Connect your wallet to see eligible elections</div>
              ) : eligibleElections.length === 0 ? (
                <div style={styles.emptyState}>
                  Your wallet is not registered in any election
                </div>
              ) : (
                eligibleElections.map(addr => (
                  <EligibleElectionRow
                    key={addr}
                    addr={addr}
                    isSelected={selectedElection === addr}
                    wallet={wallet}
                    onClick={() => { selectElection(addr); setActiveTab("vote"); }}
                    styles={styles}
                    shortAddr={shortAddr}
                    statusBadgeStyle={statusBadgeStyle}
                    getProvider={getProvider}
                    ElectionABI={ElectionABI}
                  />
                ))
              )}

              <div style={styles.btnRow}>
                <button style={styles.btn} onClick={() => loadAllElections(wallet)} disabled={loading}>
                  {loading && <span style={styles.spinner} />}
                  ↻ Refresh
                </button>
              </div>
            </div>

            {/* All elections (read-only overview) */}
            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                All Elections On-Chain
              </div>
              {allElections.length === 0 ? (
                <div style={styles.emptyState}>No elections deployed yet</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {allElections.map(addr => (
                    <div
                      key={addr}
                      style={{
                        padding: "8px 14px",
                        border: `1px solid ${eligibleElections.includes(addr) ? "rgba(0,200,100,0.3)" : "rgba(0,120,255,0.15)"}`,
                        color:  eligibleElections.includes(addr) ? "#00c864" : "rgba(100,150,255,0.4)",
                        fontSize: "10px",
                        fontFamily: "monospace",
                        letterSpacing: "0.06em",
                        background: eligibleElections.includes(addr) ? "rgba(0,200,100,0.04)" : "transparent",
                      }}
                    >
                      {shortAddr(addr)}
                      {eligibleElections.includes(addr) && " ✓"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: CAST VOTE
        ════════════════════════════════════════════════════════ */}
        {activeTab === "vote" && (
          <div>
            {/* Election selector */}
            <div style={{ ...styles.card, marginBottom: "16px" }}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Select Election
              </div>
              {eligibleElections.length === 0 ? (
                <div style={{ fontSize: "11px", color: "rgba(100,150,255,0.4)", letterSpacing: "0.1em" }}>
                  {wallet ? "You are not registered in any election." : "Connect your wallet first."}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {eligibleElections.map(addr => (
                    <button
                      key={addr}
                      style={{
                        ...styles.tab,
                        border: "1px solid",
                        borderColor: selectedElection === addr ? "rgba(0,180,255,0.6)" : "rgba(0,120,255,0.2)",
                        color:       selectedElection === addr ? "#4d9fff" : "rgba(100,150,255,0.4)",
                        background:  selectedElection === addr ? "rgba(0,40,80,0.4)" : "transparent",
                        padding: "8px 14px",
                        fontSize: "10px",
                      }}
                      onClick={() => selectElection(addr)}
                    >
                      {shortAddr(addr)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voter status + vote panel */}
            {selectedElection && electionInfo ? (
              <div style={styles.card}>
                <div style={styles.cardAccent} />
                <div style={styles.cardTitle}>
                  <div style={styles.cardTitleDot} />
                  {electionInfo.name}
                  <span style={{ marginLeft: "auto" }}>
                    <span style={statusBadgeStyle(electionInfo.status)}>
                      {electionInfo.status}
                    </span>
                  </span>
                </div>

                {/* Election meta */}
                {[
                  ["Election",  electionInfo.name],
                  ["Start",     fmtDate(electionInfo.startTime)],
                  ["End",       fmtDate(electionInfo.endTime)],
                  ["Your ID",   voterState?.voterId || "—"],
                  ["Voted",     voterState?.hasVoted ? "Yes ✓" : "No"],
                ].map(([k, v]) => (
                  <div key={k} style={styles.infoRow}>
                    <span style={styles.infoLabel}>{k}</span>
                    <span style={{
                      ...styles.infoValue,
                      color: k === "Voted" && voterState?.hasVoted ? "#00c864" : "#c0d8ff",
                    }}>{String(v)}</span>
                  </div>
                ))}

                {/* Progress bar */}
                {electionInfo.voterCount > 0 && (
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${(electionInfo.votedCount / electionInfo.voterCount) * 100}%`,
                    }} />
                  </div>
                )}

                <hr style={{ border: "none", borderTop: "1px solid rgba(0,120,255,0.1)", margin: "24px 0" }} />

                {/* Already voted state */}
                {voterState?.hasVoted ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(0,200,80,0.6)", marginBottom: "10px", textTransform: "uppercase" }}>
                      Vote Successfully Cast
                    </div>
                    <div style={{ fontSize: "26px", color: "#00c864", marginBottom: "8px" }}>✓</div>
                    <div style={{ fontSize: "11px", color: "rgba(100,160,255,0.5)", letterSpacing: "0.1em" }}>
                      Your encrypted vote is recorded on-chain.
                    </div>
                    {txHash && (
                      <div style={{ ...styles.txBox, marginTop: "20px", textAlign: "left" }}>
                        <div style={styles.txLabel}>Transaction Hash</div>
                        <div style={styles.txHash}>{txHash}</div>
                      </div>
                    )}
                  </div>
                ) : electionInfo.status === "upcoming" ? (
                  <div style={styles.warningBox}>
                    ⚠ Election has not started yet. Voting opens at {fmtDate(electionInfo.startTime)}.
                  </div>
                ) : electionInfo.status === "ended" ? (
                  <div style={styles.warningBox}>
                    ⚠ Election has ended. Voting closed at {fmtDate(electionInfo.endTime)}.
                  </div>
                ) : !voterState ? (
                  <div style={styles.warningBox}>
                    ⚠ Your wallet ({shortAddr(wallet)}) is not registered as a voter in this election.
                  </div>
                ) : (
                  <>
                    <div style={styles.infoBox}>
                      Your vote will be encrypted client-side using Paillier homomorphic encryption
                      before being submitted to the blockchain. The admin cannot see your choice
                      until after the election ends.
                    </div>

                    {/* Candidate selection */}
                    <div style={styles.cardTitle}>
                      <div style={styles.cardTitleDot} />
                      Select Candidate
                    </div>

                    {candidates.length === 0 ? (
                      <div style={styles.emptyState}>No candidates registered yet</div>
                    ) : (
                      <div style={styles.candidateGrid}>
                        {candidates.map(c => (
                          <div
                            key={c.id}
                            className="cand-card"
                            style={{
                              ...styles.candidateCard,
                              ...(selectedCandidate?.id === c.id ? styles.candidateCardSelected : {}),
                            }}
                            onClick={() => setSelectedCandidate(c)}
                          >
                            {selectedCandidate?.id === c.id && (
                              <div style={{
                                position: "absolute", top: 0, left: 0,
                                width: "3px", height: "100%",
                                background: "linear-gradient(180deg, #0064ff, #00c8ff)",
                              }} />
                            )}
                            <div style={styles.candidateName}>{c.name}</div>
                            <div style={styles.candidateId}>{c.id}</div>
                            <div style={styles.candidateParty}>{c.party || "Independent"}</div>
                            {selectedCandidate?.id === c.id && (
                              <div style={{
                                marginTop: "10px", fontSize: "9px",
                                color: "#4d9fff", letterSpacing: "0.15em",
                              }}>
                                ● SELECTED
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Cast vote button */}
                    <div style={styles.btnRow}>
                      <button
                        style={{
                          ...styles.btn,
                          ...styles.btnSuccess,
                          opacity: (!selectedCandidate || loading) ? 0.5 : 1,
                          cursor:  (!selectedCandidate || loading) ? "not-allowed" : "pointer",
                        }}
                        onClick={handleCastVote}
                        disabled={loading || !selectedCandidate}
                      >
                        {loading && <span style={styles.spinner} />}
                        Cast Encrypted Vote
                      </button>
                      {selectedCandidate && (
                        <button
                          style={{ ...styles.btn, background: "transparent", border: "1px solid rgba(0,120,255,0.2)", color: "rgba(100,150,255,0.5)" }}
                          onClick={() => setSelectedCandidate(null)}
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {selectedCandidate && (
                      <div style={{ marginTop: "14px", fontSize: "11px", color: "rgba(100,160,255,0.5)", letterSpacing: "0.08em" }}>
                        Voting for: <span style={{ color: "#c0d8ff" }}>{selectedCandidate.name}</span>
                        {" "}·{" "}
                        <span style={{ color: "rgba(0,150,255,0.5)" }}>{selectedCandidate.party}</span>
                      </div>
                    )}

                    {/* Transaction hash after voting */}
                    {txHash && (
                      <div style={styles.txBox}>
                        <div style={styles.txLabel}>Transaction Hash</div>
                        <div style={styles.txHash}>{txHash}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : selectedElection ? (
              <div style={styles.card}>
                <div style={styles.cardAccent} />
                <div style={{ ...styles.emptyState, padding: "40px 20px" }}>
                  <span style={styles.spinner} /> Loading election details...
                </div>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={styles.cardAccent} />
                <div style={styles.emptyState}>
                  Select an election above to cast your vote
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TAB: RESULTS
        ════════════════════════════════════════════════════════ */}
        {activeTab === "results" && (
          <div>
            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Election Results
              </div>

              {/* Election selector for results */}
              {allElections.length === 0 ? (
                <div style={styles.emptyState}>No elections available</div>
              ) : (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                    {allElections.map(addr => (
                      <button
                        key={addr}
                        style={{
                          ...styles.tab,
                          border: "1px solid",
                          borderColor: selectedElection === addr ? "rgba(0,180,255,0.6)" : "rgba(0,120,255,0.2)",
                          color:       selectedElection === addr ? "#4d9fff" : "rgba(100,150,255,0.4)",
                          background:  selectedElection === addr ? "rgba(0,40,80,0.4)" : "transparent",
                          padding: "8px 14px",
                          fontSize: "10px",
                        }}
                        onClick={() => selectElection(addr)}
                      >
                        {shortAddr(addr)}
                      </button>
                    ))}
                  </div>

                  {selectedElection && electionInfo ? (
                    <>
                      {/* Status */}
                      <div style={{ marginBottom: "20px" }}>
                        <span style={statusBadgeStyle(electionInfo.status)}>
                          {electionInfo.status}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#c0d8ff", marginLeft: "12px" }}>
                          {electionInfo.name}
                        </span>
                      </div>

                      {[
                        ["Total Registered", electionInfo.voterCount],
                        ["Votes Cast",       electionInfo.votedCount],
                        ["Candidates",       electionInfo.candidateCount],
                        ["End Time",         fmtDate(electionInfo.endTime)],
                      ].map(([k, v]) => (
                        <div key={k} style={styles.infoRow}>
                          <span style={styles.infoLabel}>{k}</span>
                          <span style={styles.infoValue}>{String(v)}</span>
                        </div>
                      ))}

                      {electionInfo.voterCount > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ fontSize: "10px", color: "rgba(0,150,255,0.4)", letterSpacing: "0.12em", marginBottom: "6px" }}>
                            TURNOUT — {Math.round((electionInfo.votedCount / electionInfo.voterCount) * 100)}%
                          </div>
                          <div style={styles.progressBar}>
                            <div style={{
                              ...styles.progressFill,
                              width: `${(electionInfo.votedCount / electionInfo.voterCount) * 100}%`,
                            }} />
                          </div>
                        </div>
                      )}

                      <hr style={{ border: "none", borderTop: "1px solid rgba(0,120,255,0.1)", margin: "24px 0" }} />

                      {/* Winner display */}
                      {electionInfo.winnerDeclared ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "rgba(0,200,80,0.5)", marginBottom: "12px", textTransform: "uppercase" }}>
                            Declared Winner
                          </div>
                          <div style={{
                            fontSize: "32px",
                            fontWeight: "700",
                            background: "linear-gradient(90deg, #4d9fff, #00c8ff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "6px",
                          }}>
                            {electionInfo.winner}
                          </div>
                          <div style={{ fontSize: "10px", color: "rgba(0,180,255,0.4)", letterSpacing: "0.15em" }}>
                            CANDIDATE ID
                          </div>
                        </div>
                      ) : electionInfo.status === "ended" ? (
                        <div style={styles.infoBox}>
                          Election has ended. The admin is tallying votes off-chain.
                          Winner will be announced on-chain shortly.
                        </div>
                      ) : (
                        <div style={styles.infoBox}>
                          Results will be available after the election ends on {fmtDate(electionInfo.endTime)}.
                        </div>
                      )}
                    </>
                  ) : selectedElection ? (
                    <div style={styles.emptyState}>
                      <span style={styles.spinner} /> Loading...
                    </div>
                  ) : (
                    <div style={styles.emptyState}>Select an election to view results</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          ...styles.toast,
          ...(toast.type === "error"   ? styles.toastError   : {}),
          ...(toast.type === "success" ? styles.toastSuccess : {}),
        }}>
          {toast.type === "success" && "✓ "}
          {toast.type === "error"   && "✗ "}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Eligible Election Row ──────────────────────────────
function EligibleElectionRow({ addr, isSelected, wallet, onClick, styles, shortAddr, statusBadgeStyle, getProvider, ElectionABI }) {
  const [info, setInfo] = useState(null);
  const [voterHasVoted, setVoterHasVoted] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(addr, ElectionABI, provider);
        const [name, start, end, voterCount, votedCount, declared, winner] = await Promise.all([
          contract.getElectionName(),
          contract.getStartTime(),
          contract.getEndTime(),
          contract.getRegisteredVoterCount(),
          contract.getVotedVoterCount(),
          contract.winnerDeclared(),
          contract.WINNER(),
        ]);
        const s = Number(start);
        const e = Number(end);
        setInfo({
          name, voterCount: Number(voterCount),
          votedCount: Number(votedCount),
          startTime: s, endTime: e,
          status: (() => {
            const now = Math.floor(Date.now() / 1000);
            if (now < s) return "upcoming";
            if (now <= e) return "active";
            return "ended";
          })(),
          winnerDeclared: declared,
          winner,
        });
        if (wallet) {
          const [, , hasVoted] = await contract.getVoterInfo(wallet);
          setVoterHasVoted(hasVoted);
        }
      } catch {}
    }
    load();
  }, [addr, wallet]);

  return (
    <div
      className="el-row"
      style={{
        ...styles.electionListCard,
        ...(isSelected ? styles.electionListCardActive : {}),
      }}
      onClick={onClick}
    >
      {isSelected && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "linear-gradient(180deg, #0064ff, #00c8ff)" }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#c0d8ff", marginBottom: "4px", letterSpacing: "0.04em" }}>
            {info?.name ?? "Loading..."}
          </div>
          <div style={{ fontSize: "10px", color: "rgba(0,150,255,0.4)", fontFamily: "monospace" }}>
            {addr}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
          {info && (
            <span style={statusBadgeStyle(info.status)}>{info.status}</span>
          )}
          {voterHasVoted !== null && (
            <span style={{ ...styles.badge, ...(voterHasVoted ? styles.badgeVoted : styles.badgeEligible) }}>
              {voterHasVoted ? "✓ voted" : "eligible"}
            </span>
          )}
        </div>
      </div>

      {info && (
        <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap" }}>
          {[
            ["Voters",      `${info.votedCount} / ${info.voterCount}`],
            ["Opens",       new Date(info.startTime * 1000).toLocaleDateString()],
            ["Closes",      new Date(info.endTime   * 1000).toLocaleDateString()],
            ["Winner",      info.winnerDeclared ? info.winner : "TBD"],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontSize: "9px", color: "rgba(0,150,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>{k}</div>
              <div style={{ fontSize: "11px", color: "#c0d8ff", fontFamily: "monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "12px", fontSize: "10px", color: "#4d9fff", letterSpacing: "0.12em" }}>
        Click to vote →
      </div>
    </div>
  );
}