"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "AD";

  return (
    <header className="relative z-20 flex h-16 items-center justify-between border-b border-border/50 bg-card/40 px-4 backdrop-blur-xl lg:px-6">
      {/* Subtle top glow line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold text-foreground">
          License Manager
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline-block">
          {user?.email}
        </span>
        <Avatar className="h-8 w-8 bg-primary/10 ring-1 ring-primary/20 transition-all hover:ring-primary/40 hover:shadow-[0_0_12px_hsl(263_70%_58%/0.15)]">
          <AvatarFallback className="bg-primary/10 text-xs text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
