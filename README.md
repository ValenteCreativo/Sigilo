<p align="center">
  <img src="sigilo-app/public/sigilo-logo.svg" alt="Sigilo" width="120" />
</p>

<h1 align="center">Sigilo</h1>

<p align="center">
  <strong>Privacy-first whistleblowing platform for high-risk environments</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#security-model">Security</a>
</p>

---

## Overview

Sigilo combines **stealth interfaces**, **zero-knowledge proofs**, **blockchain anchoring**, and **ultrasonic communication** to protect journalists, officials, and citizens reporting sensitive information.

The app disguises itself as a calculator. Unlock with `+ = =` to reveal the secure dashboard.

---

## Features

### Stealth Calculator Interface
| Sequence | Action |
|----------|--------|
| `+ = =` | Unlock dashboard |
| `9 1 1 =` | Emergency protocol (geolocation broadcast) |

### Secure Dashboard
- **Role selection** — Journalist, Public Official, Citizen
- **Evidence attachment** → Filecoin storage
- **Real-time encryption** → AES-256-GCM + ZK progress visualization
- **EVVM anchoring** → Immutable on-chain proof

### Anonymous Role Verification
- **vLayer zkTLS** proves role without revealing identity
- TLSNotary proofs via `https://web-prover.vlayer.xyz`

### Encrypted Signal Forum
- **Obsidian-style network graph** — visualize signal connections
- **Filter by** role, status, or full-text search
- Anonymized reports with encryption method badges

### Ultrasonic Signal Transmission
- **ggwave FSK encoding** — transmit/receive via sound
- Works offline, no network required
- Use cases: covert key exchange, emergency alerts, proximity auth

### Node Integration
| Role | Purpose |
|------|---------|
| Signal Receiver | NGOs, newsrooms |
| Relay Node | Community infrastructure |
| Storage Witness | Filecoin pinning |

### Safety & OPSEC Guide
- What Sigilo protects vs. what it doesn't
- 9-point operational security checklist
- Emergency resources (CPJ, RSF, EFF)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) • React 19 • TypeScript |
| **Styling** | TailwindCSS |
| **Web3** | wagmi • viem • Reown AppKit |
| **Wallets** | MetaMask • Coinbase • WalletConnect |
| **ZK Proofs** | vLayer Web Prover (zkTLS) |
| **Blockchain** | EVVM on Sepolia |
| **Storage** | Filecoin (IPFS) |
| **Signals** | ggwave (ultrasonic FSK) |
| **State** | TanStack Query • Zod |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
├─────────────────────────────────────────────────────────────┤
│  Calculator UI ─────► Dashboard ─────► Forum                │
│        │                  │               │                 │
│        ▼                  ▼               ▼                 │
│  Stealth Mode      Report Creation   Network Graph          │
│                          │                                  │
│         ┌────────────────┼────────────────┐                 │
│         ▼                ▼                ▼                 │
│    AES-256-GCM      vLayer zkTLS     ggwave FSK             │
│    Encryption       Role Proof       Ultrasonic             │
└─────────┬────────────────┬────────────────┬─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────┐ ┌─────────────┐ ┌──────────────┐
│    Filecoin     │ │    EVVM     │ │   Offline    │
│  (Evidence CID) │ │  (Sepolia)  │ │   Devices    │
└─────────────────┘ └─────────────┘ └──────────────┘
```

### Directory Structure

```
sigilo-app/
├── src/
│   ├── app/                 # Pages
│   │   ├── page.tsx         # Landing
│   │   ├── app/             # Dashboard
│   │   ├── forum/           # Signal Forum
│   │   ├── ultrasound/      # Ultrasonic TX/RX
│   │   ├── integrate/       # Node docs
│   │   ├── safety/          # OPSEC guide
│   │   └── api/vlayer/      # ZK endpoints
│   ├── components/          # UI components
│   ├── hooks/               # useEVVM, useGgwave
│   ├── lib/                 # crypto, evvm, ggwave
│   └── config/              # wagmi setup
├── EVVM/                    # Smart contracts
└── VLayer/                  # ZK integration
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Wallet with Sepolia ETH

### Installation

```bash
cd sigilo-app
npm install
```

### Environment

```env
# .env.local
VLAYER_WEB_PROVER_URL=https://web-prover.vlayer.xyz
VLAYER_CLIENT_ID=your_client_id
VLAYER_API_KEY=your_api_key
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/vlayer/prove` | POST | Generate zkTLS proof |
| `/api/vlayer/verify` | POST | Verify proof |

### Planned Network API

```
POST /nodes/register        # Register node
GET  /signals/stream        # SSE signal stream
POST /signals/request-access # Request decryption
```

---

## Security Model

### Protected

| Layer | Protection |
|-------|------------|
| **Encryption** | AES-256-GCM client-side |
| **Identity** | Zero-knowledge role proofs |
| **Storage** | Decentralized Filecoin |
| **Proof** | EVVM on-chain anchoring |
| **Interface** | Stealth calculator disguise |

### Not Protected

- Physical surveillance
- Compromised devices
- Self-identification in content
- Activity pattern analysis

---

## EVVM Contract

| Parameter | Value |
|-----------|-------|
| **Chain** | Sepolia (11155111) |
| **Proxy** | `0x389dC8fb09211bbDA841D59f4a51160dA2377832` |
| **RPC** | `https://ethereum-sepolia-rpc.publicnode.com` |

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/enhancement`)
3. Commit changes (`git commit -m 'Add enhancement'`)
4. Push branch (`git push origin feature/enhancement`)
5. Open Pull Request

---

## Resources

- [Committee to Protect Journalists](https://cpj.org)
- [Reporters Without Borders](https://rsf.org)
- [Electronic Frontier Foundation](https://eff.org)

---

<p align="center">
  <sub>Built for those who speak truth to power.</sub>
</p>
