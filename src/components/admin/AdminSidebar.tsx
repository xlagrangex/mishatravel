"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import {
  LayoutDashboard,
  Map,
  Plane,
  Ship,
  Anchor,
  Calendar,
  MapPin,
  Users,
  UserCog,
  FileText,
  BookOpen,
  FolderOpen,
  Image,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Each nav item either has a href (link) or is a separator.
 * The `pathSegment` is the key used by SECTION_MAP to check permissions.
 */
const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, pathSegment: "admin" },
  { type: "separator" as const, label: "Contenuti" },
  { label: "Tour", href: "/admin/tours", icon: Plane, pathSegment: "tours" },
  { label: "Crociere", href: "/admin/crociere", icon: Ship, pathSegment: "crociere" },
  { label: "Flotta", href: "/admin/flotta", icon: Anchor, pathSegment: "flotta" },
  { label: "Partenze", href: "/admin/partenze", icon: Calendar, pathSegment: "partenze" },
  { label: "Destinazioni", href: "/admin/destinazioni", icon: MapPin, pathSegment: "destinazioni" },
  { type: "separator" as const, label: "Comunicazione" },
  { label: "Blog", href: "/admin/blog", icon: BookOpen, pathSegment: "blog" },
  { label: "Cataloghi", href: "/admin/cataloghi", icon: FolderOpen, pathSegment: "cataloghi" },
  { label: "Media", href: "/admin/media", icon: Image, pathSegment: "media" },
  { type: "separator" as const, label: "Gestione" },
  { label: "Agenzie", href: "/admin/agenzie", icon: Users, pathSegment: "agenzie" },
  { label: "Preventivi", href: "/admin/preventivi", icon: FileText, pathSegment: "preventivi" },
  { label: "Estratti Conto", href: "/admin/estratti-conto", icon: FileSpreadsheet, pathSegment: "estratti-conto" },
  { label: "Utenti", href: "/admin/utenti", icon: UserCog, pathSegment: "utenti" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { canAccess } = useUserPermissions();

  // Filter nav items based on permissions
  const visibleItems = navItems.filter((item) => {
    // Separators are always included initially; we'll prune empty sections below
    if ("type" in item && item.type === "separator") return true;
    const navItem = item as { pathSegment: string };
    return canAccess(navItem.pathSegment);
  });

  // Remove separators that have no visible items after them
  const filteredItems: typeof navItems = [];
  for (let i = 0; i < visibleItems.length; i++) {
    const item = visibleItems[i];
    if ("type" in item && item.type === "separator") {
      // Check if there are any visible link items before the next separator (or end)
      let hasVisibleChild = false;
      for (let j = i + 1; j < visibleItems.length; j++) {
        if ("type" in visibleItems[j] && (visibleItems[j] as { type: string }).type === "separator") break;
        hasVisibleChild = true;
        break;
      }
      if (hasVisibleChild) {
        filteredItems.push(item);
      }
    } else {
      filteredItems.push(item);
    }
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              M
            </div>
            <span className="font-heading text-lg font-semibold text-secondary">
              MishaTravel
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin" className="mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              M
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item, index) => {
            if ("type" in item && item.type === "separator") {
              if (collapsed) return <li key={index} className="my-3 border-t border-border" />;
              return (
                <li key={index} className="px-3 pb-1 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                </li>
              );
            }

            const navItem = item as { label: string; href: string; icon: React.ElementType; pathSegment: string };
            const isActive =
              navItem.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(navItem.href);
            const Icon = navItem.icon;

            const linkContent = (
              <Link
                href={navItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{navItem.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={navItem.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {navItem.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={navItem.href}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Comprimi</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
