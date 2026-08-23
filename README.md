# CodeShield — Autonomous Security Gateway for AI Coding Agents

> **"Secure Autonomous Code Before It Deploys."**  
> Powered by the **x402 Protocol** and settled on **Algorand**.

---

## 🚀 Overview

**CodeShield** is a pay-per-use, on-demand security auditing gateway built natively for autonomous AI coding agents. 

When an AI coding agent generates code, it evaluates risk, requests an audit from CodeShield, receives an **HTTP 402 Payment Required** response, autonomously evaluates its spending policy, completes a verified micropayment via **x402 on Algorand ($0.05 USDC)**, receives structured vulnerability analysis, applies automated fixes, and re-audits before deploying.

---

## 💡 The Problem & The Solution

| The Problem | The CodeShield Solution |
| :--- | :--- |
| **AI Agents Cannot Use Credit Cards**: Autonomous coding agents cannot pass CAPTCHAs, manage monthly SaaS subscriptions, or handle manual 2FA credit card approvals. | **Agent-Native x402 Micropayments**: CodeShield charges **$0.05 USDC per audit** through standard HTTP 402 negotiation, allowing programmatic zero-click settlement. |
| **Silent Vulnerability Deployment**: AI code generators produce smart contracts with reentrancy bugs, access control gaps, and unchecked calls that get deployed directly. | **Pre-Deployment Security Gate**: Contracts are automatically analyzed against deterministic security rules, scoring from 0 to 100 before deployment permissions are granted. |
| **High Ethereum Gas Fees**: Paying $0.05 on Ethereum or L2s often costs $1.00+ in gas fees, making agent micropayments uneconomical. | **Algorand Instant Settlement**: Algorand delivers **<3.3s finality** with deterministic fees of ~0.001 ALGO (<$0.0002), making high-frequency agent security checks viable. |

---

## 📋 Contract IDs, Asset IDs & Network Identifiers

