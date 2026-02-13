"use client";

import { firebaseConfig } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ConfigEntry {
  key: string;
  envVar: string;
  value: string;
}

export default function SettingsPage() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const configEntries: ConfigEntry[] = [
    {
      key: "API Key",
      envVar: "NEXT_PUBLIC_FIREBASE_API_KEY",
      value: firebaseConfig.apiKey || "",
    },
    {
      key: "Auth Domain",
      envVar: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      value: firebaseConfig.authDomain || "",
    },
    {
      key: "Project ID",
      envVar: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      value: firebaseConfig.projectId || "",
    },
    {
      key: "Storage Bucket",
      envVar: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      value: firebaseConfig.storageBucket || "",
    },
    {
      key: "Messaging Sender ID",
      envVar: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      value: firebaseConfig.messagingSenderId || "",
    },
    {
      key: "App ID",
      envVar: "NEXT_PUBLIC_FIREBASE_APP_ID",
      value: firebaseConfig.appId || "",
    },
  ];

  const isPlaceholder = (value: string) =>
    value.startsWith("YOUR_") || value === "";

  const handleCopy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleReveal = (key: string) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value: string) => {
    if (value.length <= 4) return "****";
    return value.substring(0, 4) + "*".repeat(Math.min(value.length - 4, 20));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firebase configuration and environment variables.
        </p>
      </div>

      {/* Firebase Config */}
      <div className="glass-glow overflow-hidden rounded-xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="border-b border-border/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Firebase Configuration
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These values are loaded from environment variables. Set them in your
            Vercel project settings or .env.local file.
          </p>
        </div>

        <div className="divide-y divide-border/50">
          {configEntries.map((entry) => (
            <div
              key={entry.key}
              className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {entry.key}
                  </span>
                  {isPlaceholder(entry.value) ? (
                    <Badge
                      variant="outline"
                      className="border-red-400/30 text-red-400"
                    >
                      Not set
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-emerald-400/30 text-emerald-400"
                    >
                      Configured
                    </Badge>
                  )}
                </div>
                <code className="font-mono text-xs text-muted-foreground">
                  {entry.envVar}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <code className="max-w-[280px] truncate rounded bg-secondary/50 px-3 py-1.5 font-mono text-xs text-foreground">
                  {isPlaceholder(entry.value)
                    ? "Not configured"
                    : revealed[entry.key]
                      ? entry.value
                      : maskValue(entry.value)}
                </code>
                {!isPlaceholder(entry.value) && (
                  <>
                    <button
                      onClick={() => toggleReveal(entry.key)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label={
                        revealed[entry.key] ? "Hide value" : "Show value"
                      }
                    >
                      {revealed[entry.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleCopy(entry.value, entry.key)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      aria-label="Copy value"
                    >
                      {copiedKey === entry.key ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables Guide */}
      <div className="glass-glow overflow-hidden rounded-xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="border-b border-border/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Setup Guide
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <p>
              To configure Firebase, set the following environment variables in
              your deployment environment (Vercel, .env.local, etc.):
            </p>
            <div className="rounded-lg bg-secondary/50 p-4">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                {`NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef`}
              </pre>
            </div>
            <p>
              You can find these values in the Firebase Console under Project
              Settings. Make sure to also enable Email/Password authentication in
              the Firebase Authentication section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
