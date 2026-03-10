'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Styles (matches AdminDashboard / VoterDashboard system) ──────────
const styles = {
  root: {
    minHeight: "100vh",
    background: "#000",
    color: "#e0e8ff",
    fontFamily: "'Courier New', 'Lucida Console', monospace",
    position: "relative",
    overflowX: "hidden",
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
    width: "700px",
    height: "700px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,100,255,0.14) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb2: {
    position: "fixed",
    bottom: "-20%",
    left: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,200,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  glowOrb3: {
    position: "fixed",
    top: "40%",
    left: "30%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,80,200,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px 100px",
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "28px 0 40px",
    borderBottom: "1px solid rgba(0,120,255,0.2)",
    marginBottom: "0",
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
  headerTitle: {
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    background: "linear-gradient(90deg, #4d9fff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "11px",
    color: "rgba(0,180,255,0.5)",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginTop: "2px",
  },
  headerRight: {
    fontSize: "10px",
    color: "rgba(0,150,255,0.4)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },

  // ── Hero ─────────────────────────────────────────────────────────────
  hero: {
    textAlign: "center",
    padding: "90px 0 80px",
    position: "relative",
  },
  heroEyebrow: {
    fontSize: "10px",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.5)",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  heroEyebrowLine: {
    width: "40px",
    height: "1px",
    background: "rgba(0,150,255,0.3)",
  },
  heroTitle: {
    fontSize: "clamp(42px, 7vw, 80px)",
    fontWeight: "700",
    letterSpacing: "-0.01em",
    lineHeight: 1.05,
    background: "linear-gradient(135deg, #ffffff 0%, #4d9fff 50%, #00c8ff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 10px",
  },
  heroTitleAccent: {
    display: "block",
    fontSize: "clamp(42px, 7vw, 80px)",
    fontWeight: "700",
    background: "linear-gradient(90deg, #0064ff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDesc: {
    fontSize: "14px",
    color: "rgba(160,200,255,0.65)",
    letterSpacing: "0.06em",
    lineHeight: 1.8,
    maxWidth: "580px",
    margin: "28px auto 0",
  },

  // ── Login Buttons ─────────────────────────────────────────────────
  loginRow: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    marginTop: "52px",
    flexWrap: "wrap",
  },
  loginCard: {
    position: "relative",
    padding: "32px 48px",
    background: "rgba(0,8,20,0.85)",
    border: "1px solid rgba(0,120,255,0.3)",
    cursor: "pointer",
    transition: "all 0.25s",
    backdropFilter: "blur(12px)",
    minWidth: "220px",
    overflow: "hidden",
    textAlign: "center",
  },
  loginCardAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, #0064ff, #00c8ff)",
  },
  loginCardIcon: {
    fontSize: "28px",
    marginBottom: "12px",
    display: "block",
  },
  loginCardLabel: {
    fontSize: "10px",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.5)",
    marginBottom: "6px",
    display: "block",
  },
  loginCardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    background: "linear-gradient(90deg, #4d9fff, #00c8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "block",
    marginBottom: "10px",
  },
  loginCardDesc: {
    fontSize: "11px",
    color: "rgba(120,170,255,0.5)",
    letterSpacing: "0.06em",
    lineHeight: 1.6,
  },
  loginCardArrow: {
    display: "block",
    marginTop: "16px",
    fontSize: "11px",
    color: "#4d9fff",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
  },

  // ── Section ──────────────────────────────────────────────────────────
  section: {
    marginTop: "80px",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "32px",
  },
  sectionDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#0064ff",
    boxShadow: "0 0 8px #0064ff",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: "10px",
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.5)",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    color: "#c0d8ff",
    margin: "0 0 0 18px",
  },

  // ── How It Works Cards ───────────────────────────────────────────────
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "2px",
    background: "rgba(0,120,255,0.08)",
    border: "1px solid rgba(0,120,255,0.15)",
  },
  stepCard: {
    background: "rgba(0,5,15,0.95)",
    padding: "28px 24px",
    position: "relative",
    overflow: "hidden",
    transition: "background 0.2s",
  },
  stepNum: {
    fontSize: "48px",
    fontWeight: "700",
    color: "rgba(0,100,255,0.12)",
    lineHeight: 1,
    marginBottom: "16px",
    fontVariantNumeric: "tabular-nums",
  },
  stepIcon: {
    fontSize: "22px",
    marginBottom: "12px",
    display: "block",
  },
  stepTitle: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#4d9fff",
    marginBottom: "10px",
  },
  stepDesc: {
    fontSize: "11px",
    color: "rgba(160,200,255,0.55)",
    letterSpacing: "0.04em",
    lineHeight: 1.7,
  },
  stepGlow: {
    position: "absolute",
    top: "-30px",
    right: "-30px",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,80,255,0.06) 0%, transparent 70%)",
  },

  // ── Flowchart ─────────────────────────────────────────────────────────
  flowchartWrap: {
    background: "rgba(0,5,15,0.9)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "40px 32px",
    position: "relative",
    backdropFilter: "blur(10px)",
    overflowX: "auto",
  },
  flowchartInner: {
    minWidth: "700px",
  },
  flowRow: {
    display: "flex",
    alignItems: "center",
    gap: "0",
    marginBottom: "0",
  },
  flowNode: {
    flex: "0 0 auto",
    padding: "14px 20px",
    border: "1px solid rgba(0,120,255,0.35)",
    background: "rgba(0,20,50,0.7)",
    fontSize: "11px",
    letterSpacing: "0.06em",
    color: "#c0d8ff",
    textAlign: "center",
    position: "relative",
    minWidth: "130px",
  },
  flowNodeHighlight: {
    borderColor: "rgba(0,180,255,0.6)",
    background: "rgba(0,40,90,0.7)",
    boxShadow: "0 0 16px rgba(0,100,255,0.15)",
  },
  flowNodeSuccess: {
    borderColor: "rgba(0,200,80,0.5)",
    background: "rgba(0,40,20,0.7)",
  },
  flowNodeLabel: {
    fontSize: "8px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.4)",
    marginBottom: "4px",
    display: "block",
  },
  flowNodeValue: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#c0d8ff",
    fontFamily: "monospace",
  },
  flowArrow: {
    flex: "1 1 auto",
    height: "1px",
    background: "linear-gradient(90deg, rgba(0,120,255,0.4), rgba(0,200,255,0.4))",
    position: "relative",
    minWidth: "24px",
  },
  flowArrowHead: {
    position: "absolute",
    right: "-1px",
    top: "-4px",
    width: "0",
    height: "0",
    borderTop: "4px solid transparent",
    borderBottom: "4px solid transparent",
    borderLeft: "8px solid rgba(0,180,255,0.5)",
  },
  flowArrowLabel: {
    position: "absolute",
    top: "-16px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "8px",
    color: "rgba(0,180,255,0.4)",
    letterSpacing: "0.1em",
    whiteSpace: "nowrap",
  },
  flowSection: {
    marginBottom: "28px",
  },
  flowSectionLabel: {
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,150,255,0.35)",
    marginBottom: "12px",
    borderBottom: "1px solid rgba(0,120,255,0.08)",
    paddingBottom: "6px",
  },
  mathBox: {
    background: "rgba(0,30,60,0.6)",
    border: "1px solid rgba(0,100,255,0.2)",
    padding: "16px 20px",
    marginTop: "20px",
    fontFamily: "monospace",
  },
  mathTitle: {
    fontSize: "9px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.4)",
    marginBottom: "12px",
  },
  mathRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },
  mathLabel: {
    fontSize: "10px",
    color: "rgba(100,150,255,0.5)",
    minWidth: "120px",
    letterSpacing: "0.06em",
  },
  mathVal: {
    fontSize: "12px",
    color: "#4d9fff",
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },
  mathResult: {
    fontSize: "12px",
    color: "#00c864",
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },

  // ── Feature cards ────────────────────────────────────────────────────
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  featCard: {
    background: "rgba(0,8,20,0.8)",
    border: "1px solid rgba(0,120,255,0.18)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    backdropFilter: "blur(8px)",
  },
  featAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "3px",
    height: "100%",
    background: "linear-gradient(180deg, #0064ff, #00c8ff)",
  },
  featIcon: {
    fontSize: "20px",
    marginBottom: "12px",
    display: "block",
  },
  featTitle: {
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#4d9fff",
    marginBottom: "8px",
  },
  featDesc: {
    fontSize: "11px",
    color: "rgba(160,200,255,0.55)",
    letterSpacing: "0.04em",
    lineHeight: 1.7,
  },

  // ── Login Process ────────────────────────────────────────────────────
  loginProcessGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  loginProcessCard: {
    background: "rgba(0,8,20,0.8)",
    border: "1px solid rgba(0,120,255,0.18)",
    padding: "28px",
    position: "relative",
    backdropFilter: "blur(8px)",
  },
  loginProcessTitle: {
    fontSize: "11px",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "rgba(0,180,255,0.6)",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  processStep: {
    display: "flex",
    gap: "14px",
    marginBottom: "16px",
    alignItems: "flex-start",
  },
  processStepNum: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "1px solid rgba(0,120,255,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    color: "#4d9fff",
    flexShrink: 0,
    marginTop: "1px",
  },
  processStepText: {
    fontSize: "11px",
    color: "rgba(160,200,255,0.6)",
    letterSpacing: "0.04em",
    lineHeight: 1.7,
  },
  processStepBold: {
    color: "#c0d8ff",
    fontWeight: "600",
  },

  // ── Footer ────────────────────────────────────────────────────────────
  footer: {
    borderTop: "1px solid rgba(0,120,255,0.12)",
    marginTop: "80px",
    paddingTop: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  footerLeft: {
    fontSize: "10px",
    color: "rgba(0,150,255,0.3)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  footerRight: {
    fontSize: "10px",
    color: "rgba(0,150,255,0.25)",
    letterSpacing: "0.1em",
  },

  // ── Divider ───────────────────────────────────────────────────────────
  divider: {
    border: "none",
    borderTop: "1px solid rgba(0,120,255,0.1)",
    margin: "0",
  },

  // ── Inline code ───────────────────────────────────────────────────────
  code: {
    background: "rgba(0,60,120,0.25)",
    border: "1px solid rgba(0,120,255,0.2)",
    padding: "1px 6px",
    fontSize: "10px",
    color: "#4d9fff",
    fontFamily: "monospace",
    letterSpacing: "0.04em",
  },
};

