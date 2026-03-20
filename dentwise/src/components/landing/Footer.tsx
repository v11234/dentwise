import Image from "next/image";

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-slate-50/80 px-6 py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Image src="/logo.png" alt="DentWise Logo" width={32} height={32} className="h-8 w-8" />
            <span className="text-lg font-semibold tracking-tight">DentWise</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Modern AI-powered dental guidance for faster, safer patient decisions.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em]">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#how-it-works" className="hover:text-foreground">How It Works</a>
            </li>
            <li>
              <a href="#features" className="hover:text-foreground">Capabilities</a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-foreground">Pricing</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em]">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Help Center</li>
            <li>Email Support</li>
            <li>Care Reminders</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em]">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Security</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl border-t border-border/60 pt-6 text-sm text-muted-foreground">
        <p>© 2026 DentWise. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
