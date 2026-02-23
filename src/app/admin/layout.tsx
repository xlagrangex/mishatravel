import type { Metadata } from "next";
import { Toaster } from "sonner";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin - MishaTravel",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      {children}
      <Toaster richColors position="top-right" />
    </AdminShell>
  );
}
