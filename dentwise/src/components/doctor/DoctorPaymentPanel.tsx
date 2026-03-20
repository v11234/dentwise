"use client";

import { useMemo, useState } from "react";
import { AlertCircleIcon, Building2Icon, CheckCircle2Icon, Loader2Icon, SmartphoneIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PaymentMethod = "mobile_money" | "bank";
type PaymentState = "idle" | "submitting" | "submitted" | "error";

type BankInstructions = {
  beneficiaryName: string;
  beneficiaryBank: string;
  beneficiaryAccountNumber: string;
  reference: string;
};

type Props = {
  fee: number;
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export default function DoctorPaymentPanel({ fee }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState<PaymentState>("idle");
  const [bankInstructions, setBankInstructions] = useState<BankInstructions | null>(null);

  const normalizedPhone = useMemo(() => normalizePhone(phone), [phone]);
  const isPhoneValid = normalizedPhone.length >= 8;
  const isBankFormValid = bankName.trim().length >= 2 && accountNumber.trim().length >= 6;
  const isSubmitting = status === "submitting";
  const isFormValid = method === "mobile_money" ? isPhoneValid : isBankFormValid;

  const pay = async () => {
    if (method === "mobile_money" && !isPhoneValid) {
      toast.error("Please enter a valid mobile money phone number.");
      return;
    }

    if (method === "bank" && !isBankFormValid) {
      toast.error("Please provide your bank name and account number.");
      return;
    }

    setStatus("submitting");
    setBankInstructions(null);

    try {
      const res = await fetch("/api/doctors/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          phone: method === "mobile_money" ? normalizedPhone : undefined,
          bankName: method === "bank" ? bankName.trim() : undefined,
          accountNumber: method === "bank" ? accountNumber.trim() : undefined,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        bankInstructions?: BankInstructions;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to start payment");
      }

      setStatus("submitted");
      if (method === "bank" && data.bankInstructions) {
        setBankInstructions(data.bankInstructions);
      }
      toast.success(data.message || "Payment started. Check your phone to approve.");
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "Payment failed";
      toast.error(message);
    }
  };

  return (
    <div className="rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="secondary">Doctor Professional Account</Badge>
          <h3 className="text-2xl font-semibold tracking-tight">{fee.toLocaleString()} FCFA</h3>
          <p className="text-sm text-muted-foreground">
            Pay once to activate your professional doctor account.
          </p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          {method === "mobile_money" ? (
            <SmartphoneIcon className="h-6 w-6" />
          ) : (
            <Building2Icon className="h-6 w-6" />
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setMethod("mobile_money")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition",
            method === "mobile_money"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          Mobile Money
        </button>
        <button
          type="button"
          onClick={() => setMethod("bank")}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition",
            method === "bank" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          )}
        >
          Bank Transfer
        </button>
      </div>

      <div className="space-y-3">
        {method === "mobile_money" ? (
          <>
            <label htmlFor="doctor-phone" className="text-sm font-medium">
              Mobile money number
            </label>
            <Input
              id="doctor-phone"
              placeholder="2376XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={cn(status === "error" && "border-destructive")}
            />
            <p className="text-xs text-muted-foreground">
              Use your MTN or Orange number with country code when possible.
            </p>
          </>
        ) : (
          <>
            <label htmlFor="doctor-bank-name" className="text-sm font-medium">
              Your bank name
            </label>
            <Input
              id="doctor-bank-name"
              placeholder="e.g. Afriland First Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={cn(status === "error" && "border-destructive")}
            />

            <label htmlFor="doctor-account-number" className="text-sm font-medium">
              Your bank account number
            </label>
            <Input
              id="doctor-account-number"
              placeholder="Enter account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={cn(status === "error" && "border-destructive")}
            />
          </>
        )}
      </div>

      <Button onClick={pay} disabled={isSubmitting || !isFormValid} className="mt-5 w-full">
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Initiating {method === "mobile_money" ? "payment" : "transfer request"}...
          </>
        ) : (
          method === "mobile_money" ? "Pay securely" : "Request bank transfer details"
        )}
      </Button>

      {status === "submitted" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0" />
          {method === "mobile_money"
            ? "Check your phone and confirm the payment prompt to activate your account."
            : "Use the bank details below to complete your transfer and include the reference code."}
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          We could not start this payment. Verify your number and try again.
        </div>
      )}

      {method === "bank" && bankInstructions && (
        <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm">
          <p className="font-semibold mb-2">Bank transfer instructions</p>
          <p>
            <span className="text-muted-foreground">Beneficiary:</span> {bankInstructions.beneficiaryName}
          </p>
          <p>
            <span className="text-muted-foreground">Bank:</span> {bankInstructions.beneficiaryBank}
          </p>
          <p>
            <span className="text-muted-foreground">Account number:</span>{" "}
            {bankInstructions.beneficiaryAccountNumber}
          </p>
          <p>
            <span className="text-muted-foreground">Reference:</span> {bankInstructions.reference}
          </p>
        </div>
      )}
    </div>
  );
}
