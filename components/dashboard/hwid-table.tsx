"use client";

import React, { useState, useMemo, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import type { HWID } from "@/lib/types";
import { formatTimeRemaining, isExpired } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Copy,
  Trash2,
  Search,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Infinity as InfinityIcon,
  Timer,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface HwidTableProps {
  hwids: HWID[];
  onAddClick: () => void;
}

type SortField = "hash" | "active" | "expires";
type SortDirection = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

export function HwidTable({ hwids, onAddClick }: HwidTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("hash");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HWID | null>(null);

  // Filter
  const filtered = useMemo(() => {
    return hwids.filter((h) =>
      h.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [hwids, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      switch (sortField) {
        case "hash":
          return dir * a.id.localeCompare(b.id);
        case "active":
          return dir * (Number(a.active) - Number(b.active));
        case "expires": {
          const aExp = a.expiresAt ?? Infinity;
          const bExp = b.expiresAt ?? Infinity;
          return dir * (aExp - bExp);
        }
        default:
          return 0;
      }
    });
  }, [filtered, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopy = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopiedId(hash);
    toast.success("Hash copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = async (hwid: HWID) => {
    try {
      await updateDoc(doc(db, "valid_hwids", hwid.id), {
        active: !hwid.active,
      });
      toast.success(
        `HWID ${!hwid.active ? "activated" : "deactivated"}`
      );
    } catch {
      toast.error("Failed to update HWID status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, "valid_hwids", deleteTarget.id));
      toast.success("HWID deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete HWID");
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by hash..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 border-border/50 bg-secondary/50 pl-9 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 transition-colors"
          />
        </div>
        <Button
          onClick={onAddClick}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_16px_hsl(263_70%_58%/0.2)]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add HWID
        </Button>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-xl glow-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("hash")}
                  >
                    Hash
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("active")}
                  >
                    Status
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("expires")}
                  >
                    Expires
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow className="border-border/50">
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {search
                      ? "No HWIDs matching your search."
                      : "No HWIDs found. Add your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((hwid, idx) => (
                  <TableRow
                    key={hwid.id}
                    className="border-border/50 table-row-glow"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Hash */}
                    <TableCell className="max-w-[300px]">
                      <div className="flex items-center gap-2">
                        <code className="truncate rounded bg-secondary/50 px-2 py-1 font-mono text-xs text-foreground">
                          {hwid.id}
                        </code>
                        <button
                          onClick={() => handleCopy(hwid.id)}
                          className="shrink-0 text-muted-foreground transition-all hover:text-foreground hover:scale-110"
                          aria-label="Copy hash"
                        >
                          {copiedId === hwid.id ? (
                            <Check className="h-4 w-4 text-primary" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>

                    {/* Active toggle */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={hwid.active}
                          onCheckedChange={() => handleToggleActive(hwid)}
                          aria-label={`Toggle active status for ${hwid.id}`}
                        />
                        <span className="flex items-center gap-1.5">
                          {hwid.active && (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-active" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                            </span>
                          )}
                          {!hwid.active && (
                            <span className="h-2 w-2 rounded-full bg-red-400" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              hwid.active
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {hwid.active ? "Active" : "Inactive"}
                          </span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Expires - live countdown */}
                    <TableCell>
                      <LiveExpiryBadge expiresAt={hwid.expiresAt} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(hwid)}
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all hover:scale-110"
                        aria-label="Delete HWID"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {sorted.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, sorted.length)} of{" "}
              {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border/50 bg-transparent transition-all hover:border-primary/30"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border/50 bg-transparent transition-all hover:border-primary/30"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="glass !bg-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete HWID
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this HWID? This action cannot be
              undone.
              {deleteTarget && (
                <code className="mt-2 block truncate rounded bg-secondary/50 px-2 py-1 font-mono text-xs text-foreground">
                  {deleteTarget.id}
                </code>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border/50 text-muted-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Live countdown badge that updates every second for short durations, every 30s for long ones. */
function LiveExpiryBadge({ expiresAt }: { expiresAt?: number | null }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (expiresAt === null || expiresAt === undefined) return;

    // Calculate update interval: 1s if < 1 hour, 10s if < 1 day, 30s otherwise
    const getInterval = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) return 0;
      if (diff < 60 * 60 * 1000) return 1000; // < 1hr: every second
      if (diff < 24 * 60 * 60 * 1000) return 10_000; // < 1 day: every 10s
      return 30_000; // otherwise every 30s
    };

    const interval = getInterval();
    if (interval === 0) return;

    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [expiresAt]);

  const label = formatTimeRemaining(expiresAt);
  const expired = isExpired(expiresAt);
  const lifetime = expiresAt === null || expiresAt === undefined;

  const expiringSoon =
    !lifetime && !expired && expiresAt! - Date.now() < 24 * 60 * 60 * 1000;

  const veryClose =
    !lifetime && !expired && expiresAt! - Date.now() < 60 * 60 * 1000;

  if (lifetime) {
    return (
      <Badge
        variant="outline"
        className="border-primary/30 bg-primary/10 text-primary font-medium text-xs gap-1"
      >
        <InfinityIcon className="h-3 w-3" />
        Lifetime
      </Badge>
    );
  }

  if (expired) {
    return (
      <Badge
        variant="outline"
        className="border-red-400/30 bg-red-400/10 text-red-400 font-medium text-xs gap-1"
      >
        <XCircle className="h-3 w-3" />
        Expired
      </Badge>
    );
  }

  if (veryClose) {
    return (
      <Badge
        variant="outline"
        className="border-red-400/30 bg-red-400/10 text-red-400 font-medium text-xs gap-1 animate-pulse"
      >
        <AlertTriangle className="h-3 w-3" />
        <span className="tabular-nums">{label}</span>
      </Badge>
    );
  }

  if (expiringSoon) {
    return (
      <Badge
        variant="outline"
        className="border-amber-400/30 bg-amber-400/10 text-amber-400 font-medium text-xs gap-1"
      >
        <AlertTriangle className="h-3 w-3" />
        <span className="tabular-nums">{label}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-border/50 bg-secondary/50 text-muted-foreground font-medium text-xs gap-1"
    >
      <Timer className="h-3 w-3" />
      <span className="tabular-nums">{label}</span>
    </Badge>
  );
}
