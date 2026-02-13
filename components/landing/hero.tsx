"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Zap } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/lib/types";

export function LandingHero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16 grid-bg">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary animate-fade-in-up">
          <Zap className="h-4 w-4" />
          Premium Gaming Protection
        </div>

        {/* Logo icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 glow-border animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Shield className="h-10 w-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground text-balance sm:text-5xl lg:text-6xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          Hernia Client
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          Advanced HWID-based license management with real-time monitoring,
          secure authentication, and a premium dashboard experience.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_24px_hsl(263_70%_58%/0.3)] px-8"
          >
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-border/50 text-foreground hover:bg-secondary/80 px-8"
          >
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          {[
            { label: "Active Users", value: "500+" },
            { label: "Uptime", value: "99.9%" },
            { label: "Avg Response", value: "<50ms" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
