# DentWise UML Documentation Guide

This document explains the DentWise system from a UML perspective and maps the software implementation to UML diagrams.

## 1. System Overview

DentWise is a dental care platform that combines:

- Patient-facing appointment booking
- AI chat and voice assistance
- Subscription and local payments (mobile money, bank)
- Doctor professional onboarding with clinic verification
- Admin monitoring and analytics
- Email notification workflows

The backend uses Next.js API routes, Prisma models, Clerk authentication, and external integrations (Gemini, Vapi, CamPay, Resend).

## 2. Primary Actors

- `Patient/User`
- `Doctor`
- `Admin`
- `Payment Provider (CamPay)`
- `Email Provider (Resend)`
- `Auth Provider (Clerk)`
- `AI Provider (Gemini)`

## 3. Core Subsystems

- `Authentication & Identity`
  - Clerk sign-in/sign-up/session
  - User role metadata
- `Appointment Management`
  - Book, list, and update appointments
  - Doctor acceptance / rejection
- `Communication`
  - Appointment confirmation emails
  - Doctor notification emails
  - Payment success emails
- `Payments`
  - Mobile money initiation
  - Bank transfer request capture
  - Webhook-driven status updates
- `Doctor Onboarding`
  - Clinic profile creation
  - Document upload
  - Professional account fee
- `AI Assistant`
  - Chat endpoint for guidance responses
  - Voice assistant integration

## 4. UML Diagram Set Recommended

Use this set for complete system documentation:

1. `Use Case Diagram` (actors + goals)
2. `Class Diagram` (domain/data structure)
3. `Sequence Diagrams` (major request flows)
4. `Activity Diagrams` (business process logic)
5. `Component Diagram` (high-level architecture)
6. `Deployment Diagram` (runtime/infrastructure)
7. `State Diagram` (for Payment and Appointment status)

## 5. Use Case Scope

### Patient/User

- Register/Login
- Book appointment
- Receive confirmation email
- Download appointment receipt PDF
- Initiate payment (mobile money/bank)
- Receive payment success email
- Chat with AI assistant
- Use voice assistant
- View nearby clinics on map

### Doctor

- Create professional account
- Upload clinic documents
- Pay professional fee
- Accept/reject appointment requests
- View patients and schedule

### Admin

- Manage doctors
- Monitor appointments
- Review analytics

## 6. Class Diagram Mapping

The current data model is defined in `prisma/schema.prisma`.

Main classes/entities:

- `User`
- `Doctor`
- `DoctorDocument`
- `Appointment`
- `ChatSession`
- `ChatMessage`
- `Payment`

## 7. Key Sequence Diagrams to Draw

### A) Appointment Booking + Email

Participants:

- User UI
- Appointments Page
- Appointment Action/API
- Database
- Email API (`/api/send-appointment-email`)
- Resend

Flow summary:

1. User selects doctor/date/time and confirms booking.
2. Appointment is saved in DB as `PENDING`.
3. System sends patient + doctor emails.
4. Doctor accepts/rejects request.

### B) Mobile Money Payment Success

Participants:

- User UI (`/pro`)
- Payment Create API (`/api/payment/create`)
- CamPay
- Payment Webhook (`/api/payment/webhook`)
- Database
- Clerk
- Resend

Flow summary:

1. User initiates payment.
2. System stores pending payment and calls CamPay collect endpoint.
3. CamPay sends webhook callback.
4. Webhook updates payment to success/failure.
5. On success: update Clerk metadata + send payment success email.

### C) Doctor Professional Onboarding

Participants:

- Doctor UI (`/doctor/register`)
- Doctor Registration API (`/api/doctors/register`)
- Document storage
- Payment API (`/api/doctors/payment`)
- CamPay
- Payment Webhook

Flow summary:

1. Doctor submits profile + clinic documents.
2. System creates doctor profile in DB.
3. Doctor pays professional fee (mobile money or bank).
4. Webhook marks account as ACTIVE.

## 8. Activity Diagram Candidates

- Appointment request approval flow
- Doctor professional onboarding flow
- Payment processing flow

## 9. State Diagrams

### Payment States

- `PENDING`
- `SUCCESS`
- `FAILED`
- `AWAITING_BANK_TRANSFER`

### Appointment States

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `COMPLETED`
- `CANCELLED`

## 10. Component Diagram Mapping

Suggested components:

- `Web Client (Next.js pages/components)`
- `App API Layer (Next.js route handlers)`
- `Domain Actions (src/lib/actions/*)`
- `Database Layer (Prisma + PostgreSQL)`
- `External Providers`:
  - Clerk
  - Gemini
  - Vapi
  - CamPay
  - Resend

## 11. Deployment Diagram Mapping

Suggested deployment nodes:

- `Client Browser`
- `Next.js Application Server`
- `PostgreSQL Database`
- `External SaaS Services` (Clerk, CamPay, Resend, Gemini, Vapi)

## 12. Traceability (Code to UML)

Useful code locations for each UML diagram:

- Domain classes/entities:
  - `prisma/schema.prisma`
- Appointment flow:
  - `src/app/appointments/page.tsx`
  - `src/lib/actions/appointments.ts`
  - `src/app/api/send-appointment-email/route.ts`
- Payment flow:
  - `src/app/api/payment/create/route.ts`
  - `src/app/api/payment/webhook/route.ts`
- Doctor onboarding:
  - `src/app/doctor/register/page.tsx`
  - `src/app/api/doctors/register/route.ts`
  - `src/app/api/doctors/payment/route.ts`
- Email templates:
  - `src/components/emails/*`

## 13. Notes for Report Submission

- Keep UML names aligned with real class/route names from code.
- Clearly separate internal components from external services.
- Mark asynchronous callbacks (webhooks, email sends) in sequence diagrams.
- Document assumptions where implementation is implicit.
