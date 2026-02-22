"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Gift,
  FileSpreadsheet,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/agenzia/dashboard", icon: LayoutDashboard },
  { label: "Le Mie Richieste", href: "/agenzia/richieste", icon: FileText },
  { label: "Offerte Ricevute", href: "/agenzia/offerte", icon: Gift },
  { label: "Estratto Conto", href: "/agenzia/estratto-conto", icon: FileSpreadsheet },
  { label: "Profilo", href: "/agenzia/profilo", icon: UserCircle },
];

interface AgenziaSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AgenziaSidebar({ collapsed, onToggle }: AgenziaSidebarProps) {
  const pathname = usePathname();

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
          <Link href="/agenzia/dashboard" className="flex items-center">
            <NextImage
              src="/images/logo/logo-logo.png"
              alt="MishaTravel"
              width={150}
              height={50}
              className="object-contain"
              priority
            />
          </Link>
        )}
        {collapsed && (
          <Link href="/agenzia/dashboard" className="mx-auto">
            <NextImage
              src="/images/logo/logo-cropped-logo-270x270.png"
              alt="MishaTravel"
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/agenzia/dashboard"
                ? pathname === "/agenzia/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.href}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* Go to public site */}
      <div className="border-t border-border px-2 py-2">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="flex items-center justify-center rounded-lg px-2 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <Globe className="h-5 w-5 shrink-0" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Vai al sito
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Globe className="h-5 w-5 shrink-0" />
            <span>Vai al sito</span>
          </Link>
        )}
      </div>

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
