import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, BrainCircuitIcon, CalendarClockIcon, MessagesSquareIcon } from "lucide-react";
import { Button } from "../ui/button";

const steps = [
  {
    icon: MessagesSquareIcon,
    title: "Describe symptoms",
    description: "Patients ask by voice or text and get immediate, structured follow-up questions.",
  },
  {
    icon: BrainCircuitIcon,
    title: "Receive AI triage",
    description: "DentWise returns likely causes, urgency level, and practical next recommendations.",
  },
  {
    icon: CalendarClockIcon,
    title: "Book professional care",
    description: "Confirm appointments in seconds and keep all guidance attached to the care journey.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-24 md:py-28">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-14 max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">How It Works</p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">From dental concern to confirmed care in 3 steps</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className="rounded-3xl border border-border/70 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Step {idx + 1}</p>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12">
          <SignUpButton mode="modal">
            <Button size="lg" className="group">
              Explore DentWise
              <ArrowRightIcon className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
