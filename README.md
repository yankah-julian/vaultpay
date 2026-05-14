# VaultPay 💳

> Developer-first payment orchestration infrastructure

## Overview
VaultPay is a payment orchestration layer built with financial-grade engineering patterns. It handles multi-currency transactions, ML-based fraud scoring, and reliable webhook delivery — inspired by real-world banking systems.

## Features
- 💰 Multi-currency ledger with ACID-compliant double-entry bookkeeping
- 🔍 ML-based fraud scoring via transaction graph analysis
- 🔔 Webhook delivery system with exponential backoff and replay
- 🔐 Financial-grade security (PCI DSS patterns, encryption at rest)
- 📊 Real-time transaction dashboards

## Architecture
```
Client → API Gateway → Transaction Service → PostgreSQL (Ledger)
                    ↓                     → Redis (Queue)
               Fraud Engine               → Webhook Worker
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20, TypeScript |
| Database | PostgreSQL (ACID ledger) |
| Cache/Queue | Redis |
| Payments | Stripe API |
| Container | Docker, Docker Compose |

## Getting Started
```bash
git clone https://github.com/yankah-julian/vaultpay.git
cd vaultpay
cp .env.example .env
docker-compose up -d
npm install
npm run migrate
npm run dev
```

## API Reference
```
POST /v1/transactions        Create a transaction
GET  /v1/transactions/:id    Get transaction details
POST /v1/webhooks/register   Register a webhook endpoint
GET  /v1/ledger/:account_id  Get account ledger
```

## Project Structure
```
vaultpay/
├── src/
│   ├── api/            # Express route handlers
│   ├── services/       # Business logic
│   │   ├── ledger.ts   # Double-entry bookkeeping
│   │   ├── fraud.ts    # Fraud scoring engine
│   │   └── webhook.ts  # Webhook delivery
│   ├── models/         # Database models
│   └── workers/        # Background jobs
├── migrations/         # SQL migrations
├── docker-compose.yml
└── .env.example
```

## License
MIT © Julian Yankah
