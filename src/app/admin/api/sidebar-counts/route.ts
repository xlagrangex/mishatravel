import { NextResponse } from "next/server";
import { getCurrentUser, getUserRole } from "@/lib/supabase/auth";
import { getUnreadCount } from "@/lib/supabase/queries/contact-submissions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getUserRole(user.id);
    if (!role || !["super_admin", "admin", "operator"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messaggi = await getUnreadCount();

    return NextResponse.json({ messaggi });
  } catch (err) {
    console.error("sidebar-counts error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
