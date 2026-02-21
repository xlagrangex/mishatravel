"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AgenziaSidebar from "./AgenziaSidebar";
import AgenziaHeader from "./AgenziaHeader";
import { cn } from "@/lib/utils";

interface AgenziaShellProps {
  children: React.ReactNode;
  agencyName?: string;
  unreadCount?: number;
}

export default function AgenziaShell({
  children,
  agencyName,
  unreadCount,
}: AgenziaShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AgenziaSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Mobile sidebar (sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <AgenziaSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main content area */}
        <div
          className={cn(
            "transition-all duration-300",
            collapsed ? "lg:ml-16" : "lg:ml-64"
          )}
        >
          <AgenziaHeader
            onMenuToggle={() => setMobileOpen(true)}
            agencyName={agencyName}
            unreadCount={unreadCount}
          />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
