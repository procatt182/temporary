"use client";

import { useAuth } from "@/lib/auth-context";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { role, userDoc, loading } = useAuth();

  if (loading || !userDoc) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === "admin" || role === "moderator") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
