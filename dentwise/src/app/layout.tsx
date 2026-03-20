import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TanStackProvider from "@/components/providers/TanStackProvider";
import UserSync from "@/components/UserSync";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/components/LocaleProvider";
import { LOCALE_TAGS } from "@/lib/i18n";
import { getServerLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "DentWise | AI Dental Assistant",
  description:
    "AI-powered dental guidance with voice consultations, symptom triage, and appointment booking.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const lang = LOCALE_TAGS[locale] || locale;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased">
        <ClerkProvider>
          <ThemeProvider>
            <TanStackProvider>
              <LocaleProvider locale={locale}>
                <UserSync />
                <Toaster />
                {children}
              </LocaleProvider>
            </TanStackProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
