'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const VoteBlockLayout = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [walletStatus, setWalletStatus] = useState('');
  const [connectedWallet, setConnectedWallet] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setWalletStatus('error');
      return;
    }

    try {
      setWalletStatus('connecting');

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const account = accounts[0];

      const polygonAmoy = {
        chainId: '0x13882',
        chainName: 'Polygon Amoy Testnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://rpc-amoy.polygon.technology'],
        blockExplorerUrls: ['https://amoy.polygonscan.com/']
      };

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: polygonAmoy.chainId }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [polygonAmoy],
          });
        }
      }

      setWalletStatus('success');
      setConnectedWallet(account);

      setTimeout(() => {
        setShowModal(false);
        setWalletStatus('');
      }, 2000);

    } catch (error) {
      setWalletStatus('error');
    }
  };

  const styles = {
    // Page Content - Now Full Width
    pageContent: {
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '0',
    },
    // Enhanced Header
    headerContainer: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(6, 182, 212, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      width: '100%',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    },
    logo: {
      fontSize: '28px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
      textShadow: '0 0 20px rgba(6, 182, 212, 0.5)', // Neon Cyan Glow
    },
    // Wallet in Header
    headerWallet: {
      padding: '8px 16px',
      background: 'rgba(6, 182, 212, 0.1)',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      borderRadius: '20px',
      color: '#22d3ee',
      fontSize: '14px',
      fontFamily: 'monospace',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)',
    },
    // Hero Section
    heroSection: {
      textAlign: 'center',
      padding: '100px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      position: 'relative',
    },
    heroTitle: {
      fontSize: '72px',
      fontWeight: 800,
      background: 'linear-gradient(to right, #22d3ee, #60a5fa, #818cf8)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '24px',
      lineHeight: 1.1,
      filter: 'drop-shadow(0 0 25px rgba(34, 211, 238, 0.4))',
      letterSpacing: '-2px',
    },
    heroSubtitle: {
      fontSize: '24px',
      color: '#f1f5f9',
      marginBottom: '16px',
      fontWeight: 500,
    },
    heroDescription: {
      fontSize: '18px',
      color: '#94a3b8',
      marginBottom: '48px',
      maxWidth: '700px',
      margin: '0 auto 48px',
      lineHeight: 1.6,
    },
    primaryButton: {
      padding: '16px 48px',
      fontSize: '18px',
      fontWeight: 600,
      color: '#020617',
      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 0 30px rgba(34, 211, 238, 0.4)',
    },
    section: {
      padding: '80px 40px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '42px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '60px',
      textAlign: 'center',
      textShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
    },
    processSteps: {
      display: 'flex',
      flexDirection: 'column',
      gap: '30px',
    },
    stepCard: {
      display: 'flex',
      gap: '30px',
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '30px',
      borderRadius: '20px',
      border: '1px solid rgba(34, 211, 238, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    stepNumber: {
      minWidth: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 800,
      color: '#020617',
      boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)',
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: '22px',
      fontWeight: 700,
      color: '#67e8f9',
      marginBottom: '12px',
    },
    stepDescription: {
      fontSize: '16px',
      color: '#cbd5e1',
      marginBottom: '16px',
      lineHeight: 1.6,
    },
    technicalBox: {
      background: 'rgba(6, 182, 212, 0.05)',
      padding: '12px 16px',
      borderRadius: '8px',
      borderLeft: '3px solid #22d3ee',
      fontSize: '13px',
      color: '#94a3b8',
      fontFamily: 'monospace',
      lineHeight: 1.6,
      display: 'inline-block',
    },
    verificationCard: {
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid rgba(34, 211, 238, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardTitle: {
      fontSize: '26px',
      fontWeight: 700,
      color: '#f8fafc',
      marginBottom: '20px',
    },
    cardDescription: {
      fontSize: '16px',
      color: '#cbd5e1',
      lineHeight: 1.7,
      marginBottom: '30px',
    },
    ledgerExample: {
      background: 'rgba(2, 6, 23, 0.8)',
      padding: '30px',
      borderRadius: '16px',
      border: '1px solid rgba(34, 211, 238, 0.2)',
      marginBottom: '25px',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)',
    },
    ledgerTitle: {
      fontSize: '14px',
      fontWeight: 600,
      color: '#22d3ee',
      marginBottom: '20px',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    ledgerContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    ledgerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
    },
    ledgerLabel: {
      color: '#64748b',
      fontSize: '14px',
      fontWeight: 500,
    },
    ledgerValue: {
      color: '#34d399',
      fontSize: '14px',
      fontFamily: 'monospace',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '30px',
      marginTop: '60px',
    },
    featureCard: {
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(10px)',
      padding: '40px',
      borderRadius: '24px',
      border: '1px solid rgba(34, 211, 238, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    },
    featureIcon: {
      fontSize: '48px',
      marginBottom: '24px',
      filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.3))',
    },
    featureTitle: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '16px',
      color: '#f8fafc',
    },
    featureText: {
      fontSize: '16px',
      color: '#94a3b8',
      lineHeight: 1.6,
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '50px',
      borderRadius: '24px',
      maxWidth: '500px',
      width: '90%',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      boxShadow: '0 0 50px rgba(34, 211, 238, 0.15)',
      textAlign: 'center',
    },
    modalTitle: {
      fontSize: '28px',
      fontWeight: 700,
      color: '#f1f5f9',
      marginBottom: '15px',
    },
    modalText: {
      fontSize: '16px',
      color: '#94a3b8',
      marginBottom: '30px',
      lineHeight: 1.6,
    },
    modalButton: {
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#020617',
      background: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginRight: '10px',
    },
    modalButtonSecondary: {
      padding: '14px 32px',
      fontSize: '16px',
      fontWeight: 600,
      color: '#cbd5e1',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid rgba(34, 211, 238, 0.3)',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.pageContent}>

      {/* Header with Title and Wallet */}
      <div style={styles.headerContainer}>
        <h1 style={styles.logo}>VoteBlock</h1>

        {connectedWallet ? (
          <div style={styles.headerWallet}>
            <span style={{ width: '8px', height: '8px', background: '#22d3ee', borderRadius: '50%', boxShadow: '0 0 8px #22d3ee' }}></span>
            {connectedWallet.substring(0, 6)}...{connectedWallet.substring(38)}
          </div>
        ) : (
          <button
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#67e8f9',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={connectWallet}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(6, 182, 212, 0.3)';
              e.currentTarget.style.borderColor = '#22d3ee';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.3)';
            }}
          >
            {walletStatus === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>

      <div style={styles.heroSection}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, rgba(0,0,0,0) 70%)',
          zIndex: -1,
          pointerEvents: 'none',
        }}></div>

        <h1 style={styles.heroTitle}>VoteBlock</h1>
        <p style={styles.heroSubtitle}>
          Decentralized Voting Platform Powered by Blockchain Technology
        </p>
        <p style={styles.heroDescription}>
          Experience the future of democracy with secure, transparent, and tamper-proof elections on the Polygon blockchain
        </p>

        <button
          style={styles.primaryButton}
          onClick={() => {
            setShowModal(true)
            router.push('/login');
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 50px rgba(34, 211, 238, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.4)';
          }}
        >
          Get Started
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How VoteBlock Works</h2>
        <div style={styles.processSteps}>

          {[
            {
              num: 1, title: 'Asymmetric Encryption Setup',
              desc: 'When you register, VoteBlock generates a unique key pair for you with a public key stored on the blockchain and a private key that remains secure in your wallet.',
              tech: 'Encryption: RSA-2048 bit asymmetric cryptography'
            },
            {
              num: 2, title: 'Homomorphic Encryption of Vote',
              desc: 'Your vote is encrypted using homomorphic encryption combining candidate ID, wallet address, and public key. This allows tallying without decryption.',
              tech: 'Format: E(candidateID + walletAddress + publicKey)'
            },
            {
              num: 3, title: 'Blockchain Recording',
              desc: 'Your encrypted vote is submitted as a transaction to the Polygon blockchain with an immutable record, timestamp, and transaction hash.',
              tech: 'Network: Polygon Amoy Testnet'
            },
            {
              num: 4, title: 'Vote Tallying',
              desc: 'After election closes, votes are tallied using homomorphic properties. Results are computed WITHOUT decrypting individual votes.',
              tech: 'Tally Method: Homomorphic aggregation'
            },
            {
              num: 5, title: 'Result Announcement',
              desc: 'Election authority uses master private key to decrypt only the aggregated tally. Individual votes remain encrypted forever.',
              tech: 'Decryption: Multi-signature authorization required'
            }
          ].map((step, index) => (
            <div
              key={index}
              style={styles.stepCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.1)';
              }}
            >
              <div style={styles.stepNumber}>{step.num}</div>
              <div style={styles.stepContent}>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDescription}>{step.desc}</p>
                <div style={styles.technicalBox}>{step.tech}</div>
              </div>
            </div>
          ))}

        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Public Ledger Verification</h2>
        <div
          style={styles.verificationCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.1)';
          }}
        >
          <h3 style={styles.cardTitle}>How Voters Verify Their Encrypted Vote</h3>
          <p style={styles.cardDescription}>
            Every voter can independently verify their encrypted vote on the public blockchain ledger. Your vote proof provides complete transparency while maintaining ballot secrecy.
          </p>

          <div style={styles.ledgerExample}>
            <div style={styles.ledgerTitle}>Example Public Ledger Entry</div>
            <div style={styles.ledgerContent}>
              <div style={styles.ledgerRow}>
                <span style={styles.ledgerLabel}>Transaction Hash:</span>
                <span style={styles.ledgerValue}>0x7f9f3c2a...</span>
              </div>
              <div style={styles.ledgerRow}>
                <span style={styles.ledgerLabel}>Voter Wallet:</span>
                <span style={styles.ledgerValue}>0x742d35Cc...</span>
              </div>
              <div style={styles.ledgerRow}>
                <span style={styles.ledgerLabel}>Encrypted Vote:</span>
                <span style={styles.ledgerValue}>0xE9F2A8C4...</span>
              </div>
              <div style={styles.ledgerRow}>
                <span style={styles.ledgerLabel}>Timestamp:</span>
                <span style={styles.ledgerValue}>2026-01-26 14:23:45</span>
              </div>
              <div style={styles.ledgerRow}>
                <span style={styles.ledgerLabel}>Status:</span>
                <span style={{ ...styles.ledgerValue, color: '#34d399' }}>VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.featuresGrid}>
          {[
            { icon: '🔒', title: 'End-to-End Encryption', text: 'Military-grade encryption ensures your vote remains completely private and secure' },
            { icon: '⛓️', title: 'Immutable Records', text: 'Once recorded on the blockchain, votes cannot be altered, deleted, or tampered with' },
            { icon: '✅', title: 'Verifiable Results', text: 'Anyone can audit the election results and verify vote counts independently' }
          ].map((feature, idx) => (
            <div
              key={idx}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.1)';
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>Login Required</h3>
            <p style={styles.modalText}>
              Please login with your credentials to access the voting platform.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                style={styles.modalButton}
                onClick={() => router.push('/login')}
              >
                Proceed to Login
              </button>
              <button
                style={styles.modalButtonSecondary}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoteBlockLayout;