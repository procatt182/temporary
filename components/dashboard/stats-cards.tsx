"use client";

import { useEffect, useState } from "react";
import { Database, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { HWID } from "@/lib/types";

interface StatsCardsProps {
  hwids: HWID[];
}

/** Animated number that counts up from 0. */
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    const duration = 600;
    const steps = 20;
    const stepTime = duration / steps;
    let current = 0;
    const increment = value / steps;
    const id = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(id);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(id);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

export function StatsCards({ hwids }: StatsCardsProps) {
  const total = hwids.length;
  const active = hwids.filter((h) => h.active).length;
  const inactive = total - active;
  const expiringSoon = hwids.filter((h) => {
    if (!h.active || h.expiresAt === null || h.expiresAt === undefined)
      return false;
    const diff = h.expiresAt - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    {
      label: "Total HWIDs",
      value: total,
      icon: Database,
      color: "text-primary",
      bgColor: "bg-primary/10",
      ringColor: "ring-primary/20",
      dotColor: "bg-primary",
    },
    {
      label: "Active",
      value: active,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      ringColor: "ring-emerald-400/20",
      dotColor: "bg-emerald-400",
    },
    {
      label: "Inactive",
      value: inactive,
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      ringColor: "ring-red-400/20",
      dotColor: "bg-red-400",
    },
    {
      label: "Expiring <24h",
      value: expiringSoon,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      ringColor: "ring-amber-400/20",
      dotColor: "bg-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-glow flex items-center gap-4 rounded-xl p-5 group"
        >
          <div
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bgColor} ring-1 ${stat.ringColor} transition-all duration-300 group-hover:ring-2`}
          >
            <stat.icon className={`h-6 w-6 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
            {/* Pulsing status dot */}
            <span
              className={`absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full ${stat.dotColor} ring-2 ring-card pulse-active`}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground animate-count-up">
              <AnimatedNumber value={stat.value} />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
