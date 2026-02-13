import { Shield } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/lib/types";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-12 px-4 lg:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">Hernia Client</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            Discord
          </a>
          <a href="#features" className="transition-colors hover:text-primary">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-primary">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-primary">
            FAQ
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60">
          {"Hernia Client. All rights reserved."}
        </p>
      </div>
    </footer>
  );
}
