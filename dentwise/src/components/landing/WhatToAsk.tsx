import { MessageCircleMoreIcon, ShieldCheckIcon, StethoscopeIcon } from "lucide-react";

const prompts = [
  "My tooth hurts when I bite down. What might this indicate?",
  "Is gum bleeding after brushing a warning sign?",
  "How urgent is sensitivity to cold drinks?",
  "Should I choose filling, crown, or root canal?",
  "How much does professional whitening usually cost?",
  "What should I do after a tooth extraction?",
];

function WhatToAsk() {
  return (
    <section id="features" className="px-6 py-24 md:py-28">
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[2rem] border border-border/70 bg-white p-8 shadow-sm sm:p-10">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">Capabilities</p>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">Built for real patient conversations</h2>
          <p className="mb-8 text-muted-foreground">
            DentWise handles preventive, restorative, and urgent-care questions with clear and concise
            guidance patients can act on immediately.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {prompts.map((prompt) => (
              <div key={prompt} className="rounded-2xl border border-border/70 bg-slate-50 p-4 text-sm">
                {prompt}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <article className="rounded-3xl border border-border/70 bg-white p-7 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageCircleMoreIcon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Natural dialogue</h3>
            <p className="text-muted-foreground">The assistant asks relevant follow-ups instead of returning generic one-line answers.</p>
          </article>

          <article className="rounded-3xl border border-border/70 bg-white p-7 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <StethoscopeIcon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Clinical clarity</h3>
            <p className="text-muted-foreground">Outputs are organized around symptoms, likely causes, urgency, and next clinical actions.</p>
          </article>

          <article className="rounded-3xl border border-border/70 bg-white p-7 shadow-sm">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Safer care pathway</h3>
            <p className="text-muted-foreground">Patients know when to monitor, when to book, and when urgent in-person treatment is needed.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export default WhatToAsk;