// ── Sub-components ────────────────────────────────────────────────────

function SectionHeader({ label, title }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionDot} />
      <span style={styles.sectionLabel}>{label}</span>
      <span style={styles.sectionTitle}>{title}</span>
    </div>
  );
}

function FlowArrow({ label }) {
  return (
    <div style={styles.flowArrow}>
      {label && <span style={styles.flowArrowLabel}>{label}</span>}
      <div style={styles.flowArrowHead} />
    </div>
  );
}

function FlowNode({ label, value, highlight, success }) {
  return (
    <div style={{
      ...styles.flowNode,
      ...(highlight ? styles.flowNodeHighlight : {}),
      ...(success   ? styles.flowNodeSuccess   : {}),
    }}>
      {label && <span style={styles.flowNodeLabel}>{label}</span>}
      <span style={styles.flowNodeValue}>{value}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function HomePage() {
  const router  = useRouter();
  const [tick, setTick] = useState(0);

  // Animate the ticker for the live "heartbeat" in hero
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 3), 900);
    return () => clearInterval(id);
  }, []);

  const dots = ["●", "●●", "●●●"][tick];

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
        @keyframes scanline { 0%{transform:translateY(-100%);} 100%{transform:translateY(100vh);} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 20px rgba(0,100,255,0.4);} 50%{box-shadow:0 0 40px rgba(0,180,255,0.7);} }

        .fade-up-1 { animation: fadeUp 0.7s ease both; animation-delay: 0.1s; }
        .fade-up-2 { animation: fadeUp 0.7s ease both; animation-delay: 0.25s; }
        .fade-up-3 { animation: fadeUp 0.7s ease both; animation-delay: 0.4s; }
        .fade-up-4 { animation: fadeUp 0.7s ease both; animation-delay: 0.55s; }
        .fade-up-5 { animation: fadeUp 0.7s ease both; animation-delay: 0.7s; }

        .login-card:hover {
          border-color: rgba(0,180,255,0.6) !important;
          background: rgba(0,30,70,0.9) !important;
          box-shadow: 0 0 40px rgba(0,100,255,0.2), inset 0 0 20px rgba(0,80,200,0.05);
          transform: translateY(-3px);
        }
        .step-card:hover {
          background: rgba(0,10,28,0.98) !important;
        }
        .feat-card:hover {
          border-color: rgba(0,150,255,0.35) !important;
          background: rgba(0,12,28,0.9) !important;
        }
        .logo-pulse {
          animation: glow 2.5s ease-in-out infinite;
        }
        ::selection { background: rgba(0,100,255,0.3); color: #fff; }
      `}</style>

      {/* Backgrounds */}
      <div style={styles.gridBg} />
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />
      <div style={styles.glowOrb3} />

      <div style={styles.container}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <header style={styles.header} className="fade-up-1">
          <div style={styles.headerLeft}>
            <div style={styles.logoMark} className="logo-pulse" />
            <div>
              <h1 style={styles.headerTitle}>VoteBlock</h1>
              <div style={styles.headerSubtitle}>Blockchain Voting System</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <span style={{ color: "#00c864", animation: "pulse 1.2s infinite" }}>⬤</span>
            {" "}On-Chain {dots}
          </div>
        </header>

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section style={styles.hero}>
          <div style={styles.heroEyebrow} className="fade-up-1">
            <div style={styles.heroEyebrowLine} />
            Decentralised · Encrypted · Verifiable
            <div style={styles.heroEyebrowLine} />
          </div>
          <h2 style={styles.heroTitle} className="fade-up-2">
            Trustless Voting
            <span style={styles.heroTitleAccent}>On the Blockchain.</span>
          </h2>
          <p style={styles.heroDesc} className="fade-up-3">
            VoteBlock uses <strong style={{ color: "#4d9fff" }}>Paillier homomorphic encryption</strong> to
            ensure every vote is counted without ever being revealed.
            Ballots are cast on-chain, tallied server-side, and results
            are announced immutably — no trust required.
          </p>

          {/* ── Login Buttons ──────────────────────────────────── */}
          <div style={styles.loginRow} className="fade-up-4">
            <div
              className="login-card"
              style={styles.loginCard}
              onClick={() => router.push("/voter/dashboard")}
            >
              <div style={styles.loginCardAccent} />
              <span style={styles.loginCardIcon}>⬡</span>
              <span style={styles.loginCardLabel}>Portal</span>
              <span style={styles.loginCardTitle}>Voter</span>
              <span style={styles.loginCardDesc}>
                Connect your wallet, view eligible elections, and cast
                your encrypted vote.
              </span>
              <span style={styles.loginCardArrow}>Enter Portal →</span>
            </div>

            <div
              className="login-card"
              style={{
                ...styles.loginCard,
                borderColor: "rgba(0,150,255,0.4)",
              }}
              onClick={() => router.push("/admin/dashboard")}
            >
              <div style={{
                ...styles.loginCardAccent,
                background: "linear-gradient(90deg, #0040cc, #0088ff)",
              }} />
              <span style={styles.loginCardIcon}>◈</span>
              <span style={styles.loginCardLabel}>Control Panel</span>
              <span style={styles.loginCardTitle}>Admin</span>
              <span style={styles.loginCardDesc}>
                Deploy elections, register voters and candidates,
                tally results, and announce winners.
              </span>
              <span style={styles.loginCardArrow}>Enter Panel →</span>
            </div>
          </div>
        </section>

        <hr style={styles.divider} className="fade-up-5" />

        {/* ── How It Works ─────────────────────────────────────────── */}
        <section style={{ ...styles.section }} className="fade-up-5">
          <SectionHeader label="Process" title="How It Works" />

          <div style={styles.stepsGrid}>
            {[
              {
                n: "01",
                icon: "◈",
                title: "Deploy Election",
                desc: "Super Admin deploys the Admin contract once. For each election, a new Election.sol is created on-chain with a defined start/end window.",
              },
              {
                n: "02",
                icon: "⬡",
                title: "Register Voters",
                desc: "Election Admin registers voter wallet addresses before the election starts. Each voter is mapped to a unique Voter ID on-chain.",
              },
              {
                n: "03",
                icon: "⊞",
                title: "Add Candidates",
                desc: "Candidates are added with an ID, name, and party. Each candidate receives an integer index — their position in the vote vector.",
              },
              {
                n: "04",
                icon: "🔒",
                title: "Encrypt & Vote",
                desc: "Voter selects a candidate. A one-hot vector is Paillier-encrypted client-side. The ciphertext is sent to the blockchain via MetaMask.",
              },
              {
                n: "05",
                icon: "∑",
                title: "Tally Off-Chain",
                desc: "After the election ends, Admin fetches all ciphertexts per candidate slot. Server multiplies them homomorphically — decrypts only the totals.",
              },
              {
                n: "06",
                icon: "✓",
                title: "Announce Winner",
                desc: "Admin calls announceWinner() on-chain with the winning candidate ID. The result is permanently recorded and publicly verifiable.",
              },
            ].map((s) => (
              <div key={s.n} className="step-card" style={styles.stepCard}>
                <div style={styles.stepNum}>{s.n}</div>
                <span style={styles.stepIcon}>{s.icon}</span>
                <div style={styles.stepTitle}>{s.title}</div>
                <div style={styles.stepDesc}>{s.desc}</div>
                <div style={styles.stepGlow} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Paillier Encryption Flowchart ──────────────────────────── */}
        <section style={styles.section}>
          <SectionHeader label="Cryptography" title="Paillier Homomorphic Encryption" />

          <div style={styles.flowchartWrap}>
            <div style={styles.flowchartInner}>

              {/* ── Section 1: Key Setup ── */}
              <div style={styles.flowSection}>
                <div style={styles.flowSectionLabel}>① Key Generation (Server — one time)</div>
                <div style={styles.flowRow}>
                  <FlowNode label="Generate" value="p, q  (1024-bit primes)" />
                  <FlowArrow label="n = p×q" />
                  <FlowNode label="Public Key" value="(n, g)" highlight />
                  <FlowArrow label="share" />
                  <FlowNode label="Client" value="receives (n, g)" />
                  <div style={{ flex: "2 1 auto" }} />
                  <FlowNode label="Private Key" value="(λ, μ)" success />
                  <div style={{ width: "12px", background: "rgba(0,200,80,0.2)", height: "1px" }} />
                  <FlowNode label="Server Only" value="🔐 .env.local" success />
                </div>
              </div>

              {/* ── Section 2: Vote Encryption ── */}
              <div style={styles.flowSection}>
                <div style={styles.flowSectionLabel}>② Vote Encryption (Browser — per voter)</div>
                <div style={styles.flowRow}>
                  <FlowNode label="Voter selects" value="Candidate index 1" />
                  <FlowArrow label="one-hot" />
                  <FlowNode label="Plain vector" value="[0, 1, 0]" />
                  <FlowArrow label="enc each" />
                  <FlowNode label="Cipher vector" value="[E(0), E(1), E(0)]" highlight />
                  <FlowArrow label="castVote()" />
                  <FlowNode label="Blockchain" value="stored on-chain" success />
                </div>
                <div style={{ marginTop: "10px", fontSize: "10px", color: "rgba(0,150,255,0.4)", letterSpacing: "0.1em" }}>
                  E(m) = g<sup>m</sup> · r<sup>n</sup> mod n²  — random r ensures no two ciphertexts are identical even for same vote
                </div>
              </div>

              {/* ── Section 3: Homomorphic Tally ── */}
              <div style={styles.flowSection}>
                <div style={styles.flowSectionLabel}>③ Additive Homomorphic Tally (Server — after election ends)</div>
                <div style={styles.flowRow}>
                  <FlowNode label="Voter 1 slot 1" value="E(1)" />
                  <FlowArrow label="×" />
                  <FlowNode label="Voter 2 slot 1" value="E(0)" />
                  <FlowArrow label="×" />
                  <FlowNode label="Voter 3 slot 1" value="E(1)" />
                  <FlowArrow label="mod n²" />
                  <FlowNode label="Product" value="E(1+0+1) = E(2)" highlight />
                  <FlowArrow label="decrypt" />
                  <FlowNode label="Vote count" value="2 votes" success />
                </div>
                <div style={{ marginTop: "10px", fontSize: "10px", color: "rgba(0,150,255,0.4)", letterSpacing: "0.08em" }}>
                  Key property: E(a) × E(b) mod n² = E(a + b) — multiplication of ciphertexts = addition of plaintexts
                </div>
              </div>

              {/* ── Math Box ── */}
              <div style={styles.mathBox}>
                <div style={styles.mathTitle}>Paillier Core Properties</div>
                <div style={styles.mathRow}>
                  <span style={styles.mathLabel}>Encryption:</span>
                  <span style={styles.mathVal}>E(m, r) = g^m · r^n mod n²</span>
                </div>
                <div style={styles.mathRow}>
                  <span style={styles.mathLabel}>Decryption:</span>
                  <span style={styles.mathVal}>D(c) = L(c^λ mod n²) · μ mod n</span>
                </div>
                <div style={styles.mathRow}>
                  <span style={styles.mathLabel}>Homomorphic add:</span>
                  <span style={styles.mathVal}>E(a) × E(b) mod n²</span>
                  <span style={{ fontSize: "10px", color: "rgba(0,180,255,0.4)" }}>→</span>
                  <span style={styles.mathResult}>= E(a + b)</span>
                </div>
                <div style={styles.mathRow}>
                  <span style={styles.mathLabel}>Privacy guarantee:</span>
                  <span style={{ fontSize: "11px", color: "rgba(160,200,255,0.5)" }}>
                    Individual votes never decrypted — only the final sum is revealed
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Security Features ──────────────────────────────────────── */}
        <section style={styles.section}>
          <SectionHeader label="Architecture" title="Security Features" />
          <div style={styles.featGrid}>
            {[
              {
                icon: "🔒",
                title: "Vote Privacy",
                desc: "Votes are Paillier-encrypted in the browser before reaching MetaMask. The private key never leaves the server. Individual choices are never decrypted.",
              },
              {
                icon: "⛓",
                title: "On-Chain Integrity",
                desc: "Election contracts are immutable once deployed. Votes are stored as transactions — permanent, tamper-proof, and publicly auditable by address.",
              },
              {
                icon: "⬡",
                title: "Wallet Authentication",
                desc: "Voters authenticate via MetaMask. Only registered wallet addresses can cast votes. Double-voting is prevented by the hasVoted flag on-chain.",
              },
              {
                icon: "∑",
                title: "Homomorphic Tally",
                desc: "Multiplying Paillier ciphertexts on the server gives enc(sum) without decrypting individual votes. Only the aggregate total is ever revealed.",
              },
              {
                icon: "◈",
                title: "Factory Pattern",
                desc: "Admin.sol deploys each election as a separate contract. Elections are isolated — one compromised election cannot affect others.",
              },
              {
                icon: "✉",
                title: "OTP + JWT Auth",
                desc: "Admins authenticate with email OTP before accessing the control panel. JWT tokens are signed server-side and expire automatically.",
              },
            ].map((f) => (
              <div key={f.title} className="feat-card" style={styles.featCard}>
                <div style={styles.featAccent} />
                <span style={styles.featIcon}>{f.icon}</span>
                <div style={styles.featTitle}>{f.title}</div>
                <div style={styles.featDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Login Process ──────────────────────────────────────────── */}
        <section style={styles.section}>
          <SectionHeader label="Access" title="Login Process" />
          <div style={{
            ...styles.loginProcessGrid,
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}>

            {/* Voter Login */}
            <div style={styles.loginProcessCard}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "linear-gradient(180deg, #0064ff, #00c8ff)" }} />
              <div style={styles.loginProcessTitle}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0064ff", boxShadow: "0 0 8px #0064ff" }} />
                Voter Login Flow
              </div>
              {[
                ["Connect Wallet",  "Click Connect Wallet → MetaMask opens → approve connection"],
                ["Eligibility Check", "Dashboard fetches all elections and checks if your wallet is registered via getVoterInfo()"],
                ["Select Election", "Choose an eligible active election from your list"],
                ["Encrypt Vote", "Select candidate → browser fetches public key from /api/auth/public-key → encrypts one-hot vector with Paillier"],
                ["Sign & Submit", "MetaMask popup shows the transaction → approve → castVote() is called on Election.sol"],
                ["Confirmation", "Transaction hash is displayed — your encrypted vote is permanently on-chain"],
              ].map(([title, desc], i) => (
                <div key={i} style={styles.processStep}>
                  <div style={styles.processStepNum}>{i + 1}</div>
                  <div style={styles.processStepText}>
                    <span style={styles.processStepBold}>{title}</span>
                    {" — "}{desc}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px" }}>
                <div
                  className="login-card"
                  style={{
                    ...styles.loginCard,
                    padding: "16px 24px",
                    display: "inline-block",
                    minWidth: "auto",
                  }}
                  onClick={() => router.push("/voter/dashboard")}
                >
                  <div style={styles.loginCardAccent} />
                  <span style={{ fontSize: "11px", color: "#4d9fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    ⬡ Go to Voter Portal →
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Login */}
            <div style={styles.loginProcessCard}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: "linear-gradient(180deg, #0040cc, #0088ff)" }} />
              <div style={styles.loginProcessTitle}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0064ff", boxShadow: "0 0 8px #0064ff" }} />
                Admin Login Flow
              </div>
              {[
                ["Email + Password", "Navigate to /login → enter registered admin credentials"],
                ["OTP Verification", "One-time code is sent to your email → enter at /verify-otp"],
                ["JWT Issued", "Server signs a JWT token → stored as httpOnly cookie → grants access to /admin/*"],
                ["Connect Wallet", "Connect the SUPER_ADMIN or election admin wallet in MetaMask"],
                ["Create Election", "Deploy a new Election.sol contract via Admin.sol → get contract address"],
                ["Manage & Tally", "Add voters, add candidates, then POST /api/voting/decrypt after election ends to tally"],
              ].map(([title, desc], i) => (
                <div key={i} style={styles.processStep}>
                  <div style={styles.processStepNum}>{i + 1}</div>
                  <div style={styles.processStepText}>
                    <span style={styles.processStepBold}>{title}</span>
                    {" — "}{desc}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "20px" }}>
                <div
                  className="login-card"
                  style={{
                    ...styles.loginCard,
                    padding: "16px 24px",
                    display: "inline-block",
                    minWidth: "auto",
                    borderColor: "rgba(0,150,255,0.4)",
                  }}
                  onClick={() => router.push("/admin/dashboard")}
                >
                  <div style={{ ...styles.loginCardAccent, background: "linear-gradient(90deg, #0040cc, #0088ff)" }} />
                  <span style={{ fontSize: "11px", color: "#4d9fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                    ◈ Go to Admin Panel →
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── Tech Stack ────────────────────────────────────────────── */}
        <section style={styles.section}>
          <SectionHeader label="Stack" title="Built With" />
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            {[
              "Solidity 0.8.28",
              "Hardhat 3",
              "Next.js 15",
              "ethers.js v6",
              "paillier-bigint",
              "MetaMask",
              "MongoDB",
              "JWT + OTP",
              "Ethereum (EVM)",
            ].map(t => (
              <div key={t} style={{
                padding: "7px 16px",
                border: "1px solid rgba(0,120,255,0.2)",
                background: "rgba(0,15,35,0.7)",
                fontSize: "10px",
                color: "rgba(100,160,255,0.6)",
                letterSpacing: "0.12em",
                fontFamily: "monospace",
              }}>
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            VoteBlock · Blockchain Voting System
          </div>
          <div style={styles.footerRight}>
            Paillier Homomorphic Encryption · On-Chain Ballots · Verifiable Results
          </div>
        </footer>

      </div>
    </div>
  );
}