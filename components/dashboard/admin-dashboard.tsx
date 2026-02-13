"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HWID, UserDocument } from "@/lib/types";
import { isExpired } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { HwidTable } from "@/components/dashboard/hwid-table";
import { AddHwidDialog } from "@/components/dashboard/add-hwid-dialog";
import { AdminUserManager } from "@/components/dashboard/admin-user-manager";
import { Loader2, Lock, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Optional admin password gate. Set to empty string to disable.
const ADMIN_PANEL_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PANEL_PASSWORD || "";

export function AdminDashboard() {
  const [hwids, setHwids] = useState<HWID[]>([]);
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Password gate state
  const [authenticated, setAuthenticated] = useState(!ADMIN_PANEL_PASSWORD);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // Auto-deactivate expired HWIDs
  const deactivateExpired = useCallback(async (items: HWID[]) => {
    const expiredActive = items.filter(
      (h) => h.active && isExpired(h.expiresAt)
    );
    for (const hwid of expiredActive) {
      try {
        await updateDoc(doc(db, "valid_hwids", hwid.id), { active: false });
      } catch (err) {
        console.error("Failed to deactivate expired HWID:", hwid.id, err);
      }
    }
  }, []);

  // Realtime Firestore listener for HWIDs
  useEffect(() => {
    const q = query(collection(db, "valid_hwids"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: HWID[] = snapshot.docs.map((d) => ({
          id: d.id,
          active: d.data().active ?? true,
          expiresAt: d.data().expiresAt ?? null,
        }));
        setHwids(data);
        setLoading(false);
        deactivateExpired(data);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [deactivateExpired]);

  // Realtime Firestore listener for users
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: UserDocument[] = snapshot.docs.map((d) => d.data() as UserDocument);
        setUsers(data);
      },
      (error) => {
        console.error("Users snapshot error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Periodic check every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      deactivateExpired(hwids);
    }, 30_000);
    return () => clearInterval(interval);
  }, [hwids, deactivateExpired]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PANEL_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Password gate UI
  if (!authenticated) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="glass-glow rounded-2xl p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 glow-border">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">Admin Access</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the admin panel password to continue
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Enter admin password..."
                  className="border-border/50 bg-secondary/50 text-foreground"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive">Incorrect password</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Shield className="mr-2 h-4 w-4" />
                Access Panel
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading HWIDs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage Hernia Client licenses and users in real-time.
        </p>
      </div>

      <StatsCards hwids={hwids} />

      <Tabs defaultValue="hwids" className="animate-fade-in-up">
        <TabsList className="bg-secondary/50 border border-border/50">
          <TabsTrigger value="hwids" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            HWID Management
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hwids" className="mt-4">
          <HwidTable hwids={hwids} onAddClick={() => setAddDialogOpen(true)} />
          <AddHwidDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <AdminUserManager users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
