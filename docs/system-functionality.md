# DentWise System Functionality Overview

## 1) Purpose and Scope
DentWise is a full-stack dental care platform that combines patient-facing AI assistance and appointment booking with doctor professional onboarding, payments, and admin oversight. The system supports three primary roles: Patient/User, Doctor, and Admin. It also integrates with external services for authentication, payments, email, AI chat, voice, and maps.

## 2) Primary Roles
Patient/User
- Registers and signs in via Clerk.
- Uses AI chat and voice assistance for guidance.
- Books appointments with doctors and tracks appointment status.
- Downloads appointment receipts.
- Views nearby clinics on a map.
- Subscribes to Pro via card, mobile money, or bank transfer.

Doctor
- Creates a professional account by submitting clinic details and required documents.
- Uploads profile image and verification documents.
- Pays a professional account fee to activate the account.
- Views appointment requests and accepts or rejects them.
- Manages a patient list derived from appointment history.

Admin
- Manages doctors (view, edit, activate/inactivate).
- Monitors appointment activity and marks appointments completed.
- Views analytics charts for appointments, doctor status, and payment statistics.

## 3) Core Modules and Features
Authentication and Identity
- Clerk handles sign-in, sign-up, and session management.
- User profiles are synced into the local database on first use.
- User metadata is stored in Clerk for plan and doctor status flags.

Patient Dashboard
- Shows upcoming accepted appointments and appointment stats.
- Includes a clinic map with nearby doctor locations using geolocation.
- Lets the user access AI chat, voice, appointments, and subscription features.

Appointments
- Patients submit appointment requests to a selected doctor.
- Appointments start with status PENDING.
- Doctors accept or reject requests from the doctor dashboard.
- Admin can mark accepted appointments as COMPLETED.
- Appointment confirmation emails are sent on booking request.

Doctor Professional Onboarding
- Doctors register at `/doctor/register`.
- Required uploads: profile image, medical/dental license, clinic operation license, government ID.
- Optional uploads: malpractice insurance, degree certificate.
- Required clinic fields: name, address, city, country, and location coordinates.
- After registration, doctor must pay a professional fee.
- Doctor account becomes ACTIVE on successful payment.

Payments
- Subscription payments for patients via Clerk card billing or CamPay mobile money/bank transfer.
- Doctor professional fee via CamPay mobile money or bank transfer.
- Payment status updated via webhook.
- Successful payments update Clerk metadata for subscription or doctor activation.

AI Chat
- Patient chat requests are processed using Gemini models.
- Messages are stored as chat sessions and chat messages in the database.
- Safe fallback responses are returned when quota or provider errors occur.

Voice Assistant
- Voice calls use Vapi with a configured assistant ID.
- Access requires valid Pro plan or successful payment record.

Admin Analytics
- Appointments trend chart over recent days.
- Doctor status distribution chart (ACTIVE, PENDING_PAYMENT, SUSPENDED).
- Payment progress chart for success vs pending.
- Revenue totals from successful payments.

## 4) System Workflows (End-to-End)
Appointment Request Flow
- Patient selects a doctor, date, time, and appointment type.
- Appointment is created with status PENDING.
- Email notifications are sent to patient and doctor.
- Doctor accepts or rejects the request.
- Admin may mark accepted appointments as COMPLETED.

Doctor Onboarding Flow
- Doctor submits clinic profile and required documents.
- Doctor pays professional account fee.
- Payment webhook activates the doctor account and sets metadata.

Patient Subscription Flow
- Patient selects a plan and payment method.
- Mobile money or bank transfer is handled by CamPay.
- Payment webhook updates payment status and Clerk plan metadata.

## 5) Data Model Summary
User
- Core identity synced from Clerk.
- One-to-many with appointments, payments, chat sessions.
- Optional one-to-one with doctor profile.

Doctor
- Professional profile with clinic details and location.
- Status controlled by DoctorAccountStatus.
- One-to-many with appointments and doctor documents.

Appointment
- Linked to patient (user) and doctor.
- Status controlled by AppointmentStatus.

Payment
- Tracks subscription and doctor professional fee.
- Purpose controlled by PaymentPurpose.

ChatSession and ChatMessage
- Stores AI chat history per user.

## 6) Status Enums
AppointmentStatus
- PENDING
- ACCEPTED
- REJECTED
- COMPLETED
- CANCELLED

DoctorAccountStatus
- PENDING_PAYMENT
- ACTIVE
- SUSPENDED

PaymentPurpose
- PLAN_SUBSCRIPTION
- DOCTOR_PRO_ACCOUNT

## 7) External Integrations
- Clerk for authentication, billing UI, and user metadata.
- CamPay for mobile money and bank transfer flows.
- Resend for transactional emails.
- Gemini for AI chat responses.
- Vapi for voice assistant calls.
- OpenStreetMap tiles with browser geolocation for clinic map.

## 8) Operational Notes
- Doctor account activation is tied to payment success.
- Appointment completion is admin-driven.
- Patient notification on doctor accept/reject is not implemented yet.
- File uploads are stored locally under `public/uploads` (should be moved to cloud storage for production).

## 9) Key Pages
- `/dashboard` patient dashboard
- `/appointments` appointment booking and history
- `/chat` AI chat
- `/voice` voice assistant
- `/pro` subscription payments
- `/doctor/register` doctor onboarding
- `/doctor` doctor dashboard
- `/admin` admin dashboard
