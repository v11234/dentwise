import { FileCheck2Icon, MapPinIcon, ShieldCheckIcon, StethoscopeIcon } from "lucide-react";

const items = [
  {
    icon: StethoscopeIcon,
    title: "Doctor Onboarding",
    text: "Doctors create professional accounts with verified identity and clinic details.",
  },
  {
    icon: FileCheck2Icon,
    title: "License Documents",
    text: "Upload medical/dental license, clinic permit, and required compliance records.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Professional Access",
    text: "Secure payment unlocks a professional account to manage patients and appointments.",
  },
  {
    icon: MapPinIcon,
    title: "Clinic Visibility",
    text: "Clinics appear on nearby patient maps to drive local bookings.",
  },
];

export default function Services() {
  return (
    <section id="services" className="px-6 py-24 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">Doctor Services</p>
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
            Built for verified doctors and nearby patient discovery
          </h2>
          <p className="mt-4 text-muted-foreground">
            Create your professional profile, upload required documentation, and activate your
            account to manage patients and receive appointment requests.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article key={item.title} className="rounded-2xl border border-border/70 bg-card/80 p-5">
              <item.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Create your professional doctor account</h3>
            <p className="text-sm text-muted-foreground">
              Upload your clinic documents, set your location, and activate your pro account.
            </p>
          </div>
          <a
            href="/doctor/register"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Get Doctor Account
          </a>
        </div>
      </div>
    </section>
  );
}
