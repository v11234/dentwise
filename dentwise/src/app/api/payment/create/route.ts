import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, PaymentPurpose } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPaymentSchema = z
  .object({
    plan: z.enum(["pro", "premium"]),
    method: z.enum(["mobile_money", "bank"]),
    phone: z.string().min(8).max(20).optional(),
    bankName: z.string().min(2).max(60).optional(),
    accountNumber: z.string().min(6).max(34).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "mobile_money" && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Phone is required for mobile money",
      });
    }

    if (data.method === "bank") {
      if (!data.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["bankName"],
          message: "Bank name is required for bank transfer",
        });
      }
      if (!data.accountNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["accountNumber"],
          message: "Account number is required for bank transfer",
        });
      }
    }
  });

const PLAN_PRICES: Record<"pro" | "premium", number> = {
  pro: 1900,
  premium: 2900,
};

const DEMO_PLAN_PRICES: Record<"pro" | "premium", number> = {
  pro: 20,
  premium: 21,
};

function sanitizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export async function POST(req: Request) {
  try {
    // get authenticated user from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createPaymentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
    }

    const method = parsed.data.method;
    const phone = parsed.data.phone ? sanitizePhone(parsed.data.phone) : "";
    const plan = parsed.data.plan;

    const camPayApiKey = process.env.CAMPAY_API_KEY;
    const camPayBaseUrl = process.env.CAMPAY_BASE_URL || "https://demo.campay.net";
    const isDemoProvider = camPayBaseUrl.includes("demo.campay.net");

    const amount = isDemoProvider ? DEMO_PLAN_PRICES[plan] : PLAN_PRICES[plan];
    const displayAmount = PLAN_PRICES[plan];

    if (!camPayApiKey) {
      return NextResponse.json({ error: "Payment provider is not configured" }, { status: 500 });
    }

    if (method === "bank") {
      const bankName = parsed.data.bankName!.trim();
      const accountNumber = parsed.data.accountNumber!.trim();

      const payment = await prisma.payment.create({
        data: {
          userId,
          phone: `BANK:${bankName}:${accountNumber.slice(-4)}`,
          amount: displayAmount,
          plan,
          method: PaymentMethod.BANK,
          purpose: PaymentPurpose.PLAN_SUBSCRIPTION,
          status: "AWAITING_BANK_TRANSFER",
        },
      });

      const bankInstructions = {
        beneficiaryName: process.env.BANK_ACCOUNT_NAME || "DentWise Ltd",
        beneficiaryBank: process.env.BANK_NAME || "DentWise Settlement Bank",
        beneficiaryAccountNumber: process.env.BANK_ACCOUNT_NUMBER || "0000000000",
        reference: `DW-${payment.id.slice(0, 8).toUpperCase()}`,
      };

      return NextResponse.json({
        message: "Bank transfer request created. Complete transfer using details provided.",
        paymentId: payment.id,
        plan,
        method,
        amountCharged: displayAmount,
        displayAmount,
        status: "AWAITING_BANK_TRANSFER",
        bankInstructions,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        phone,
        amount,
        plan,
        method: PaymentMethod.MOBILE_MONEY,
        purpose: PaymentPurpose.PLAN_SUBSCRIPTION,
      },
    });

    const response = await axios.post(
      `${camPayBaseUrl}/api/collect/`,
      {
        amount,
        currency: "XAF",
        from: phone,
        description: `DentWise ${plan} plan`,
      },
      {
        headers: {
          Authorization: `Token ${camPayApiKey}`,
        },
        timeout: 15000,
      }
    );

    return NextResponse.json({
      message: isDemoProvider
        ? "Demo payment initiated. Check your phone to confirm."
        : "Payment initiated. Check your phone to confirm.",
      paymentId: payment.id,
      plan,
      method,
      amountCharged: amount,
      displayAmount,
      isDemoProvider,
      provider: response.data,
    });
  } catch (error) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    console.error("[payment/create] failed", {
      providerStatus: err.response?.status,
      providerError: err.response?.data,
      message: err.message,
    });
    const providerMessage =
      typeof err.response?.data === "object" && err.response?.data
        ? (err.response.data as { message?: string }).message
        : undefined;

    if (err.response?.status === 400) {
      return NextResponse.json(
        {
          error:
            providerMessage ||
            "Payment request was rejected by provider. Please verify your details and try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to start payment. Please verify your number and try again." },
      { status: 500 }
    );
  }
}
