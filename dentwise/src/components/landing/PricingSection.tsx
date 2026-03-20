import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { CheckIcon } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "0 FCFA",
    period: "/month",
    description: "Best for booking and basic support",
    featured: false,
    cta: "Create Free Account",
    features: ["Unlimited appointment booking", "Dentist directory", "Basic chat guidance", "Visit reminders"],
  },
  {
    name: "AI Basic",
    price: "1900 FCFA",
    period: "/month",
    description: "Best for recurring consultations",
    featured: true,
    cta: "Start AI Basic",
    features: [
      "Everything in Free",
      "10 voice consultations each month",
      "Symptom triage and care suggestions",
      "Priority support",
      "Consultation history",
    ],
  },
  {
    name: "AI Pro",
    price: "2900 FCFA",
    period: "/month",
    description: "Best for unlimited AI guidance",
    featured: false,
    cta: "Upgrade to AI Pro",
    features: [
      "Everything in AI Basic",
      "Unlimited voice consultations",
      "Advanced care planning",
      "Personalized recommendations",
      "Highest support priority",
    ],
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-24 md:py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_26%,hsl(var(--secondary)/0.15),transparent_35%),radial-gradient(circle_at_84%_30%,hsl(var(--primary)/0.12),transparent_35%)]" />

      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Transparent plans for every stage of care</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-3xl border p-7 ${
                plan.featured
                  ? "border-primary/50 bg-white shadow-xl shadow-primary/15"
                  : "border-border/70 bg-white shadow-sm"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">{plan.name}</p>
              <div className="mt-3 flex items-end gap-1">
                <h3 className="text-4xl font-semibold tracking-tight">{plan.price}</h3>
                <span className="mb-1 text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

              <SignUpButton mode="modal">
                <Button variant={plan.featured ? "default" : "outline"} className="mt-6 w-full">
                  {plan.cta}
                </Button>
              </SignUpButton>

              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
