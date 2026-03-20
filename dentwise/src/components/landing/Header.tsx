"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import ThemeToggle from "../ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="DentWise Logo" width={36} height={36} className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">DentWise</span>
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <button
            className="p-2 rounded-md border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Toggle menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#how-it-works" className="text-muted-foreground transition hover:text-foreground">
            How It Works
          </a>
          <a href="#services" className="text-muted-foreground transition hover:text-foreground">
            Services
          </a>
          <a href="#features" className="text-muted-foreground transition hover:text-foreground">
            Capabilities
          </a>
          <a href="#pricing" className="text-muted-foreground transition hover:text-foreground">
            Pricing
          </a>
          <Link href="/doctor/register" className="text-muted-foreground transition hover:text-foreground">
            Doctor Pro
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/doctor/register">
            <Button variant="outline" size="sm">
              Doctor Account
            </Button>
          </Link>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" className="shadow-md shadow-primary/25">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border/30 bg-background/95 px-4 py-3 backdrop-blur-xl">
          <div className="space-y-2 text-sm">
            <a href="#how-it-works" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              How It Works
            </a>
            <a href="#services" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              Services
            </a>
            <a href="#features" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              Capabilities
            </a>
            <a href="#pricing" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              Pricing
            </a>
            <Link href="/doctor/register" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              Doctor Pro
            </Link>
            <Link href="/doctor/register" className="block rounded-md px-2 py-2 text-muted-foreground hover:bg-muted/20 hover:text-foreground">
              Doctor Account
            </Link>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="w-full text-left">
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="w-full shadow-md shadow-primary/25">
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
