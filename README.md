# VoteBlock 🗳️

**VoteBlock** is a decentralized voting application (DApp) that leverages **blockchain technology** to ensure secure, transparent, and tamper-proof elections.  
The system combines a modern **Next.js frontend** with **Solidity smart contracts** managed using **Hardhat**.

---

## 📌 Features

- Secure voter authentication
- Wallet-based voting using MetaMask
- Immutable vote storage on blockchain
- One-vote-per-user enforcement
- Transparent and verifiable results
- OTP / backend-based verification (off-chain)
- Modern UI with Next.js + Tailwind CSS

---

## 🧱 Project Structure


---

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- JavaScript
- MetaMask

### Smart Contracts
- Solidity
- Hardhat 3
- Hardhat Ignition
- Viem

### Blockchain
- Ethereum-compatible networks
- Local Hardhat Network
- Testnets (future-ready)

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd voteblock
cd frontend
npm install
npm run dev
cd contract
npm install
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/<YourModule>.ts --network localhost
```