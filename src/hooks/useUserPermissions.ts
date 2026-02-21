"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserRoleType, OperatorSection } from "@/lib/types";
import { SECTION_MAP } from "@/lib/auth/role-config";

export interface UserPermissions {
  userId: string | null;
  role: UserRoleType | null;
  permissions: OperatorSection[];
  isLoading: boolean;
  /** Check if user can access a given admin URL path segment */
  canAccess: (pathSegment: string) => boolean;
}

/**
 * Client-side hook that reads the current user's role and operator permissions
 * from Supabase. Used to dynamically show/hide sidebar items.
 *
 * - super_admin / admin: can access everything
 * - operator: can only access sections listed in operator_permissions
 * - agency: should not be in admin area at all
 */
export function useUserPermissions(): UserPermissions {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRoleType | null>(null);
  const [permissions, setPermissions] = useState<OperatorSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPermissions() {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || cancelled) {
          setIsLoading(false);
          return;
        }

        setUserId(user.id);

        // Get role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (cancelled) return;

        const userRole = (roleData?.role as UserRoleType) ?? null;
        setRole(userRole);

        // Get operator permissions only for operators
        if (userRole === "operator") {
          const { data: permData } = await supabase
            .from("operator_permissions")
            .select("section")
            .eq("user_id", user.id);

          if (!cancelled) {
            setPermissions(
              (permData ?? []).map((p) => p.section as OperatorSection)
            );
          }
        }
      } catch {
        // Silently fail - user may not be logged in
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPermissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const canAccess = (pathSegment: string): boolean => {
    // While loading, show everything to avoid flash
    if (isLoading) return true;

    // No role = no access (shouldn't happen in admin)
    if (!role) return true; // graceful fallback: show items, let server handle auth

    // Super admin and admin can access everything
    if (role === "super_admin" || role === "admin") return true;

    // Dashboard is always accessible
    if (pathSegment === "" || pathSegment === "admin") return true;

    // Check operator permissions
    const requiredSection = SECTION_MAP[pathSegment];
    if (!requiredSection) return true; // Unknown section, show it

    return permissions.includes(requiredSection);
  };

  return { userId, role, permissions, isLoading, canAccess };
}
