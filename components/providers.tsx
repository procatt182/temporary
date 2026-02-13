"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: "glass !border-border/50 !text-foreground",
        }}
      />
    </AuthProvider>
  );
}
