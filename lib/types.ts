export interface HWID {
  id: string; // document ID (the hash itself)
  active: boolean;
  expiresAt?: number | null; // unix timestamp in ms, null = lifetime
}

export type DurationUnit =
  | "seconds"
  | "minutes"
  | "hours"
  | "days"
  | "weeks"
  | "months"
  | "lifetime";

export const DURATION_LABELS: Record<DurationUnit, string> = {
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
  days: "Days",
  weeks: "Weeks",
  months: "Months",
  lifetime: "Lifetime",
};

export const DURATION_MULTIPLIERS: Record<Exclude<DurationUnit, "lifetime" | "months">, number> = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
};

/** Compute the expiry timestamp given a duration amount and unit. Returns null for lifetime. */
export function computeExpiresAt(amount: number, unit: DurationUnit): number | null {
  if (unit === "lifetime") return null;
  const now = Date.now();
  if (unit === "months") {
    const d = new Date(now);
    d.setMonth(d.getMonth() + amount);
    return d.getTime();
  }
  return now + amount * DURATION_MULTIPLIERS[unit];
}

/** Returns a human-readable string for time remaining, or status text. */
export function formatTimeRemaining(expiresAt: number | null | undefined): string {
  if (expiresAt === null || expiresAt === undefined) return "Lifetime";
  const diff = expiresAt - Date.now();
  if (diff <= 0) return "Expired";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo ${days % 30}d`;
  if (weeks > 0) return `${weeks}w ${days % 7}d`;
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/** Check if an HWID is expired (has an expiresAt in the past). */
export function isExpired(expiresAt: number | null | undefined): boolean {
  if (expiresAt === null || expiresAt === undefined) return false;
  return Date.now() >= expiresAt;
}

// ── User document types ──

export type UserRole = "admin" | "moderator" | "user";

export type SubscriptionType = "1month" | "3months" | "lifetime" | null;

export interface UserDocument {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: number; // unix ms
  // Subscription
  subscriptionType: SubscriptionType;
  purchaseDate: number | null;
  expirationDate: number | null; // null = lifetime or no sub
  // HWID
  hwid: string | null;
  hwidChangeCount: number;
  lastHwidChangeDate: number | null;
}

export const MAX_HWID_CHANGES = 3;
export const HWID_COOLDOWN_DAYS = 7;
export const HWID_COOLDOWN_MS = HWID_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export const DISCORD_INVITE_URL = "https://discord.gg/placeholder";

/** Check if a user's subscription is currently active. */
export function isSubscriptionActive(user: UserDocument): boolean {
  if (!user.subscriptionType) return false;
  if (user.subscriptionType === "lifetime") return true;
  if (!user.expirationDate) return false;
  return Date.now() < user.expirationDate;
}

/** Returns remaining HWID changes (0-3). */
export function remainingHwidChanges(user: UserDocument): number {
  return Math.max(0, MAX_HWID_CHANGES - user.hwidChangeCount);
}

/** Returns milliseconds until HWID cooldown expires, or 0 if no cooldown active. */
export function hwidCooldownRemaining(user: UserDocument): number {
  if (!user.lastHwidChangeDate) return 0;
  const elapsed = Date.now() - user.lastHwidChangeDate;
  return Math.max(0, HWID_COOLDOWN_MS - elapsed);
}

/** Format milliseconds into a human readable countdown. */
export function formatCooldown(ms: number): string {
  if (ms <= 0) return "Ready";
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Subscription type display label. */
export function subscriptionLabel(type: SubscriptionType): string {
  switch (type) {
    case "1month": return "1 Month";
    case "3months": return "3 Months";
    case "lifetime": return "Lifetime";
    default: return "None";
  }
}
