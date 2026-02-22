"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AdminEditContextValue {
  adminEditUrl: string | null
  setAdminEditUrl: (url: string | null) => void
}

const AdminEditContext = createContext<AdminEditContextValue>({
  adminEditUrl: null,
  setAdminEditUrl: () => {},
})

export function AdminEditProvider({ children }: { children: ReactNode }) {
  const [adminEditUrl, setAdminEditUrl] = useState<string | null>(null)
  return (
    <AdminEditContext.Provider value={{ adminEditUrl, setAdminEditUrl }}>
      {children}
    </AdminEditContext.Provider>
  )
}

export function useAdminEdit() {
  return useContext(AdminEditContext)
}
