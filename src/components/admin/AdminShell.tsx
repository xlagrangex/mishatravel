"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/30">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Mobile sidebar (sheet) */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <AdminSidebar
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
          <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
          <div className="p-6">{children}</div>
        </div>
      </div>
    </TooltipProvider>
  );
}
