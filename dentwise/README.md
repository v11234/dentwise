# DentWise

DentWise is a full-stack dental care platform that combines AI assistance with real clinic operations. It lets patients chat with an AI assistant, book appointments, and make payments, while doctors onboard with verified clinic details and manage patient requests.

DentWise is an AI-powered dental care platform built with Next.js. It includes:
- AI chat assistant (Gemini)
- Voice assistant integration (Vapi)
- Appointment booking and management
- Doctor professional onboarding + dashboard
- Admin dashboard
- Payment flows (card + local methods)
- Email notifications for appointment booking
- Nearby clinic discovery map for patients

## Tech Stack

- Next.js 15 (App Router, Turbopack)
- React 19 + TypeScript
- Prisma + PostgreSQL (Neon)
- Clerk (auth + billing UI)
- Tailwind CSS + shadcn/ui
- Gemini API (chat)
- Resend (transactional email)
- CamPay (mobile money collection)

## App Routes

- `/` landing page
- `/dashboard` user dashboard
- `/chat` AI chat
- `/voice` voice assistant
- `/appointments` appointment booking and history
- `/pro` subscription and payment page
- `/admin` admin dashboard
- `/doctor` doctor dashboard
- `/doctor/register` doctor onboarding

## API Routes

- `POST /api/chat`
  - AI chat backend (Gemini)
  - Includes graceful fallback for quota errors

- `POST /api/send-appointment-email`
  - Sends booking confirmation to user
  - Sends booking notification to doctor

- `POST /api/payment/create`
  - Starts payment flow
  - Supports `mobile_money` and `bank` methods

- `POST /api/payment/webhook`
  - Receives provider webhook updates
  - Marks payment success/failure
  - Updates Clerk user metadata on success

- `POST /api/doctors/register`
  - Creates doctor profile with clinic data + documents

- `POST /api/doctors/payment`
  - Starts doctor professional account payment

## Environment Variables

Create `.env` with the following keys:

```bash
# App + database
DATABASE_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADMIN_EMAIL=

# AI (Gemini)
GEMINI_API_KEY=
# Optional override
GEMINI_MODEL=gemini-2.0-flash

# Voice (Vapi)
NEXT_PUBLIC_VAPI_API_KEY=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=DentWise <no-reply@your-domain.com>

# Payments (CamPay)
CAMPAY_API_KEY=
# Optional; defaults to demo endpoint
CAMPAY_BASE_URL=https://demo.campay.net

# Bank transfer instructions (optional but recommended)
BANK_ACCOUNT_NAME=
BANK_NAME=
BANK_ACCOUNT_NUMBER=

# Doctor professional fee
DOCTOR_PRO_FEE=50000
NEXT_PUBLIC_DOCTOR_PRO_FEE=50000
```

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Configure `.env`

3. Sync Prisma schema

```bash
npx prisma generate
npx prisma db push
```

4. Start development server

```bash
npm run dev
```

5. Open

```text
http://localhost:3000
```

## Scripts

- `npm run dev` start dev server (Turbopack)
- `npm run build` production build
- `npm run start` run production server
- `npm run lint` run ESLint

## Core Workflows

### Appointment Booking
- User books appointment from `/appointments`
- Appointment is stored in DB with `PENDING` status
- API sends email to both:
  - patient (confirmation)
  - doctor (notification)
- Doctor accepts/rejects from `/doctor`

### Chat
- User sends message from `/chat`
- Backend calls Gemini
- On quota exhaustion, backend returns a friendly fallback response

### Payments
- User chooses preferred method on `/pro`:
  - Credit card (Clerk PricingTable)
  - Mobile money / bank transfer (local flow)
- Payment request stored in DB
- Webhook updates payment status and user plan metadata

### Doctor Professional Workflow
- Doctor submits clinic details + required documents
- Doctor pays professional account fee
- Account becomes active on payment success

## Troubleshooting

### Gemini 404 model not found
- Set a supported model:

```bash
GEMINI_MODEL=gemini-2.0-flash
```

### Gemini quota exceeded (429)
- Enable billing / increase quota on Gemini project
- App will still return a safe fallback message

### DB connection errors (Neon)
- Verify `DATABASE_URL`
- Ensure DB is reachable from your environment

### Resend emails not delivered
- Set `RESEND_FROM_EMAIL` to a verified domain sender
- Check Resend dashboard logs for recipient/provider errors

### CamPay demo amount limit
- Demo provider rejects high amounts
- Use demo-safe amounts or switch to production base URL

## Project Structure

```text
src/app
  /api
    /chat
    /payment/create
    /payment/webhook
    /send-appointment-email
    /doctors/register
    /doctors/payment
  /appointments
  /chat
  /dashboard
  /doctor
  /pro
  /voice

src/components
  /appointments
  /chat
  /dashboard
  /doctor
  /emails
  /landing
  /payments
  /ui

src/lib
  ai.ts
  prisma.ts
  resend.ts
  actions/*
```

## Notes

- Keep secrets in `.env` only; never commit real keys.
- For production, move from demo payment/email settings to live verified provider configs.
