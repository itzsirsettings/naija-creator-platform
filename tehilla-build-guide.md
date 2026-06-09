# Tehilla — Full Technical Build Guide

## What You're Building
A Nigerian creator monetization platform where:
- Creators sign up, list their profiles, and receive brand sponsorship offers
- Brands discover creators, send offers, and pay via Stripe
- Money flows to creators via Paystack (Nigerian bank accounts)
- You take a 10% platform cut on every transaction

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Payments (Naira) | Paystack |
| Payments (Brands) | Stripe |
| Auth | JWT (JSON Web Tokens) |
| File Storage | Cloudinary (profile photos) |
| Hosting | Railway (backend) + Vercel (frontend) |

---

## Folder Structure

```
tehilla/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── creator.controller.js
│   │   │   ├── brand.controller.js
│   │   │   ├── offer.controller.js
│   │   │   └── payment.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── creator.routes.js
│   │   │   ├── brand.routes.js
│   │   │   ├── offer.routes.js
│   │   │   └── payment.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── services/
│   │   │   ├── paystack.service.js
│   │   │   └── stripe.service.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── app.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── CreatorDashboard.jsx
    │   │   ├── BrandDashboard.jsx
    │   │   ├── Discover.jsx
    │   │   └── Offers.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CreatorCard.jsx
    │   │   ├── OfferCard.jsx
    │   │   └── TransactionList.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   └── App.jsx
    └── package.json
```

---

## Step 1 — Set Up Your Backend

```bash
mkdir tehilla && cd tehilla
mkdir backend && cd backend
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken dotenv cors axios
npm install --save-dev nodemon
```

Create your `backend/src/app.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/creators', require('./routes/creator.routes'));
app.use('/api/brands', require('./routes/brand.routes'));
app.use('/api/offers', require('./routes/offer.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

app.get('/', (req, res) => res.json({ message: 'Tehilla API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Step 2 — Database Schema (Prisma)

Create `backend/src/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(CREATOR)
  createdAt DateTime @default(now())

  creator   Creator?
  brand     Brand?
}

enum Role {
  CREATOR
  BRAND
  ADMIN
}

model Creator {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])
  name         String
  handle       String   @unique
  niche        String
  bio          String?
  followers    Int
  engagement   Float
  baseRate     Float
  platforms    String[]
  paystackCode String?
  balance      Float    @default(0)
  createdAt    DateTime @default(now())

  offersReceived Offer[] @relation("CreatorOffers")
  transactions   Transaction[]
}

model Brand {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  name      String
  industry  String
  website   String?
  createdAt DateTime @default(now())

  offersSent Offer[] @relation("BrandOffers")
}

model Offer {
  id          String      @id @default(uuid())
  brandId     String
  brand       Brand       @relation("BrandOffers", fields: [brandId], references: [id])
  creatorId   String
  creator     Creator     @relation("CreatorOffers", fields: [creatorId], references: [id])
  title       String
  description String
  amount      Float
  platform    String
  deadline    DateTime
  status      OfferStatus @default(PENDING)
  createdAt   DateTime    @default(now())

  transaction Transaction?
}

enum OfferStatus {
  PENDING
  ACCEPTED
  REJECTED
  COMPLETED
  CANCELLED
}

model Transaction {
  id            String   @id @default(uuid())
  offerId       String   @unique
  offer         Offer    @relation(fields: [offerId], references: [id])
  creatorId     String
  creator       Creator  @relation(fields: [creatorId], references: [id])
  grossAmount   Float
  platformFee   Float
  netAmount     Float
  paystackRef   String?
  stripeRef     String?
  status        String   @default("pending")
  createdAt     DateTime @default(now())
}
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 3 — Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/tehilla"
JWT_SECRET="your_super_secret_key_here"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
PORT=5000
```

---

## Step 4 — API Endpoints

### Auth Routes `/api/auth`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register creator or brand |
| POST | `/login` | Login and get JWT token |
| GET | `/me` | Get current logged in user |

### Creator Routes `/api/creators`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all creators (brands browse this) |
| GET | `/:id` | Get single creator profile |
| PUT | `/:id` | Update creator profile |
| POST | `/:id/bank` | Add Paystack bank account |
| GET | `/:id/balance` | Get creator earnings balance |

### Offer Routes `/api/offers`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Brand sends offer to creator |
| GET | `/creator/:id` | Get all offers for a creator |
| GET | `/brand/:id` | Get all offers sent by brand |
| PUT | `/:id/accept` | Creator accepts offer |
| PUT | `/:id/reject` | Creator rejects offer |
| PUT | `/:id/complete` | Mark offer as completed |

### Payment Routes `/api/payments`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/initiate` | Brand pays via Stripe |
| POST | `/payout` | Send money to creator via Paystack |
| GET | `/transactions/:creatorId` | Get transaction history |
| POST | `/webhook/paystack` | Paystack webhook handler |
| POST | `/webhook/stripe` | Stripe webhook handler |

