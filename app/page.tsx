"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFaq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/footer";
import { Shield, LogIn, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:ring-primary/40">
              <Shield className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Hernia Client
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="border-border/50 text-foreground hover:bg-secondary/80">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative">
        <LandingHero />
        <LandingFeatures />
        <LandingPricing />
        <LandingFaq />
      </main>

      <LandingFooter />
    </div>
  );
}
