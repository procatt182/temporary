"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import type { UserDocument, SubscriptionType, UserRole } from "@/lib/types";
import { isSubscriptionActive, subscriptionLabel, formatTimeRemaining } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  Edit,
  RotateCcw,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

interface Props {
  users: UserDocument[];
}

const ITEMS_PER_PAGE = 10;

export function AdminUserManager({ users }: Props) {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editUser, setEditUser] = useState<UserDocument | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit form state
  const [editRole, setEditRole] = useState<UserRole>("user");
  const [editSub, setEditSub] = useState<SubscriptionType>(null);
  const [editHwid, setEditHwid] = useState("");
  const [editExtendDays, setEditExtendDays] = useState("30");

  // Create user form state
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createRole, setCreateRole] = useState<UserRole>("user");
  const [createSub, setCreateSub] = useState<SubscriptionType>(null);
  const [createHwid, setCreateHwid] = useState("");

  const filtered = useMemo(() => {
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.uid.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const openEdit = (user: UserDocument) => {
    setEditUser(user);
    setEditRole(user.role);
    setEditSub(user.subscriptionType);
    setEditHwid(user.hwid || "");
    setEditExtendDays("30");
  };

  const adminUid = currentUser?.uid;

  const handleResetHwidCounter = async (targetUser: UserDocument) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resetHwidCounter",
          adminUid,
          targetUid: targetUser.uid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reset HWID counter");
        return;
      }
      toast.success(`HWID change counter reset for ${targetUser.email}`);
    } catch {
      toast.error("Failed to reset HWID counter");
    }
  };

  const handleExtendExpiration = async () => {
    if (!editUser) return;
    const days = parseInt(editExtendDays, 10);
    if (isNaN(days) || days <= 0) {
      toast.error("Enter a valid number of days");
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extendExpiration",
          adminUid,
          targetUid: editUser.uid,
          days,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to extend expiration");
        return;
      }
      toast.success(`Extended expiration by ${days} days`);
    } catch {
      toast.error("Failed to extend expiration");
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    try {
      const params: Record<string, unknown> = {
        action: "editUser",
        adminUid,
        targetUid: editUser.uid,
        role: editRole,
        subscriptionType: editSub,
        hwid: editHwid || null,
      };

      // If assigning a subscription and no purchase date, set one
      if (editSub && !editUser.purchaseDate) {
        params.purchaseDate = Date.now();
      }

      // If subscription changed to lifetime, clear expiration
      if (editSub === "lifetime") {
        params.expirationDate = null;
      } else if (editSub === "1month" && !editUser.expirationDate) {
        params.expirationDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      } else if (editSub === "3months" && !editUser.expirationDate) {
        params.expirationDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
      }

      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update user");
        return;
      }
      toast.success(`Updated user ${editUser.email}`);
      setEditUser(null);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createEmail || !createPassword) {
      toast.error("Email and password are required");
      return;
    }
    if (createPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setCreateLoading(true);
    try {
      // Calculate expiration date based on subscription type
      let expirationDate: number | null = null;
      if (createSub === "1month") {
        expirationDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      } else if (createSub === "3months") {
        expirationDate = Date.now() + 90 * 24 * 60 * 60 * 1000;
      }

      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createUser",
          adminUid,
          email: createEmail,
          password: createPassword,
          role: createRole,
          subscriptionType: createSub,
          expirationDate,
          hwid: createHwid || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create user");
        return;
      }
      toast.success(`User ${createEmail} created successfully`);
      setCreateDialogOpen(false);
      // Reset form
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("user");
      setCreateSub(null);
      setCreateHwid("");
    } catch {
      toast.error("Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Create User */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or UID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 border-border/50 bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 transition-colors"
          />
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_16px_hsl(263_70%_58%/0.2)]"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-xl glow-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Subscription</TableHead>
                <TableHead className="text-muted-foreground">Expires</TableHead>
                <TableHead className="text-muted-foreground">HWID Changes</TableHead>
                <TableHead className="text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {search ? "No users matching your search." : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((user) => (
                  <TableRow key={user.uid} className="border-border/50 table-row-glow">
                    <TableCell className="text-sm text-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "border-red-400/30 bg-red-400/10 text-red-400"
                            : user.role === "moderator"
                              ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                              : "border-border/50 bg-secondary/50 text-muted-foreground"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          isSubscriptionActive(user)
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                            : "border-border/50 bg-secondary/50 text-muted-foreground"
                        }
                      >
                        {subscriptionLabel(user.subscriptionType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {user.subscriptionType === "lifetime"
                        ? "Never"
                        : user.expirationDate
                          ? formatTimeRemaining(user.expirationDate)
                          : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">
                      {user.hwidChangeCount}/3
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleResetHwidCounter(user)}
                          title="Reset HWID counter"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          onClick={() => openEdit(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
              {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border/50 bg-transparent"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border/50 bg-transparent"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="glass sm:max-w-md !bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Role */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Role
              </Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className="border-border/50 bg-secondary/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscription */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Subscription</Label>
              <Select value={editSub || "none"} onValueChange={(v) => setEditSub(v === "none" ? null : v as SubscriptionType)}>
                <SelectTrigger className="border-border/50 bg-secondary/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* HWID */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">HWID</Label>
              <Input
                value={editHwid}
                onChange={(e) => setEditHwid(e.target.value)}
                placeholder="Enter HWID hash..."
                className="font-mono text-sm border-border/50 bg-secondary/50 text-foreground"
              />
            </div>

            {/* Extend Expiration */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <CalendarPlus className="h-3.5 w-3.5" /> Extend Expiration
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={editExtendDays}
                  onChange={(e) => setEditExtendDays(e.target.value)}
                  className="w-24 border-border/50 bg-secondary/50 text-foreground tabular-nums"
                  placeholder="30"
                />
                <span className="text-sm text-muted-foreground">days</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtendExpiration}
                  disabled={editLoading}
                  className="border-border/50 text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  <CalendarPlus className="mr-1 h-3.5 w-3.5" />
                  Extend
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditUser(null)}
                className="border-border/50 text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="glass sm:max-w-md !bg-card border-border/50">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create New User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manually add a new user with an active account. The user will be pre-verified and can sign in immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="user@example.com"
                className="border-border/50 bg-secondary/50 text-foreground"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showCreatePassword ? "text" : "password"}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="border-border/50 bg-secondary/50 pr-10 text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword(!showCreatePassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showCreatePassword ? "Hide password" : "Show password"}
                >
                  {showCreatePassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Role
              </Label>
              <Select value={createRole} onValueChange={(v) => setCreateRole(v as UserRole)}>
                <SelectTrigger className="border-border/50 bg-secondary/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscription */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">Subscription</Label>
              <Select value={createSub || "none"} onValueChange={(v) => setCreateSub(v === "none" ? null : v as SubscriptionType)}>
                <SelectTrigger className="border-border/50 bg-secondary/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1month">1 Month</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* HWID (optional) */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">HWID (optional)</Label>
              <Input
                value={createHwid}
                onChange={(e) => setCreateHwid(e.target.value)}
                placeholder="Enter HWID hash (optional)..."
                className="font-mono text-sm border-border/50 bg-secondary/50 text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="border-border/50 text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={createLoading || !createEmail || !createPassword}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
