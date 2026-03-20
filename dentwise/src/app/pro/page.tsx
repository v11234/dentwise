import Navbar from "@/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { CheckCircle2Icon, CrownIcon, CreditCardIcon, ShieldCheckIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import PaymentMethodSelector from "@/components/payments/PaymentMethodSelector";

async function ProPage() {
  const user = await currentUser();

  if (!user) redirect("/");

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <section className="mb-10 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-secondary/10 p-8">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                Premium access
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight">Upgrade to DentWise Pro</h1>
              <p className="text-muted-foreground">
                Choose your preferred payment method and get instant access to advanced AI dental
                assistance and priority care features.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 border">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 border">
                  <CreditCardIcon className="h-4 w-4 text-primary" />
                  Credit card or local payment
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 border">
                  <CheckCircle2Icon className="h-4 w-4 text-primary" />
                  Fast plan activation
                </span>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/25 to-primary/10 rounded-full flex items-center justify-center shadow-lg">
                <CrownIcon className="w-16 h-16 text-primary" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Choose your subscription</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Select how you want to pay: credit card, mobile money, or bank transfer.
            </p>
          </div>
          <PaymentMethodSelector />
        </section>
      </div>
    </>
  );
}

export default ProPage;
