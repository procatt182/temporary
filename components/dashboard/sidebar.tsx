"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Settings,
  LogOut,
  X,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { signOut, role } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:ring-primary/40 group-hover:shadow-[0_0_12px_hsl(263_70%_58%/0.15)]">
              <Shield className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Hernia Client
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role badge */}
        {role && (role === "admin" || role === "moderator") && (
          <div className="px-3 pt-3">
            <Badge
              variant="outline"
              className={cn(
                "w-full justify-center py-1 text-xs font-medium",
                role === "admin"
                  ? "border-red-400/30 bg-red-400/10 text-red-400"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-400"
              )}
            >
              {role === "admin" ? "Admin" : "Moderator"}
            </Badge>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_hsl(263_70%_58%/0.15)]"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform",
                    isActive && "scale-105"
                  )} />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary pulse-active" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom links */}
        <div className="border-t border-border/50 p-3 flex flex-col gap-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary/80 hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-400/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
