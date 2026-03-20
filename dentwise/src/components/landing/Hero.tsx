"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, CalendarIcon, CircleCheckBigIcon, HeadphonesIcon } from "lucide-react";
import { Button } from "../ui/button";

const heroImages = ["/hero2.jpeg", "/hero3.jpeg", "/hero4.jpeg", "/hero5.jpeg", "/hero6.jpeg", "/hero1.png"];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroImages.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 md:pb-24 md:pt-32">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,#f8fbff_0%,#f5f8fc_40%,#ffffff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,hsl(var(--secondary)/0.18),transparent_35%),radial-gradient(circle_at_82%_24%,hsl(var(--primary)/0.16),transparent_36%)]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <HeadphonesIcon className="h-4 w-4" />
            AI Voice Assistant for Dental Care
          </div>

          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Professional dental guidance, whenever patients need it.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            DentWise combines AI triage, appointment booking, and clear care recommendations into
            one modern workflow for better oral-health decisions.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <SignUpButton mode="modal">
              <Button size="lg" className="group min-w-48">
                Start Voice Consultation
                <ArrowRightIcon className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
              </Button>
            </SignUpButton>
            <SignUpButton mode="modal">
              <Button size="lg" variant="outline" className="min-w-48 border-primary/35 bg-white/70">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Appointment
              </Button>
            </SignUpButton>
          </div>

          <div className="grid max-w-xl gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm">
              <p className="text-2xl font-semibold">24/7</p>
              <p className="text-muted-foreground">Availability</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm">
              <p className="text-2xl font-semibold">4.9/5</p>
              <p className="text-muted-foreground">Patient Experience</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm">
              <p className="text-2xl font-semibold">1200+</p>
              <p className="text-muted-foreground">Guided Cases</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-border/70 bg-white/85 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <div className="relative h-[420px] overflow-hidden rounded-[1.4rem] border border-border/60 md:h-[500px]">
              <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
                {heroImages.map((src, i) => (
                  <div key={src} className="relative h-full min-w-full">
                    <Image src={src} alt={`DentWise screen ${i + 1}`} fill priority={i === 0} className="object-cover" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-white">
                <p className="text-sm font-medium">Live assistant preview</p>
                <p className="text-xs text-white/85">Voice + chat support for pain, treatment, and booking</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="mb-1 font-semibold">Triage Confidence</p>
                <p className="text-muted-foreground">Structured responses with urgency cues</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                <p className="mb-1 font-semibold">Care Continuity</p>
                <p className="text-muted-foreground">Appointment and guidance in one place</p>
              </div>
            </div>
          </div>

          <div className="absolute -left-4 top-10 hidden rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 shadow-sm lg:block">
            <div className="flex items-center gap-1.5">
              <CircleCheckBigIcon className="h-3.5 w-3.5" />
              HIPAA-ready workflow
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