| Parameter / Resource | Value / Identifier | Details & Explorer Links |
| :--- | :--- | :--- |
| **Payment Asset ID (USDC Testnet)** | `10458941` | [View USDC ASA on Lora Explorer](https://lora.algokit.io/testnet/asset/10458941) · 6 Decimal Micro-Units |
| **Payment Asset ID (USDC Mainnet)** | `31566704` | [View USDC ASA on Mainnet Lora](https://lora.algokit.io/mainnet/asset/31566704) |
| **CodeShield Treasury Receiver** | `K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE` | [View Treasury Account on Lora](https://lora.algokit.io/testnet/account/K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE) |
| **Facilitator Fee Payer** | `ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA` | GoPlausible Facilitator Fee-Sponsor Account |
| **Algorand Testnet CAIP-2 ID** | `algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=` | Standard W3C/CAIP-2 Identifier for Algorand Testnet |
| **Algorand Mainnet CAIP-2 ID** | `algorand:wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=` | Standard CAIP-2 Identifier for Algorand Mainnet |
| **Algod Node REST Server** | `https://testnet-api.algonode.cloud` | High-availability Algod Node via AlgoNode |
| **x402 Facilitator Endpoint** | `https://facilitator.goplausible.xyz` | GoPlausible x402 Signature Verifier & Settlement API |


---

## ⚡ The 9-Step Autonomous x402 Protocol Flow

```
┌─────────────────┐       1. POST /api/audit (no auth)      ┌─────────────────────────┐
│                 │ ──────────────────────────────────────> │                         │
│                 │       2. HTTP 402 Payment Required      │   CodeShield Gateway    │
│                 │ <────────────────────────────────────── │    (/api/audit)         │
│                 │   (x402 Challenge: $0.05 USDC / CAIP2)  │                         │
│                 │                                         └─────────────────────────┘
│   AI Coding     │       3. Evaluates Spending Policy
│     Agent       │          (Max: $0.10, Daily: $2.00)
│                 │       4. Creates & Signs Algorand Txn
│                 │
│                 │       5. POST /api/audit + Payment-Sig  ┌─────────────────────────┐
│                 │ ──────────────────────────────────────> │                         │
│                 │       6. Verification via Facilitator   │   GoPlausible / Algod   │
│                 │          & Algorand Settlement          │   Settlement Engine     │
│                 │                                         └─────────────────────────┘
│                 │       7. HTTP 200 OK + Report Delivered ┌─────────────────────────┐
│                 │ <────────────────────────────────────── │  Static Analysis Engine │
│                 │   (Score: 42/100, Issues: Reentrancy)   │  + Gas Optimizations    │
│                 │                                         └─────────────────────────┘
│                 │       8. Auto-Fix Generated (Claude AI)
│                 │       9. Re-Audit (Score: 100/100 PASS)
└─────────────────┘
```

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Algorand Testnet & Mainnet
- **Protocol**: x402 V2 Specification (AVM CAIP-2)
- **Facilitator**: GoPlausible x402 Facilitator (`https://facilitator.goplausible.xyz`)
- **SDKs**: `@x402-avm/avm`, `algosdk`, `@txnlab/use-wallet-react`, `@txnlab/use-wallet-pera`
- **Security Engine**: Deterministic AST & Regex static analysis for Solidity, Vyper, and Web2 APIs

---

## 📁 Repository Structure

```
codeshield-app/
├── app/
│   ├── api/
│   │   ├── audit/route.ts       # Core paid x402 endpoint (HTTP 402 / 200)
│   │   ├── autofix/route.ts     # Automated vulnerability remediation engine
│   │   └── policy/route.ts      # Agent spending policy rules
│   ├── explorer/page.tsx        # Interactive x402 Protocol API Explorer
│   ├── workspace/page.tsx       # AI Agent Workspace & Code Editor
│   ├── wallet/page.tsx          # Algorand Wallet, Faucets & Policy Engine
│   ├── activity/page.tsx        # Real-time x402 Event Trace
│   ├── transactions/page.tsx    # On-Chain Settled Transactions Log
│   ├── reports/page.tsx         # Security Reports Archive
│   ├── analytics/page.tsx       # Audit Statistics & Metrics
│   └── settings/page.tsx        # Network, RPC, and Policy Configuration
├── lib/
│   ├── x402/                    # Clean x402 abstraction layer
│   │   ├── types.ts             # Standard x402 V2 interfaces
│   │   ├── paymentRequirements.ts # CAIP-2 requirement generator
│   │   ├── server.ts            # Server-side 402 challenge & signature verifier
│   │   ├── client.ts            # Agent autonomous payment fetch loop
│   │   └── facilitator.ts       # GoPlausible facilitator adapter
│   ├── algorand/                # Algorand blockchain client
│   │   ├── config.ts            # Network, ASA, and RPC configuration
│   │   ├── client.ts            # Algodv2 client initialization
│   │   ├── payment.ts           # AssetTransfer transaction builder & decoder
│   │   └── verification.ts      # Live on-chain Algod transaction validation
│   ├── audit/                   # Security Audit Engine
│   │   ├── engine.ts            # Audit scoring, hashing, and report generator
│   │   └── rules.ts             # Deterministic vulnerability detection rules
│   ├── policy/                  # Agent Spending Policy Engine
│   │   └── spendingPolicy.ts    # Multi-rule budget & allowlist evaluation
│   └── store/                   # Browser & server state persistence
│       └── db.ts                # Real-time transaction store & balance sync
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (see `.env.example`):

```env
# Algorand Network Configuration
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_TOKEN=
ALGOD_PORT=
ALGORAND_NETWORK=testnet

# CodeShield Gateway Receiver Address
ALGORAND_RECEIVER_ADDRESS=K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE

# USDC Token Asset ID (Testnet: 10458941, Mainnet: 31566704)
USDC_ASSET_ID=10458941

# x402 Facilitator
X402_FACILITATOR_URL=https://facilitator.goplausible.xyz
X402_NETWORK=algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=

# Optional AI Patcher Integration (Claude / OpenAI)
AI_PROVIDER_API_KEY=
```

---

## 🏃 Local Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Run typecheck to verify integrity
npm run typecheck

# 3. Start development server
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🧪 How to Test & Verify (Judges Quickstart)

### Test 1: Testing the Real HTTP 402 Endpoint via cURL
Run a request without payment headers:
```bash
curl -i -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"code":"contract Vault { }","language":"solidity"}'
```
**Expected Output**:
```http
HTTP/1.1 402 Payment Required
Content-Type: application/json
WWW-Authenticate: x402 realm="CodeShield Audit Gateway", price="$0.05 USDC", network="algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
X-Payment-Required: true

{
  "x402Version": 2,
  "accepts": [
    {
      "scheme": "exact",
      "price": "$0.05",
      "network": "algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
      "payTo": "K754AWDJAZM3SIVPZJ47432MDFCGGAKZMWW5VFFO6CZXAY2OQYI3RRPDXE",
      "extra": { "asset": 10458941, "feePayer": "ZMFK2OI7ZBD2U27ISERZC4S6LKM6WMFJPZQ4MYNJDZ2VNBNMBA67RA22AA" }
    }
  ]
}
```

### Test 2: Interactive API Explorer in UI
1. Navigate to **`http://localhost:3000/explorer`**.
2. Click **`1. Send (No Payment) → 402`**: See raw HTTP 402 response and `WWW-Authenticate` headers.
3. Click **`2. Send (With Proof) → 200`**: See HTTP 200 OK with structured vulnerability analysis.

### Test 3: End-to-End Autonomous Agent Loop
1. Navigate to **`http://localhost:3000/workspace`**.
2. Click **`Run Security Audit ($0.05 USDC)`**.
3. Observe live autonomous payment negotiation, balance deduction (`$5.00 → $4.95 USDC`), and vulnerability detection (Reentrancy, Score: 42/100).
4. Click **`Auto-Fix with Claude AI`**: Generates patched code with Checks-Effects-Interactions and `ReentrancyGuard`.
5. Click **`Request Re-Audit (Fixed Code)`**: Re-audits the fixed code, returning **100/100 PASS**.

---

## 🔒 Security & Service Delivery Integrity

- **No Secret Exposure**: Private keys and mnemonic seed phrases are strictly server-side and never sent to client browsers.
- **Service Delivery Guarantee**: Each audit generates a cryptographically hashed report (`X-Report-Hash`), tracking execution status to distinguish between payment settlement and report delivery.
- **No Faked Transactions**: Transaction identifiers clearly state whether they are live on-chain Algorand settlements or testnet simulation proofs.

---

## 📜 License

MIT License. Built for the Algorand x402 Hackathon.
