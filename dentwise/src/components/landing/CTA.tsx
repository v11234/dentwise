import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, CalendarIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0f766e_100%)] p-8 text-white shadow-2xl shadow-slate-900/25 md:p-12 lg:grid-cols-2">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">Start Today</p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Bring modern dental guidance to every patient interaction
          </h2>
          <p className="mt-4 max-w-xl text-white/80">
            Launch with a free account, then upgrade when you want more voice sessions and deeper
            AI-powered triage support.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignUpButton mode="modal">
              <Button size="lg" className="group min-w-44 bg-white text-slate-900 hover:bg-white/90">
                <MessageCircleIcon className="mr-2 h-4 w-4" />
                Start Free Chat
                <ArrowRightIcon className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </SignUpButton>

            <SignUpButton mode="modal">
              <Button size="lg" variant="outline" className="min-w-44 border-white/55 bg-transparent text-white hover:bg-white/10">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Consultation
              </Button>
            </SignUpButton>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute -top-6 left-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            Trusted by 1200+ patients
          </div>
          <Image src="/cta.png" alt="DentWise assistant" width={350} height={350} className="h-auto w-72 drop-shadow-2xl md:w-80" />
        </div>
      </div>
    </section>
  );
}

export default CTA;
