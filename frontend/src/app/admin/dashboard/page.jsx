'use client';

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

// ── Inline ABI (replace with your actual imports in Next.js) ─────────
import AdminABI from "@/abi/Admin.json";
import ElectionABI from "@/abi/Election.json";
// const AdminABI = [
//   "function createElection(address _admin, string memory _electionName, uint256 _startTime, uint256 _endTime) public returns (address)",
//   "function getElections() public view returns (address[] memory)",
//   "event ElectionCreated(address indexed electionAddress, string electionName, address admin)"
// ];
// const ElectionABI = [
//   "function addVoter(string memory _voterId, address _walletAddress) public",
//   "function addCandidate(string memory _candidateId, string memory _candidateName, string memory _candidateParty) public",
//   "function announceWinner(string memory _winnerId) public",
//   "function getElectionName() public view returns (string memory)",
//   "function getStartTime() public view returns (uint256)",
//   "function getEndTime() public view returns (uint256)",
//   "function getRegisteredVoterCount() public view returns (uint256)",
//   "function getVotedVoterCount() public view returns (uint256)",
//   "function getCandidateCount() public view returns (uint256)",
//   "function winnerDeclared() public view returns (bool)",
//   "function WINNER() public view returns (string memory)",
//   "function ADMIN() public view returns (address)",
//   "function getVoterInfo(address _walletAddress) public view returns (string memory, address, bool, string memory)",
//   "function getCandidateInfo(string memory _candidateId) public view returns (string memory, string memory, string memory)"
// ];

const ADMIN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

