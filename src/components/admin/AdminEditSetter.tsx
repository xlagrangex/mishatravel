"use client"

import { useEffect } from "react"
import { useAdminEdit } from "./AdminEditContext"

export default function AdminEditSetter({ url }: { url: string }) {
  const { setAdminEditUrl } = useAdminEdit()

  useEffect(() => {
    setAdminEditUrl(url)
    return () => setAdminEditUrl(null)
  }, [url, setAdminEditUrl])

  return null
}
