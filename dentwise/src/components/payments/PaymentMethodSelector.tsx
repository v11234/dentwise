"use client";

import { useState } from "react";
import { PricingTable } from "@clerk/nextjs";
import { Building2Icon, CreditCardIcon, SmartphoneIcon } from "lucide-react";
import UpgradeCard from "./MobileMoneyPro";
import { cn } from "@/lib/utils";

type PaymentMethod = "card" | "local";

export default function PaymentMethodSelector() {
  const [method, setMethod] = useState<PaymentMethod>("card");

  return (
    <div className="space-y-5">
      <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-2 rounded-xl border p-1">
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            method === "card" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Credit Card
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMethod("local")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition",
            method === "local" ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
          )}
        >
          <span className="inline-flex items-center gap-2">
            <SmartphoneIcon className="h-4 w-4" />
            Mobile / Bank
          </span>
        </button>
      </div>

      {method === "card" ? (
        <div className="rounded-3xl border border-border/60 bg-card/80 p-4 md:p-6">
          <PricingTable />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <UpgradeCard plan="pro" price={1900} />
          <UpgradeCard plan="premium" price={2900} />
        </div>
      )}

      {method === "local" && (
        <p className="text-center text-xs text-muted-foreground">
          Local payments support <Building2Icon className="mx-1 inline h-3.5 w-3.5" />
          bank transfer and mobile money checkout.
        </p>
      )}
    </div>
  );
}