// ── Styles ────────────────────────────────────────────────────────────
const styles = {
  // Layout
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

  // Header
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
    position: "relative",
    overflow: "hidden",
  },
  walletBtnConnected: {
    borderColor: "rgba(0,200,100,0.5)",
    color: "#00c864",
  },

  // Tab Nav
  tabNav: {
    display: "flex",
    gap: "4px",
    marginBottom: "36px",
    borderBottom: "1px solid rgba(0,120,255,0.15)",
    paddingBottom: "0",
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

  // Cards
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

  // Stats grid
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

  // Election list
  electionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  electionCard: {
    background: "rgba(0,8,20,0.8)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    overflow: "hidden",
  },
  electionCardSelected: {
    borderColor: "rgba(0,180,255,0.6)",
    background: "rgba(0,40,80,0.4)",
    boxShadow: "0 0 20px rgba(0,100,255,0.15)",
  },
  electionName: {
    fontSize: "14px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    color: "#c0d8ff",
    marginBottom: "8px",
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  electionAddr: {
    fontSize: "10px",
    color: "rgba(0,150,255,0.4)",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
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
  badgeActive: {
    background: "rgba(0,200,100,0.1)",
    border: "1px solid rgba(0,200,100,0.3)",
    color: "#00c864",
  },
  badgeUpcoming: {
    background: "rgba(0,100,255,0.1)",
    border: "1px solid rgba(0,100,255,0.3)",
    color: "#4d9fff",
  },
  badgeEnded: {
    background: "rgba(100,100,100,0.1)",
    border: "1px solid rgba(100,100,100,0.3)",
    color: "#666",
  },

  // Forms
  formGroup: { marginBottom: "18px" },
  label: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.5)",
    marginBottom: "8px",
  },
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  // Buttons
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
    position: "relative",
    overflow: "hidden",
  },
  btnSecondary: {
    background: "transparent",
    border: "1px solid rgba(0,120,255,0.3)",
    color: "rgba(0,180,255,0.7)",
  },
  btnDanger: {
    background: "linear-gradient(135deg, rgba(200,0,50,0.6), rgba(255,50,80,0.4))",
    border: "1px solid rgba(255,50,80,0.4)",
    color: "#ffb0c0",
  },
  btnSuccess: {
    background: "linear-gradient(135deg, rgba(0,150,80,0.7), rgba(0,220,100,0.5))",
    border: "1px solid rgba(0,200,80,0.4)",
    color: "#a0ffcc",
  },
  btnRow: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    flexWrap: "wrap",
  },

  // Toast/Status
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
    maxWidth: "400px",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
    boxShadow: "0 0 30px rgba(0,100,255,0.2)",
    animation: "slideIn 0.3s ease",
  },
  toastError: {
    borderColor: "rgba(255,50,80,0.4)",
    color: "#ff8090",
  },
  toastSuccess: {
    borderColor: "rgba(0,200,80,0.4)",
    color: "#00c864",
  },

  // Misc
  divider: {
    border: "none",
    borderTop: "1px solid rgba(0,120,255,0.12)",
    margin: "24px 0",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "rgba(0,150,255,0.3)",
    fontSize: "12px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },
  txLink: {
    fontSize: "10px",
    color: "rgba(0,180,255,0.5)",
    letterSpacing: "0.1em",
    wordBreak: "break-all",
    marginTop: "8px",
    display: "block",
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
  infoLabel: { color: "rgba(100,150,255,0.5)", letterSpacing: "0.1em", fontSize: "10px", textTransform: "uppercase" },
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
};

// ── Utility ───────────────────────────────────────────────────────────
function shortAddr(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
function getStatus(start, end) {
  const now = Math.floor(Date.now() / 1000);
  if (now < start) return "upcoming";
  if (now <= end)  return "active";
  return "ended";
}

// ── Main Component ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab]       = useState("overview");
  const [wallet, setWallet]             = useState(null);
  const [loading, setLoading]           = useState(false);
  const [toast, setToast]               = useState(null);
  const [elections, setElections]       = useState([]);
  const [selectedElection, setSelected] = useState(null);
  const [electionInfo, setElectionInfo] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    adminAddress: "", electionName: "",
    startDate: "", startTime: "",
    endDate: "", endTime: "",
  });
  const [voterForm, setVoterForm]   = useState({ voterId: "", walletAddress: "" });
  const [candForm, setCandForm]     = useState({ candidateId: "", candidateName: "", candidateParty: "" });
  const [winnerId, setWinnerId]     = useState("");

  // ── Toast helper ────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // ── Provider helpers ────────────────────────────────────────────────
  const getProvider = () => {
    if (typeof window === "undefined" || !window.ethereum)
      throw new Error("MetaMask not installed");
    return new ethers.BrowserProvider(window.ethereum);
  };
  const getSigner = async () => {
    const provider = getProvider();
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  };

  // ── Connect wallet ──────────────────────────────────────────────────
  const connectWallet = async () => {
    try {
      setLoading(true);
      const signer = await getSigner();
      const addr   = await signer.getAddress();
      setWallet(addr);
      showToast(`Connected: ${shortAddr(addr)}`, "success");
      await loadElections();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Load elections ──────────────────────────────────────────────────
  const loadElections = async () => {
    try {
      const provider = getProvider();

      const contract = new ethers.Contract(ADMIN_CONTRACT_ADDRESS, AdminABI, provider);
      const list     = await contract.getElections();
      setElections([...list].reverse()); // newest first
    } catch (e) {
      showToast("Failed to load elections: " + e.message, "error");
    }
  };

  // ── Load election info ──────────────────────────────────────────────
  const loadElectionInfo = async (addr) => {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(addr, ElectionABI, provider);
      const [name, start, end, voterCount, votedCount, candidateCount, declared, winner] =
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
      setElectionInfo({
        name,
        startTime: Number(start),
        endTime:   Number(end),
        voterCount: Number(voterCount),
        votedCount: Number(votedCount),
        candidateCount: Number(candidateCount),
        winnerDeclared: declared,
        winner,
        status: getStatus(Number(start), Number(end)),
      });
    } catch (e) {
      showToast("Failed to load election info: " + e.message, "error");
    }
  };

  const selectElection = async (addr) => {
    setSelected(addr);
    setElectionInfo(null);
    await loadElectionInfo(addr);
  };

  useEffect(() => {
    if (window.ethereum) loadElections();
  }, []);

  // ── Create Election ─────────────────────────────────────────────────
  const handleCreateElection = async () => {
    try {
      if (!wallet) { showToast("Connect wallet first", "error"); return; }
      const { adminAddress, electionName, startDate, startTime, endDate, endTime } = createForm;
      if (!adminAddress || !electionName || !startDate || !startTime || !endDate || !endTime) {
        showToast("All fields are required", "error"); return;
      }
      if (!ethers.isAddress(adminAddress)) {
        showToast("Invalid admin wallet address", "error"); return;
      }
      const startTs = Math.floor(new Date(`${startDate}T${startTime}`).getTime() / 1000);
      const endTs   = Math.floor(new Date(`${endDate}T${endTime}`).getTime() / 1000);
      const now     = Math.floor(Date.now() / 1000);
      if (startTs <= now)    { showToast("Start time must be in the future", "error"); return; }
      if (endTs <= startTs)  { showToast("End time must be after start time", "error"); return; }

      setLoading(true);
      showToast("Waiting for MetaMask approval...", "info");

      const signer   = await getSigner();
      const contract = new ethers.Contract(ADMIN_CONTRACT_ADDRESS, AdminABI, signer);
      const tx       = await contract.createElection(adminAddress, electionName, startTs, endTs);
      showToast("Transaction submitted. Waiting for confirmation...", "info");

      const receipt = await tx.wait();

      // Parse event for new address
      const iface     = new ethers.Interface(AdminABI);
      const event     = receipt.logs
        .map(log => { try { return iface.parseLog(log); } catch { return null; } })
        .find(e => e?.name === "ElectionCreated");

      const newAddr = event?.args?.electionAddress || "unknown";
      showToast(`Election created at ${shortAddr(newAddr)}`, "success");
      setCreateForm({ adminAddress: "", electionName: "", startDate: "", startTime: "", endDate: "", endTime: "" });
      await loadElections();
    } catch (e) {
      showToast(e.reason || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Add Voter ───────────────────────────────────────────────────────
  const handleAddVoter = async () => {
    try {
      if (!wallet)          { showToast("Connect wallet first", "error"); return; }
      if (!selectedElection){ showToast("Select an election first", "error"); return; }
      if (!voterForm.voterId.trim()) { showToast("Voter ID required", "error"); return; }
      if (!ethers.isAddress(voterForm.walletAddress)) { showToast("Invalid wallet address", "error"); return; }

      setLoading(true);
      showToast("Waiting for MetaMask approval...", "info");

      const signer   = await getSigner();
      const contract = new ethers.Contract(selectedElection, ElectionABI, signer);
      const tx       = await contract.addVoter(voterForm.voterId, voterForm.walletAddress);
      showToast("Transaction submitted...", "info");
      await tx.wait();

      showToast(`Voter ${voterForm.voterId} registered successfully`, "success");
      setVoterForm({ voterId: "", walletAddress: "" });
      await loadElectionInfo(selectedElection);
    } catch (e) {
      showToast(e.reason || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Add Candidate ───────────────────────────────────────────────────
  const handleAddCandidate = async () => {
    try {
      if (!wallet)          { showToast("Connect wallet first", "error"); return; }
      if (!selectedElection){ showToast("Select an election first", "error"); return; }
      if (!candForm.candidateId.trim())   { showToast("Candidate ID required", "error"); return; }
      if (!candForm.candidateName.trim()) { showToast("Candidate name required", "error"); return; }

      setLoading(true);
      showToast("Waiting for MetaMask approval...", "info");

      const signer   = await getSigner();
      const contract = new ethers.Contract(selectedElection, ElectionABI, signer);
      const tx       = await contract.addCandidate(candForm.candidateId, candForm.candidateName, candForm.candidateParty);
      showToast("Transaction submitted...", "info");
      await tx.wait();

      showToast(`Candidate ${candForm.candidateName} added successfully`, "success");
      setCandForm({ candidateId: "", candidateName: "", candidateParty: "" });
      await loadElectionInfo(selectedElection);
    } catch (e) {
      showToast(e.reason || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Announce Winner ─────────────────────────────────────────────────
  const handleAnnounceWinner = async () => {
    try {
      if (!wallet)          { showToast("Connect wallet first", "error"); return; }
      if (!selectedElection){ showToast("Select an election first", "error"); return; }
      if (!winnerId.trim()) { showToast("Winner candidate ID required", "error"); return; }

      setLoading(true);
      showToast("Waiting for MetaMask approval...", "info");

      const signer   = await getSigner();
      const contract = new ethers.Contract(selectedElection, ElectionABI, signer);
      const tx       = await contract.announceWinner(winnerId);
      showToast("Transaction submitted...", "info");
      await tx.wait();

      showToast(`Winner announced: ${winnerId}`, "success");
      setWinnerId("");
      await loadElectionInfo(selectedElection);
    } catch (e) {
      showToast(e.reason || e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      active:   styles.badgeActive,
      upcoming: styles.badgeUpcoming,
      ended:    styles.badgeEnded,
    };
    return { ...styles.badge, ...map[status] };
  };

  const tabs = [
    { id: "overview",   label: "Overview" },
    { id: "create",     label: "Create Election" },
    { id: "voters",     label: "Add Voters" },
    { id: "candidates", label: "Add Candidates" },
    { id: "winner",     label: "Announce Winner" },
  ];

  const totalVoters    = elections.length; // approximate
  const activeCount    = elections.filter((_, i) => electionInfo && getStatus(electionInfo.startTime, electionInfo.endTime) === "active").length;

  return (
    <div style={styles.root}>
      {/* CSS animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        button:hover { opacity: 0.85; }
        input:focus { border-color: rgba(0,150,255,0.6) !important; box-shadow: 0 0 0 2px rgba(0,100,255,0.1); }
        .election-card:hover { border-color: rgba(0,150,255,0.4) !important; background: rgba(0,20,50,0.4) !important; }
      `}</style>

      <div style={styles.gridBg} />
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.logoMark} />
            <div>
              <h1 style={styles.title}>VoteBlock</h1>
              <div style={styles.subtitle}>Admin Control Panel</div>
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

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { label: "Total Elections", value: elections.length },
            { label: "Selected Election", value: selectedElection ? shortAddr(selectedElection) : "—" },
            { label: "Voters Registered", value: electionInfo?.voterCount ?? "—" },
            { label: "Votes Cast", value: electionInfo?.votedCount ?? "—" },
            { label: "Candidates", value: electionInfo?.candidateCount ?? "—" },
            { label: "Status", value: electionInfo?.status?.toUpperCase() ?? "—" },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statGlow} />
            </div>
          ))}
        </div>

        {/* Tab Nav */}
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

        {/* ── Overview Tab ──────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div>
            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Deployed Elections
              </div>
              {elections.length === 0 ? (
                <div style={styles.emptyState}>No elections deployed yet</div>
              ) : (
                <div style={styles.electionGrid}>
                  {elections.map((addr, i) => (
                    <ElectionCard
                      key={addr}
                      addr={addr}
                      isSelected={selectedElection === addr}
                      onClick={() => { selectElection(addr); setActiveTab("voters"); }}
                      styles={styles}
                      statusBadge={statusBadge}
                      shortAddr={shortAddr}
                    />
                  ))}
                </div>
              )}
              <div style={styles.btnRow}>
                <button style={styles.btn} onClick={loadElections}>
                  ↻ Refresh Elections
                </button>
              </div>
            </div>

            {selectedElection && electionInfo && (
              <div style={styles.card}>
                <div style={styles.cardAccent} />
                <div style={styles.cardTitle}>
                  <div style={styles.cardTitleDot} />
                  Selected Election Details
                </div>
                {[
                  ["Name",         electionInfo.name],
                  ["Address",      selectedElection],
                  ["Status",       electionInfo.status?.toUpperCase()],
                  ["Start",        new Date(electionInfo.startTime * 1000).toLocaleString()],
                  ["End",          new Date(electionInfo.endTime * 1000).toLocaleString()],
                  ["Voters",       `${electionInfo.votedCount} / ${electionInfo.voterCount} voted`],
                  ["Candidates",   electionInfo.candidateCount],
                  ["Winner",       electionInfo.winnerDeclared ? electionInfo.winner : "Not declared"],
                ].map(([k, v]) => (
                  <div key={k} style={styles.infoRow}>
                    <span style={styles.infoLabel}>{k}</span>
                    <span style={styles.infoValue}>{String(v)}</span>
                  </div>
                ))}
                {electionInfo.voterCount > 0 && (
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${(electionInfo.votedCount / electionInfo.voterCount) * 100}%` }} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Create Election Tab ───────────────────────────────────── */}
        {activeTab === "create" && (
          <div style={styles.card}>
            <div style={styles.cardAccent} />
            <div style={styles.cardTitle}>
              <div style={styles.cardTitleDot} />
              Deploy New Election Contract
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Election Name</label>
              <input
                style={styles.input}
                placeholder="e.g. General Election 2025"
                value={createForm.electionName}
                onChange={e => setCreateForm(f => ({ ...f, electionName: e.target.value }))}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Election Admin Wallet Address</label>
              <input
                style={styles.input}
                placeholder="0x..."
                value={createForm.adminAddress}
                onChange={e => setCreateForm(f => ({ ...f, adminAddress: e.target.value }))}
              />
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={createForm.startDate}
                  onChange={e => setCreateForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="time"
                  style={styles.input}
                  value={createForm.startTime}
                  onChange={e => setCreateForm(f => ({ ...f, startTime: e.target.value }))}
                />
              </div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={createForm.endDate}
                  onChange={e => setCreateForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Time</label>
                <input
                  type="time"
                  style={styles.input}
                  value={createForm.endTime}
                  onChange={e => setCreateForm(f => ({ ...f, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div style={styles.btnRow}>
              <button style={styles.btn} onClick={handleCreateElection} disabled={loading}>
                {loading && <span style={styles.spinner} />}
                Deploy Election Contract
              </button>
            </div>
          </div>
        )}

        {/* ── Add Voters Tab ────────────────────────────────────────── */}
        {activeTab === "voters" && (
          <div>
            <ElectionSelector
              elections={elections}
              selected={selectedElection}
              onSelect={selectElection}
              styles={styles}
              shortAddr={shortAddr}
            />

            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Register Voter
                {selectedElection && <span style={{ color: "rgba(0,150,255,0.4)", marginLeft: "auto", fontSize: "10px" }}>{shortAddr(selectedElection)}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Voter ID</label>
                <input
                  style={styles.input}
                  placeholder="e.g. VOTER_001"
                  value={voterForm.voterId}
                  onChange={e => setVoterForm(f => ({ ...f, voterId: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Voter Wallet Address</label>
                <input
                  style={styles.input}
                  placeholder="0x..."
                  value={voterForm.walletAddress}
                  onChange={e => setVoterForm(f => ({ ...f, walletAddress: e.target.value }))}
                />
              </div>

              <div style={styles.btnRow}>
                <button style={styles.btn} onClick={handleAddVoter} disabled={loading || !selectedElection}>
                  {loading && <span style={styles.spinner} />}
                  Register Voter
                </button>
              </div>
              {!selectedElection && (
                <div style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,150,50,0.7)", letterSpacing: "0.1em" }}>
                  ⚠ Select an election above first
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Add Candidates Tab ────────────────────────────────────── */}
        {activeTab === "candidates" && (
          <div>
            <ElectionSelector
              elections={elections}
              selected={selectedElection}
              onSelect={selectElection}
              styles={styles}
              shortAddr={shortAddr}
            />

            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Register Candidate
                {selectedElection && <span style={{ color: "rgba(0,150,255,0.4)", marginLeft: "auto", fontSize: "10px" }}>{shortAddr(selectedElection)}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Candidate ID</label>
                <input
                  style={styles.input}
                  placeholder="e.g. CAND_001"
                  value={candForm.candidateId}
                  onChange={e => setCandForm(f => ({ ...f, candidateId: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. John Smith"
                  value={candForm.candidateName}
                  onChange={e => setCandForm(f => ({ ...f, candidateName: e.target.value }))}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Party</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Democratic Party"
                  value={candForm.candidateParty}
                  onChange={e => setCandForm(f => ({ ...f, candidateParty: e.target.value }))}
                />
              </div>

              <div style={styles.btnRow}>
                <button style={styles.btn} onClick={handleAddCandidate} disabled={loading || !selectedElection}>
                  {loading && <span style={styles.spinner} />}
                  Register Candidate
                </button>
              </div>
              {!selectedElection && (
                <div style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,150,50,0.7)", letterSpacing: "0.1em" }}>
                  ⚠ Select an election above first
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Announce Winner Tab ───────────────────────────────────── */}
        {activeTab === "winner" && (
          <div>
            <ElectionSelector
              elections={elections}
              selected={selectedElection}
              onSelect={selectElection}
              styles={styles}
              shortAddr={shortAddr}
            />

            <div style={styles.card}>
              <div style={styles.cardAccent} />
              <div style={styles.cardTitle}>
                <div style={styles.cardTitleDot} />
                Announce Election Winner
              </div>

              {electionInfo?.winnerDeclared ? (
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "rgba(0,200,80,0.6)", marginBottom: "12px", textTransform: "uppercase" }}>
                    Winner Already Declared
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700", background: "linear-gradient(90deg, #4d9fff, #00c8ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {electionInfo.winner}
                  </div>
                </div>
              ) : (
                <>
                  {electionInfo && electionInfo.status !== "ended" && (
                    <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(255,150,0,0.05)", border: "1px solid rgba(255,150,0,0.2)", fontSize: "11px", color: "rgba(255,180,50,0.8)", letterSpacing: "0.1em" }}>
                      ⚠ Election must end before announcing a winner. Current status: {electionInfo.status?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ marginBottom: "16px", padding: "12px 16px", background: "rgba(0,100,255,0.05)", border: "1px solid rgba(0,100,255,0.15)", fontSize: "11px", color: "rgba(100,180,255,0.7)", letterSpacing: "0.08em", lineHeight: 1.6 }}>
                    Decrypt all votes off-chain via <code style={{ color: "#4d9fff" }}>/api/voting/decrypt</code>, tally them, then enter the winning candidate ID below.
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Winning Candidate ID</label>
                    <input
                      style={styles.input}
                      placeholder="e.g. CAND_001"
                      value={winnerId}
                      onChange={e => setWinnerId(e.target.value)}
                    />
                  </div>
                  <div style={styles.btnRow}>
                    <button
                      style={{ ...styles.btn, ...styles.btnSuccess }}
                      onClick={handleAnnounceWinner}
                      disabled={loading || !selectedElection}
                    >
                      {loading && <span style={styles.spinner} />}
                      Announce Winner On-Chain
                    </button>
                  </div>
                </>
              )}
              {!selectedElection && (
                <div style={{ marginTop: "12px", fontSize: "11px", color: "rgba(255,150,50,0.7)", letterSpacing: "0.1em" }}>
                  ⚠ Select an election above first
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
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

// ── Sub-components ────────────────────────────────────────────────────

function ElectionCard({ addr, isSelected, onClick, styles, statusBadge, shortAddr }) {
  return (
    <div
      className="election-card"
      style={{ ...styles.electionCard, ...(isSelected ? styles.electionCardSelected : {}) }}
      onClick={onClick}
    >
      {isSelected && <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "linear-gradient(180deg, #0064ff, #00c8ff)" }} />}
      <span style={styles.electionName}>Election Contract</span>
      <div style={styles.electionAddr}>{addr}</div>
      {isSelected && (
        <div style={{ marginTop: "8px", fontSize: "10px", color: "#4d9fff", letterSpacing: "0.12em" }}>
          ● SELECTED
        </div>
      )}
    </div>
  );
}

function ElectionSelector({ elections, selected, onSelect, styles, shortAddr }) {
  return (
    <div style={{ ...styles.card, marginBottom: "16px" }}>
      <div style={styles.cardAccent} />
      <div style={styles.cardTitle}>
        <div style={styles.cardTitleDot} />
        Select Election
      </div>
      {elections.length === 0 ? (
        <div style={{ fontSize: "11px", color: "rgba(100,150,255,0.4)", letterSpacing: "0.1em" }}>
          No elections available. Create one first.
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {elections.map(addr => (
            <button
              key={addr}
              style={{
                ...styles.tab,
                border: "1px solid",
                borderColor: selected === addr ? "rgba(0,180,255,0.6)" : "rgba(0,120,255,0.2)",
                color: selected === addr ? "#4d9fff" : "rgba(100,150,255,0.4)",
                background: selected === addr ? "rgba(0,40,80,0.4)" : "transparent",
                padding: "8px 14px",
                fontSize: "10px",
              }}
              onClick={() => onSelect(addr)}
            >
              {shortAddr(addr)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}