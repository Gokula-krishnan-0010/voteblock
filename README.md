# VoteBlock 🗳️

> **Repository:** [https://github.com/Gokula-krishnan-0010/voteblock](https://github.com/Gokula-krishnan-0010/voteblock)

A decentralized voting application (DApp) built with **Next.js**, **Hardhat 3**, **Solidity 0.8.28**, and **Paillier homomorphic encryption**. Votes are encrypted client-side before being submitted to the blockchain. Tallying happens off-chain via homomorphic addition — the admin never sees individual votes, only the final decrypted count.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Smart Contract Setup](#smart-contract-setup)
- [Running Locally](#running-locally)
- [MetaMask Setup](#metamask-setup)
- [How Voting Works](#how-voting-works)
- [API Routes](#api-routes)
- [Deployment to Sepolia](#deployment-to-sepolia)
- [Common Errors](#common-errors)
- [Security Notes](#security-notes)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                              │
│   voter/dashboard/page.jsx     admin/dashboard/page.jsx      │
│         │                            │                       │
│   lib/pallierEncrypt.js        lib/adminContract.js          │
│   lib/electionContract.js      lib/electionContract.js       │
│         │                            │                       │
│         └──── window.ethereum (MetaMask) ────────────────────┤
└───────────────────────┬──────────────────────────────────────┘
                        │ signed transactions
                        ▼
┌──────────────────────────────────────────────────────────────┐
│           BLOCKCHAIN  (localhost:8545 / Sepolia)             │
│                                                              │
│   Admin.sol  ──createElection()──▶  Election.sol             │
│   (deployed once)                   (one per election)       │
│                                     stores encrypted vectors │
└───────────────────────┬──────────────────────────────────────┘
                        │ read ciphertexts
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    NEXT.JS SERVER                            │
│                                                              │
│   /api/voting/decrypt   ──▶  server/paillierKeys.js          │
│   /api/auth/public-key  ──▶  server/paillierKeys.js          │
│   /api/auth/login       ──▶  lib/db.js + lib/jwt.js          │
│   /api/auth/request-otp ──▶  lib/otp.js + lib/email.js       │
│   /api/auth/verify-otp  ──▶  lib/otp.js + lib/jwt.js         │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, inline CSS |
| Smart Contracts | Solidity 0.8.28, Hardhat 3 |
| Wallet | MetaMask, ethers.js v6 |
| Encryption | paillier-bigint (homomorphic) |
| Auth | JWT, OTP via email |
| Database | MongoDB |
| Email | Nodemailer |
| Hardhat tooling | hardhat-toolbox-viem, Viem |

---

## Repository Structure

```
voteblock/
│
├── middleware.js                        # ⚠ move to frontend/src/middleware.js
├── README.md
├── LICENSE
├── .gitignore
│
├── Transaction_details/                 # screenshots of deployed contracts
│   ├── Admin_contract.png
│   ├── Created_election.png
│   └── Election1_contract.png
│
├── contract/                            # ── Hardhat 3 project ──────────────
│   ├── hardhat.config.ts                # Viem tooling + network config
│   ├── package.json
│   ├── tsconfig.json
│   ├── contracts/
│   │   ├── Admin.sol                    # factory — deploys Election.sol
│   │   └── Election.sol                 # one per election, stores votes
│   ├── scripts/
│   │   ├── deploy.ts                    # deploys Admin.sol to any network
│   │   └── send-op-tx.ts               # OP chain transaction helper
│   ├── test/
│   │   └── Counter.ts
│   └── artifacts/contracts/             # ← generated after compile
│       ├── Admin.sol/Admin.json
│       └── Election.sol/Election.json
│
└── frontend/                            # ── Next.js project ────────────────
    ├── jsconfig.json                    # path alias: @/ → src/
    ├── next.config.mjs
    ├── package.json
    └── src/
        ├── abi/
        │   ├── Admin.json               # ← copied from contract/artifacts/
        │   └── Election.json            # ← copied from contract/artifacts/
        ├── app/
        │   ├── layout.js
        │   ├── page.js
        │   ├── globals.css
        │   ├── admin/
        │   │   └── dashboard/page.jsx   # create election, add voters/candidates
        │   ├── voter/
        │   │   └── dashboard/page.jsx   # cast encrypted vote, view results
        │   ├── api/
        │   │   └── voting/
        │   │       └── decrypt/route.js  # homomorphic tally + decrypt
        │   ├── connect-wallet/page.jsx
        │   ├── login/page.jsx
        │   └── verify-otp/page.jsx
        ├── lib/                         # shared utilities
        │   ├── provider.js              # MetaMask BrowserProvider + signer
        │   ├── adminContract.js         # Admin.sol read/write helpers
        │   ├── electionContract.js      # Election.sol read/write helpers
        │   ├── pallierEncrypt.js        # client-side encryption (public key only)
        ├── server/
        │   └── paillierKeys.js          # 🔐 private key — server only
        └── scripts/
            ├── generatePaillierKeys.js  # run once to generate key pair
            └── generateUserHash.js      # utility for user hash generation
```

---

## Prerequisites

```bash
node  >= 18.0.0
npm   >= 9.0.0
```

Browser extension:
- **MetaMask** — [https://metamask.io](https://metamask.io)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Gokula-krishnan-0010/voteblock.git
cd voteblock
```

### 2. Install contract dependencies

```bash
cd contract
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Compile smart contracts

```bash
cd ../contract
npx hardhat compile
```

Generates ABIs in `contract/artifacts/contracts/`.

### 5. Copy ABIs to frontend

```bash
# Run from project root
cp contract/artifacts/contracts/Admin.sol/Admin.json frontend/src/abi/Admin.json
cp contract/artifacts/contracts/Election.sol/Election.json frontend/src/abi/Election.json
```

> Always recompile and re-copy after modifying any `.sol` file.

---

## Environment Variables

### `contract/.env` — Hardhat

Only needed for testnet deployments. Not required for local development.

```bash
# contract/.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_PRIVATE_KEY=0xYourDeployerWalletPrivateKey
```

### `frontend/.env.local` — Next.js

Fill this after running the deploy script and Paillier key generation.

```bash
# frontend/.env.local

# ── Blockchain ──────────────────────────────────────────────────────
# Paste the Admin contract address printed by deploy.ts
NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS=0xYourDeployedAdminAddress

# RPC URL used by server-side routes to read contract state
RPC_URL=http://127.0.0.1:8545

# ── Paillier Encryption Keys ────────────────────────────────────────
# Generate once: node frontend/src/scripts/generatePaillierKeys.js
PAILLIER_N=your_n_value
PAILLIER_G=your_g_value
PAILLIER_LAMBDA=your_lambda_value        # 🔐 never expose to client
PAILLIER_MU=your_mu_value               # 🔐 never expose to client

# ── Auth ────────────────────────────────────────────────────────────
JWT_SECRET=your_random_secret_min_32_chars

# ── Database ────────────────────────────────────────────────────────
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/voteblock

# ── Email (OTP delivery) ────────────────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password       # Gmail App Password, not account password
```

> Both `.env` files are already listed in `.gitignore`. Never commit secrets.

### Variable visibility rules

| Prefix | Accessible in |
|---|---|
| `NEXT_PUBLIC_` | Browser + Server — safe for contract addresses |
| *(no prefix)* | Server only — secrets, keys, DB credentials |

---

## Smart Contract Setup

### Generate Paillier Keys — run once

```bash
node frontend/src/scripts/generatePaillierKeys.js
```

Output:

```
Add these to frontend/.env.local:

PAILLIER_N=123456789...
PAILLIER_G=123456790...
PAILLIER_LAMBDA=987654321...
PAILLIER_MU=456789123...
```

Paste all four values into `frontend/.env.local`.

> ⚠ **Never regenerate keys** after any election has started. Votes encrypted with the old public key become permanently undecryptable if the private key changes.

---

## Running Locally

### Step 1 — Start local Hardhat node

```bash
# Terminal 1 — keep this running
cd contract
npx hardhat node
```

Starts a blockchain at `http://127.0.0.1:8545` (Chain ID: 31337).  
Prints 20 test accounts with private keys, each holding 10,000 test ETH.

### Step 2 — Deploy Admin.sol

```bash
# Terminal 2
cd contract
npx hardhat run scripts/deploy.ts --network localhost
```

Expected output:

```
► Deployer  : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
► Balance   : 10000.0000 ETH
► Chain ID  : 31337

► Deploying Admin.sol...
✔ Admin deployed at : 0x5FbDB2315678afecb367f032d93F642f64180aa3
✔ SUPER_ADMIN       : 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

══════════════════════════════════════════════════
  Add to frontend/.env.local:
  NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS=0x5FbDB231...
══════════════════════════════════════════════════
```

Paste the printed address into `frontend/.env.local`.

### Step 3 — Start Next.js dev server

```bash
# Terminal 2 (or 3)
cd frontend
npm run dev
```

App runs at `http://localhost:3000`.

> **Note:** Restart Next.js after any change to `frontend/.env.local` — hot reload does not pick up env changes.

---

## MetaMask Setup

### Add Hardhat Local Network

```
MetaMask → Settings → Networks → Add Network → Add manually

  Network Name  :  Hardhat Local
  RPC URL       :  http://127.0.0.1:8545
  Chain ID      :  31337
  Currency      :  ETH
```

### Import Test Accounts

Copy private keys printed by `npx hardhat node`, then:

```
MetaMask → Account icon → Import Account → Private Key → Paste
```

Recommended account roles:

| Account | Role | Responsible for |
|---|---|---|
| #0 `0xf39Fd6...` | SUPER_ADMIN | Deploy Admin.sol, call `createElection()` |
| #1 `0x70997...` | Election ADMIN | `addVoter()`, `addCandidate()`, `announceWinner()` |
| #2 `0x3C44C...` | Voter 1 | `castVote()` |
| #3 `0x90F79...` | Voter 2 | `castVote()` |
| #4 `0x15d34...` | Voter 3 | `castVote()` |

> ⚠ Hardhat private keys are publicly known to everyone. Never use them on mainnet or send real funds to them.  
> The chain resets every time you restart `npx hardhat node` — redeploy and update `.env.local` after each restart.

---

## How Voting Works

### 1. Encryption — Paillier One-Hot Vector

Each vote is a **one-hot encoded vector** where each slot corresponds to a candidate, encrypted individually:

```
Candidates:  [Alice (idx 0),  Bob (idx 1),  Carol (idx 2)]

Voter votes for Bob (index 1):
  plaintext   →  [0,     1,     0    ]
  encrypted   →  [e(0),  e(1),  e(0) ]  ← castVote(string[]) on-chain
```

The plaintext vote never leaves the browser.

### 2. On-Chain Storage

```solidity
// Election.sol — castVote() appends to per-candidate arrays
candidateVoteCiphertexts[0].push(e(0))  // Alice slot
candidateVoteCiphertexts[1].push(e(1))  // Bob slot  ← enc(1) = voted for Bob
candidateVoteCiphertexts[2].push(e(0))  // Carol slot
```

Even the contract admin cannot read individual votes from these ciphertexts.

### 3. Off-Chain Tally — Homomorphic Addition

Paillier's core property:

```
encrypt(a) × encrypt(b)  mod n²  =  encrypt(a + b)
```

After the election ends, the server fetches and multiplies all ciphertexts per slot:

```
3 voters — Bob's slot ciphertexts:
  e(0) × e(1) × e(1)  =  e(0 + 1 + 1)  =  e(2)
  decrypt e(2)  →  2 votes

Full tally:  Alice = 1,  Bob = 2,  Carol = 0  →  Bob wins ✅
```

Only the final sum is decrypted — individual choices remain private forever.

### 4. Admin Announces Winner On-Chain

```
1. Admin calls POST /api/voting/decrypt
     → server fetches all ciphertexts per slot from chain
     → multiplies homomorphically per slot
     → decrypts each sum with private key
     → returns { winnerId, voteCounts }

2. Admin calls Election.announceWinner(winnerId)
     → MetaMask popup — admin signs tx
     → winner stored immutably on-chain
     → WINNER and winnerDeclared become publicly readable
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Authenticate with email + password, returns JWT |
| `/api/auth/request-otp` | POST | Send OTP to voter's registered email |
| `/api/auth/verify-otp` | POST | Verify OTP, completes second-factor auth |
| `/api/auth/public-key` | GET | Returns Paillier `{ n, g }` — safe to expose publicly |
| `/api/voting/decrypt` | POST | Fetches ciphertexts, runs homomorphic tally, returns winner |

---

## Deployment to Sepolia

### 1. Get test ETH

- [https://sepoliafaucet.com](https://sepoliafaucet.com)
- [https://faucet.quicknode.com/ethereum/sepolia](https://faucet.quicknode.com/ethereum/sepolia)

### 2. Set Hardhat env

```bash
# contract/.env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
SEPOLIA_PRIVATE_KEY=0xYourWalletPrivateKey
```

### 3. Deploy

```bash
cd contract
npx hardhat run scripts/deploy.ts --network sepolia
```

### 4. Update frontend env

```bash
# frontend/.env.local
NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS=0xNewSepoliaContractAddress
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 5. Deploy frontend to Vercel

```bash
cd frontend
npx vercel deploy
```

Add all `frontend/.env.local` variables in Vercel → Project → Settings → Environment Variables. Never commit them to git.

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `could not decode result data (value="0x")` | Stale contract address or wrong MetaMask network | Redeploy → update `NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS` → restart Next.js |
| `Not the ADMIN` | Wrong MetaMask account | Switch to the election admin account (#1) |
| `Only SUPER_ADMIN can create elections` | Wrong MetaMask account for createElection | Switch to account #0 (deployer) |
| `Start time must be in future` | `_startTime` ≤ current block timestamp | Use a future Unix timestamp |
| `End time must be after Start time` | Constructor bug with `ELECTION_START_TIME` | Fix: use `_startTime` instead of `ELECTION_START_TIME` in require |
| `Vector length mismatch` | `castVote(string[])` array length ≠ candidate count | Call `getCandidateCount()` before encrypting vector |
| `Missing Paillier keys in environment` | `.env.local` missing key values | Run `generatePaillierKeys.js` and paste all 4 values |
| `MetaMask not installed` | No wallet browser extension | Install MetaMask |
| Contracts missing after node restart | `npx hardhat node` resets chain state | Redeploy and update `NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS` |

---

## Security Notes

```
✅  PAILLIER_LAMBDA + PAILLIER_MU
      →  lives only in server/paillierKeys.js
      →  protected by `import "server-only"` (build error if imported client-side)
      →  never sent to the browser under any circumstance

✅  Individual votes
      →  never decrypted individually
      →  only the homomorphic SUM per candidate slot is ever decrypted
      →  voter privacy is cryptographically guaranteed

✅  JWT_SECRET, DATABASE_URL, EMAIL_PASS
      →  no NEXT_PUBLIC_ prefix → server-side only

✅  NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS
      →  safe to expose — contract addresses are public on-chain

⚠   Hardhat test private keys
      →  publicly known to everyone — never use on mainnet

⚠   Paillier keys
      →  must remain constant for the entire deployment lifetime
      →  regenerating makes all existing encrypted votes permanently undecryptable
      →  for production: store in AWS Secrets Manager or equivalent
```

---

## License

[MIT](./LICENSE) © [Gokula-krishnan-0010](https://github.com/Gokula-krishnan-0010)