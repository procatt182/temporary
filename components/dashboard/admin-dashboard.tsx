"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, onSnapshot, query, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HWID, UserDocument } from "@/lib/types";
import { isExpired } from "@/lib/types";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { HwidTable } from "@/components/dashboard/hwid-table";
import { AddHwidDialog } from "@/components/dashboard/add-hwid-dialog";
import { AdminUserManager } from "@/components/dashboard/admin-user-manager";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AdminDashboard() {
  const [hwids, setHwids] = useState<HWID[]>([]);
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