---

## Step 5 — Paystack Service

Create `backend/src/services/paystack.service.js`:

```javascript
const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';
const headers = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
};

// Verify creator's bank account
const verifyBankAccount = async (accountNumber, bankCode) => {
  const res = await axios.get(
    `${PAYSTACK_BASE}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers }
  );
  return res.data;
};

// Create a transfer recipient (creator's bank)
const createTransferRecipient = async (name, accountNumber, bankCode) => {
  const res = await axios.post(`${PAYSTACK_BASE}/transferrecipient`, {
    type: 'nuban',
    name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency: 'NGN',
  }, { headers });
  return res.data.data.recipient_code;
};

// Send money to creator
const sendPayout = async (recipientCode, amount, reason) => {
  const res = await axios.post(`${PAYSTACK_BASE}/transfer`, {
    source: 'balance',
    amount: amount * 100, // Paystack uses kobo
    recipient: recipientCode,
    reason,
  }, { headers });
  return res.data;
};

module.exports = { verifyBankAccount, createTransferRecipient, sendPayout };
```

---

## Step 6 — Payment Controller (10% Cut Logic)

Create `backend/src/controllers/payment.controller.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const { sendPayout } = require('../services/paystack.service');
const prisma = new PrismaClient();

const PLATFORM_FEE = 0.10; // 10%

const processPayment = async (req, res) => {
  try {
    const { offerId } = req.body;

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { creator: true, brand: true },
    });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });

    const grossAmount = offer.amount;
    const platformFee = grossAmount * PLATFORM_FEE;
    const netAmount = grossAmount - platformFee;

    // Send payout to creator via Paystack
    const payout = await sendPayout(
      offer.creator.paystackCode,
      netAmount,
      `Payment for ${offer.title}`
    );

    // Record transaction
    const transaction = await prisma.transaction.create({
      data: {
        offerId,
        creatorId: offer.creatorId,
        grossAmount,
        platformFee,
        netAmount,
        paystackRef: payout.data.transfer_code,
        status: 'processing',
      },
    });

    // Update offer status
    await prisma.offer.update({
      where: { id: offerId },
      data: { status: 'COMPLETED' },
    });

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { processPayment };
```

---

## Step 7 — Set Up React Frontend

```bash
cd .. && mkdir frontend && cd frontend
npm create vite@latest . -- --template react
npm install axios react-router-dom
npm run dev
```

---

## Step 8 — Frontend API Service

Create `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

---

## Monetization Summary

| Revenue Stream | Rate | Example |
|---------------|------|---------|
| Transaction cut | 10% | Brand pays ₦100k → You keep ₦10k |
| Premium brand listing | ₦25k/month | Featured placement in discovery |
| Creator verified badge | ₦5k one-time | Trust signal for top creators |

**Revenue projection:**
- 100 deals/month × avg ₦80k = ₦8M in GMV
- Your 10% cut = **₦800,000/month** from transactions alone

---

## Build Order (What to Code First)

1. ✅ Set up Node + Express server
2. ✅ Connect PostgreSQL + run Prisma migrations
3. ✅ Build auth (register/login with JWT)
4. ✅ Build creator profile CRUD
5. ✅ Build offer system (send/accept/reject)
6. ✅ Integrate Paystack payout
7. ✅ Integrate Stripe brand payment
8. ✅ Build React frontend pages
9. ✅ Connect frontend to backend API
10. ✅ Deploy backend to Railway, frontend to Vercel

---

## Useful Links
- Paystack Docs: https://paystack.com/docs/api/
- Stripe Docs: https://stripe.com/docs/api
- Prisma Docs: https://www.prisma.io/docs
- Railway (hosting): https://railway.app
- Vercel (frontend): https://vercel.com
