"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  isSubscriptionActive,
  subscriptionLabel,
  formatTimeRemaining,
  remainingHwidChanges,
  hwidCooldownRemaining,
  formatCooldown,
  MAX_HWID_CHANGES,
  DISCORD_INVITE_URL,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Shield,
  Clock,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  Check,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

export function UserDashboard() {
  const { userDoc, user, refreshUserDoc } = useAuth();
  const [tick, setTick] = useState(0);
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [newHwid, setNewHwid] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  // Tick for countdown updates
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!userDoc || !user) return null;

  const subActive = isSubscriptionActive(userDoc);
  const remaining = remainingHwidChanges(userDoc);
  const cooldownMs = hwidCooldownRemaining(userDoc);
  const cooldownActive = cooldownMs > 0;
  const canChangeHwid = subActive && remaining > 0 && !cooldownActive;

  // Calculate real-time expiry countdown
  const expiryCountdown = userDoc.expirationDate
    ? formatTimeRemaining(userDoc.expirationDate)
    : userDoc.subscriptionType === "lifetime"
      ? "Never"
      : "N/A";

  const handleCopyHwid = async () => {
    if (!userDoc.hwid) return;
    await navigator.clipboard.writeText(userDoc.hwid);
    setCopiedHwid(true);
    toast.success("HWID copied to clipboard");
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleChangeHwid = async () => {
    if (!newHwid.trim()) return;
    setChangeLoading(true);

    try {
      const res = await fetch("/api/hwid/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          newHwid: newHwid.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change HWID");
        return;
      }

      toast.success("HWID changed successfully");
      setChangeDialogOpen(false);
      setNewHwid("");
      await refreshUserDoc();
    } catch {
      toast.error("Failed to change HWID");
    } finally {
      setChangeLoading(false);
    }
  };

  const handleSetInitialHwid = async () => {
    if (!newHwid.trim()) return;
    setChangeLoading(true);

    try {
      const res = await fetch("/api/hwid/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          hwid: newHwid.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to set HWID");
        return;
      }

      toast.success("HWID set successfully! Your license is now active.");
      setSetupDialogOpen(false);
      setNewHwid("");
      await refreshUserDoc();
    } catch {
      toast.error("Failed to set HWID");
    } finally {
      setChangeLoading(false);
    }
  };

  // If user has subscription but no HWID, show setup prompt
  if (subActive && !userDoc.hwid) {
    return (
      <div className="flex flex-col gap-6">
        <div className="animate-fade-in-up">
          <h1 className="text-2xl font-bold text-foreground">HWID Setup</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your license activation by registering your hardware ID.
          </p>
        </div>

        <div className="glass-glow rounded-xl p-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 glow-border">
              <Fingerprint className="h-8 w-8 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Register Your HWID</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Your subscription is active, but you need to register your Hardware ID to activate your license.
                Run the client on your device to find your HWID.
              </p>
            </div>

            {/* How to find HWID instructions */}
            <div className="w-full rounded-lg border border-border/50 bg-secondary/30 p-4 text-left">
              <h3 className="text-sm font-medium text-foreground mb-2">How to find your HWID:</h3>
              <ol className="flex flex-col gap-1.5 text-sm text-muted-foreground list-decimal pl-4">
                <li>Download and run the Hernia Client on your device</li>
                <li>The HWID will be displayed on the client login screen</li>
                <li>Copy the HWID string and paste it below</li>
              </ol>
            </div>

            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-2 text-left">
                <Label className="text-sm text-muted-foreground">Your HWID</Label>
                <Input
                  value={newHwid}
                  onChange={(e) => setNewHwid(e.target.value)}
                  placeholder="Enter your HWID string or SHA-256 hash..."
                  className="font-mono text-sm border-border/50 bg-secondary/50 text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Raw strings will be automatically hashed using SHA-256.
                </p>
              </div>

              <Button
                onClick={handleSetInitialHwid}
                disabled={changeLoading || !newHwid.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {changeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Activate License
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {userDoc.email}
        </p>
      </div>

      {/* Subscription status card */}
      <div className="glass-glow rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${
              subActive
                ? "bg-emerald-400/10 ring-emerald-400/20"
                : "bg-red-400/10 ring-red-400/20"
            }`}>
              {subActive ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
              <p className="text-sm text-muted-foreground">
                {subActive ? "Your subscription is active" : "No active subscription"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              subActive
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                : "border-red-400/30 bg-red-400/10 text-red-400"
            }
          >
            {subActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {userDoc.subscriptionType && (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {subscriptionLabel(userDoc.subscriptionType)}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-4">
              <p className="text-xs text-muted-foreground">Purchased</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {userDoc.purchaseDate
                  ? new Date(userDoc.purchaseDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/30 p-4">
              <div className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  {subActive ? "Time Remaining" : "Expires"}
                </p>
              </div>
              <p className="mt-1 text-lg font-semibold text-foreground tabular-nums">
                {expiryCountdown}
              </p>
            </div>
          </div>
        )}

        {/* Expiration date display */}
        {userDoc.expirationDate && userDoc.subscriptionType !== "lifetime" && (
          <div className="mt-4 rounded-lg border border-border/50 bg-secondary/20 p-3 flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Expires on:{" "}
              <span className="text-foreground font-medium">
                {new Date(userDoc.expirationDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          </div>
        )}

        {!userDoc.subscriptionType && (
          <div className="mt-6 rounded-lg border border-border/50 bg-secondary/30 p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              {"You don't have an active subscription. Join our Discord to purchase a license."}
            </p>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Discord
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* HWID Card */}
      <div className="glass-glow rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Fingerprint className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">HWID License</h2>
            <p className="text-sm text-muted-foreground">Your hardware identification</p>
          </div>
        </div>

        {/* Current HWID */}
        {userDoc.hwid ? (
          <div className="mb-6">
            <Label className="text-xs text-muted-foreground">Current HWID</Label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-secondary/50 px-3 py-2 font-mono text-xs text-foreground">
                {userDoc.hwid}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopyHwid}
              >
                {copiedHwid ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ) : null}

        {/* HWID Change Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-secondary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">HWID Changes Remaining</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {remaining}/{MAX_HWID_CHANGES}
              </p>
              <Progress
                value={(remaining / MAX_HWID_CHANGES) * 100}
                className="flex-1 h-2"
              />
            </div>
          </div>
          <div className="rounded-lg bg-secondary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Cooldown</p>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {cooldownActive ? formatCooldown(cooldownMs) : "Ready"}
            </p>
          </div>
        </div>

        {/* Change HWID Button */}
        {userDoc.hwid && (
          <div className="mt-6">
            {remaining === 0 ? (
              <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">HWID change limit reached</p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Please join our Discord for assistance with HWID changes.
                </p>
                <Button asChild size="sm" variant="outline" className="border-border/50 text-foreground">
                  <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Join Discord
                  </a>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setChangeDialogOpen(true)}
                disabled={!canChangeHwid}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Change HWID
                {cooldownActive && (
                  <span className="ml-2 text-xs opacity-75">
                    (Cooldown: {formatCooldown(cooldownMs)})
                  </span>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Change HWID Dialog */}
      <Dialog open={changeDialogOpen} onOpenChange={setChangeDialogOpen}>
        <DialogContent className="glass sm:max-w-md !bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground">Change HWID</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {`You have ${remaining} change(s) remaining. Enter your new HWID below.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                New HWID
              </Label>
              <Input
                value={newHwid}
                onChange={(e) => setNewHwid(e.target.value)}
                placeholder="Enter HWID string or SHA-256 hash..."
                className="font-mono text-sm border-border/50 bg-secondary/50 text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Raw strings will be automatically hashed using SHA-256.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setChangeDialogOpen(false)}
                className="border-border/50 text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangeHwid}
                disabled={changeLoading || !newHwid.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {changeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change HWID
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
