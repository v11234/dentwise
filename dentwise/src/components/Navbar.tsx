"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  CalendarIcon,
  CrownIcon,
  HomeIcon,
  MicIcon,
  MessageCircleIcon,
  StethoscopeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTranslations } from "@/components/LocaleProvider";

function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const role = user?.publicMetadata?.role as string | undefined;
  const isDoctor = role === "doctor";
  const { t } = useTranslations();

  const linkClass = (path: string) =>
    `flex items-center gap-2 transition-colors ${
      pathname === path
        ? "text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
        {/* LEFT */}
        <div className="flex items-center gap-8">
          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="DentWise Logo"
              width={32}
              height={32}
              className="w-11"
            />
          </Link>

          {/* NAV LINKS */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <HomeIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("nav.dashboard")}</span>
            </Link>

            <Link href="/chat" className={linkClass("/chat")}>
              <MessageCircleIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("nav.chat")}</span>
            </Link>

            <Link href="/appointments" className={linkClass("/appointments")}>
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("nav.appointments")}</span>
            </Link>

            <Link href="/voice" className={linkClass("/voice")}>
              <MicIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("nav.voice")}</span>
            </Link>

            <Link href="/pro" className={linkClass("/pro")}>
              <CrownIcon className="w-4 h-4" />
              <span className="hidden md:inline">{t("nav.pro")}</span>
            </Link>

            {isDoctor && (
              <Link href="/doctor" className={linkClass("/doctor")}>
                <StethoscopeIcon className="w-4 h-4" />
                <span className="hidden md:inline">{t("nav.doctor")}</span>
              </Link>
            )}

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.emailAddresses?.[0]?.emailAddress}
            </span>
          </div>

          <UserButton />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
