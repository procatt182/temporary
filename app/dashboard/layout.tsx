"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEmailVerification } from "firebase/auth";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Email verification gate
  if (!user.emailVerified) {
    const handleResend = async () => {
      setSendingVerification(true);
      try {
        await sendEmailVerification(user);
        toast.success("Verification email sent!");
      } catch {
        toast.error("Failed to send verification email. Try again later.");
      } finally {
        setSendingVerification(false);
      }
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 grid-bg">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/3 blur-[100px]" />
        </div>
        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="glass-glow rounded-2xl p-8 text-center">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400/10 ring-1 ring-amber-400/20">
              <Mail className="h-7 w-7 text-amber-400" />
            </div>
            <h1 className="mb-2 text-2xl font-semibold text-foreground">Verify Your Email</h1>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              Please verify your email address to access the dashboard. Check your inbox for a verification link.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResend}
                disabled={sendingVerification}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {sendingVerification ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Resend Verification Email
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full border-border/50 text-muted-foreground"
              >
                {"I've Verified - Refresh"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="relative flex flex-1 flex-col grid-bg">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="relative z-10 flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
