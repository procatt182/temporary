"use client";

import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [verificationSent, setVerificationSent] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
        setVerificationSent(true);
        toast.success("Account created! Check your email to verify.");
      } else {
        await signIn(email, password);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      if (message.includes("email-already-in-use")) {
        setError("An account with this email already exists.");
      } else if (message.includes("weak-password")) {
        setError("Password should be at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(mode === "signin" ? "Invalid email or password." : "Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-background p-4 grid-bg">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="glass-glow rounded-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">Check Your Email</h1>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              {"We've sent a verification link to"} <strong className="text-foreground">{email}</strong>.
              Please verify your email before signing in.
            </p>
            <Button
              onClick={() => {
                setVerificationSent(false);
                setMode("signin");
              }}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 grid-bg">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        {/* Back to home */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Glass card */}
        <div className="glass-glow rounded-2xl p-8">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 glow-border">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-foreground text-balance">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to your account"
                  : "Sign up to get started"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus:border-primary/30 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "At least 6 characters" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-border/50 bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 focus:border-primary/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20 animate-fade-in-up">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_20px_hsl(263_70%_58%/0.25)]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {loading
                ? mode === "signin" ? "Signing in..." : "Creating account..."
                : mode === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                {"Don't have an account? "}
                <button
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                {"Already have an account? "}
                <button
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
