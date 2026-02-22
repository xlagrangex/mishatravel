"use client"

import Link from "next/link"
import { LogOut, ArrowRight, Pencil } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { UserRoleType } from "@/lib/types"
import { useAdminEdit } from "@/components/admin/AdminEditContext"

interface LoggedInBannerProps {
  role: UserRoleType
  email: string
  displayName?: string
}

const roleConfig: Record<
  UserRoleType,
  { label: string; panelUrl: string; panelLabel: string; bg: string }
> = {
  super_admin: {
    label: "Super Admin",
    panelUrl: "/admin",
    panelLabel: "Pannello Admin",
    bg: "bg-[#1B2D4F]",
  },
  admin: {
    label: "Admin",
    panelUrl: "/admin",
    panelLabel: "Pannello Admin",
    bg: "bg-[#1B2D4F]",
  },
  operator: {
    label: "Operatore",
    panelUrl: "/admin",
    panelLabel: "Pannello Admin",
    bg: "bg-[#1B2D4F]",
  },
  agency: {
    label: "Agenzia",
    panelUrl: "/agenzia/dashboard",
    panelLabel: "Dashboard Agenzia",
    bg: "bg-[#C41E2F]",
  },
}

const ADMIN_ROLES: UserRoleType[] = ["super_admin", "admin", "operator"]

export default function LoggedInBanner({ role, email, displayName }: LoggedInBannerProps) {
  const router = useRouter()
  const { adminEditUrl } = useAdminEdit()
  const config = roleConfig[role]
  const name = displayName || email
  const showEditLink = adminEditUrl && ADMIN_ROLES.includes(role)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className={`${config.bg} text-white`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-8 text-xs">
        <span>
          Connesso come <strong>{config.label}</strong> &mdash; {name}
        </span>
        <div className="flex items-center gap-3">
          {showEditLink && (
            <Link
              href={adminEditUrl}
              className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 transition-colors font-medium"
            >
              <Pencil className="size-3" />
              Modifica
            </Link>
          )}
          <Link
            href={config.panelUrl}
            className="flex items-center gap-1 hover:underline underline-offset-2"
          >
            {config.panelLabel}
            <ArrowRight className="size-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 hover:underline underline-offset-2 cursor-pointer"
          >
            <LogOut className="size-3" />
            Esci
          </button>
        </div>
      </div>
    </div>
  )
}
