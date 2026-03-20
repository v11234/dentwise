import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import MobileMoneyPaymentSuccessEmail from "@/components/emails/MobileMoneyPaymentSuccessEmail";
import { sendEmail } from "@/lib/mailer";
import { PaymentPurpose } from "@prisma/client";

type CamPayWebhookPayload = {
  status?: string;
  from?: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CamPayWebhookPayload;
    const status = body.status?.toUpperCase();
    const from = body.from ? normalizePhone(body.from) : "";

    if (!status || !from) {
      return NextResponse.json({ ok: false, error: "Invalid webhook payload" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        phone: from,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      console.warn("[payment/webhook] No pending payment match", { from, status });
      return NextResponse.json({ ok: true });
    }

    if (status === "SUCCESSFUL") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });

      const clerk = await clerkClient();
      if (payment.purpose === PaymentPurpose.PLAN_SUBSCRIPTION) {
        await clerk.users.updateUser(payment.userId, {
          publicMetadata: {
            plan: payment.plan,
            paidAt: new Date().toISOString(),
          },
        });
      }

      if (payment.purpose === PaymentPurpose.DOCTOR_PRO_ACCOUNT) {
        const dbUser = await prisma.user.findUnique({ where: { clerkId: payment.userId } });
        if (dbUser) {
          await prisma.doctor.updateMany({
            where: { userId: dbUser.id },
            data: {
              accountStatus: "PENDING_PAYMENT",
              professionalActivatedAt: new Date(),
              isActive: false,
            },
          });
        }

        try {
          const clerkUser = await clerk.users.getUser(payment.userId);
          await clerk.users.updateUser(payment.userId, {
            publicMetadata: {
              ...(clerkUser.publicMetadata || {}),
              doctorProPaidAt: new Date().toISOString(),
            },
          });
        } catch (metadataError) {
          console.warn("[payment/webhook] Failed to update doctor metadata", metadataError);
        }
      }

      if (payment.method === "MOBILE_MONEY") {
        try {
          const clerkUser = await clerk.users.getUser(payment.userId);
          const primaryEmail =
            clerkUser.emailAddresses.find(
              (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
            )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

          if (!primaryEmail) {
            console.warn("[payment/webhook] Payment email skipped: no recipient email", {
              paymentId: payment.id,
            });
          } else {
            const fromEmail = process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`;
            if (!fromEmail) {
              console.warn("[payment/webhook] Payment email skipped: missing EMAIL_FROM or EMAIL_USER");
            } else {
              const paidAt = new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });
              const amount = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "XAF",
                maximumFractionDigits: 0,
              }).format(payment.amount);

              const emailHtml = await render(
                MobileMoneyPaymentSuccessEmail({
                  plan: payment.plan.toUpperCase(),
                  amount,
                  paymentId: payment.id,
                  paidAt,
                })
              );

              try {
                await sendEmail({
                  from: fromEmail,
                  to: primaryEmail,
                  subject: "Payment Received - DentWise",
                  html: emailHtml,
                  text: `Payment ${payment.id} for ${amount} was successful at ${paidAt}.`,
                });
              } catch (emailError) {
                console.error("[payment/webhook] Failed to send payment confirmation email", {
                  paymentId: payment.id,
                  error: emailError,
                });
              }
            }
          }
        } catch (emailError) {
          console.error("[payment/webhook] Unexpected error sending payment confirmation email", {
            paymentId: payment.id,
            error: emailError,
          });
        }
      }
    } else if (status === "FAILED") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[payment/webhook] failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
