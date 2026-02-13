"use client";

import React from "react";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sha256 } from "@/lib/hash";
import { toast } from "sonner";
import type { DurationUnit } from "@/lib/types";
import { DURATION_LABELS, computeExpiresAt } from "@/lib/types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Clock, Infinity as InfinityIcon } from "lucide-react";

interface AddHwidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DURATION_UNITS: DurationUnit[] = [
  "lifetime",
  "months",
  "weeks",
  "days",
  "hours",
  "minutes",
  "seconds",
];

export function AddHwidDialog({ open, onOpenChange }: AddHwidDialogProps) {
  const [rawInput, setRawInput] = useState("");
  const [durationAmount, setDurationAmount] = useState("30");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");
  const [loading, setLoading] = useState(false);

  const isLifetime = durationUnit === "lifetime";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    const amount = parseInt(durationAmount, 10);
    if (!isLifetime && (isNaN(amount) || amount <= 0)) {
      toast.error("Please enter a valid duration amount");
      return;
    }

    setLoading(true);
    try {
      const hash = await sha256(rawInput.trim());
      const expiresAt = computeExpiresAt(isLifetime ? 0 : amount, durationUnit);

      await setDoc(doc(db, "valid_hwids", hash), {
        active: true,
        expiresAt: expiresAt,
      });

      toast.success("HWID added successfully", {
        description: `Hash: ${hash.substring(0, 16)}... | ${
          isLifetime ? "Lifetime" : `${amount} ${DURATION_LABELS[durationUnit].toLowerCase()}`
        }`,
      });

      setRawInput("");
      setDurationAmount("30");
      setDurationUnit("days");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding HWID:", error);
      toast.error("Failed to add HWID", {
        description: "Please check your Firebase configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md !bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New HWID</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter a raw HWID string or an existing SHA-256 hash. Raw strings
            will be automatically hashed before saving.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="hwid-input" className="text-sm text-muted-foreground">
              HWID or SHA-256 Hash
            </Label>
            <Input
              id="hwid-input"
              placeholder="Enter raw HWID string or SHA-256 hash..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              required
              className="font-mono text-sm border-border/50 bg-secondary/50 text-foreground placeholder:text-muted-foreground/50"
            />
          </div>

          {/* Duration picker */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Duration
            </Label>
            <div className="flex items-center gap-2">
              {!isLifetime && (
                <Input
                  type="number"
                  min={1}
                  value={durationAmount}
                  onChange={(e) => setDurationAmount(e.target.value)}
                  className="w-24 border-border/50 bg-secondary/50 text-foreground tabular-nums"
                  placeholder="30"
                />
              )}
              <Select
                value={durationUnit}
                onValueChange={(v) => setDurationUnit(v as DurationUnit)}
              >
                <SelectTrigger
                  className={`border-border/50 bg-secondary/50 text-foreground ${
                    isLifetime ? "flex-1" : "flex-1"
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  {DURATION_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      <span className="flex items-center gap-2">
                        {unit === "lifetime" && <InfinityIcon className="h-3.5 w-3.5" />}
                        {DURATION_LABELS[unit]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLifetime ? (
              <p className="text-xs text-muted-foreground/70">
                This HWID will never expire.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/70">
                Expires{" "}
                {(() => {
                  const amount = parseInt(durationAmount, 10);
                  if (isNaN(amount) || amount <= 0) return "...";
                  const ts = computeExpiresAt(amount, durationUnit);
                  if (!ts) return "...";
                  return new Date(ts).toLocaleString();
                })()}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border/50 text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !rawInput.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-[0_0_16px_hsl(263_70%_58%/0.2)]"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {loading ? "Adding..." : "Add HWID"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
