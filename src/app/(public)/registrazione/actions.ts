"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import {
  welcomeAgencyEmail,
  adminNewAgencyEmail,
} from "@/lib/email/templates";

// ---------------------------------------------------------------------------
// Helper: clean orphan auth users (exist in auth.users but no agency record)
// ---------------------------------------------------------------------------

async function cleanOrphanAuthUser(
  supabase: ReturnType<typeof createAdminClient>,
  email: string
): Promise<boolean> {
  try {
    // Find the auth user by email
    const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const user = listData?.users?.find((u) => u.email === email);
    if (!user) return false;

    // Check if they have an active agency record
    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // If agency exists, this is NOT an orphan — don't delete
    if (agency) return false;

    // Orphan confirmed: delete auth user + user_roles
    await supabase.from("user_roles").delete().eq("user_id", user.id);
    await supabase.from("user_activity_log").delete().eq("user_id", user.id);
    await supabase.from("notifications").delete().eq("user_id", user.id);
    const { error } = await supabase.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("[Register] Error cleaning orphan user:", error.message);
      return false;
    }

    console.log(`[Register] Cleaned orphan auth user: ${email} (${user.id})`);
    return true;
  } catch (err) {
    console.error("[Register] cleanOrphanAuthUser error:", err);
    return false;
  }
}

export interface AgencyData {
  business_name: string;
  vat_number: string | null;
  fiscal_code: string | null;
  license_number: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  province: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  newsletter_consent?: boolean;
}

// ---------------------------------------------------------------------------
// registerAgency — server-side signup with auto-confirmed email
// The agency goes directly to "pending approval" status (no email confirm needed).
// ---------------------------------------------------------------------------

export async function registerAgency(
  data: AgencyData & { password: string },
  _origin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // 1. Create the user with email auto-confirmed via Admin API
    let { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          business_name: data.business_name,
          contact_name: data.contact_name,
          phone: data.phone,
        },
      });

    if (createError) {
      console.error("[Register] createUser error:", createError.message);

      // If user exists in auth but has no agency (orphan from a deleted agency),
      // clean up the orphan and retry registration automatically.
      if (
        createError.message.includes("already been registered") ||
        createError.message.includes("already exists")
      ) {
        const cleaned = await cleanOrphanAuthUser(supabase, data.email);
        if (cleaned) {
          const retry = await supabase.auth.admin.createUser({
            email: data.email,
            password: data.password,
            email_confirm: true,
            user_metadata: {
              business_name: data.business_name,
              contact_name: data.contact_name,
              phone: data.phone,
            },
          });
          if (!retry.error && retry.data?.user?.id) {
            userData = retry.data;
          } else {
            return {
              success: false,
              error: "Esiste già un account con questo indirizzo email.",
            };
          }
        } else {
          return {
            success: false,
            error: "Esiste già un account con questo indirizzo email.",
          };
        }
      } else {
        return { success: false, error: createError.message };
      }
    }

    const userId = userData?.user?.id;

    if (!userId) {
      console.error("[Register] No user ID returned");
      return {
        success: false,
        error: "Errore durante la registrazione. Riprova.",
      };
    }

    // 2. Create agency record (status: pending — awaiting admin approval)
    const { error: agencyError } = await supabase.from("agencies").insert({
      user_id: userId,
      business_name: data.business_name,
      vat_number: data.vat_number,
      fiscal_code: data.fiscal_code,
      license_number: data.license_number,
      address: data.address,
      city: data.city,
      zip_code: data.zip_code,
      province: data.province,
      contact_name: data.contact_name,
      phone: data.phone,
      email: data.email,
      website: data.website,
      newsletter_consent: data.newsletter_consent ?? false,
      status: "pending",
    });

    if (agencyError) {
      console.error("[Register] Error inserting agency:", agencyError);
      // Rollback: delete auth user if agency creation fails
      await supabase.auth.admin.deleteUser(userId);
      return { success: false, error: "Errore durante la registrazione. Riprova." };
    }

    // 3. Insert user role as 'agency'
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "agency",
    });

    if (roleError) {
      console.error("[Register] Error inserting user role:", roleError);
    }

    // 4. Send welcome email to the agency (account created, awaiting approval)
    try {
      await sendTransactionalEmail(
        { email: data.email, name: data.business_name },
        "Registrazione completata - MishaTravel",
        welcomeAgencyEmail(data.business_name)
      );
    } catch (emailErr) {
      console.error("[Register] Error sending welcome email:", emailErr);
    }

    // 5. Notify all super_admin users about the new agency registration
    try {
      const { data: superAdmins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "super_admin");

      if (superAdmins && superAdmins.length > 0) {
        const notifications = superAdmins.map(
          (admin: { user_id: string }) => ({
            user_id: admin.user_id,
            title: "Nuova agenzia registrata",
            message: `L'agenzia "${data.business_name}" ha richiesto la registrazione.`,
            link: "/admin/agenzie",
          })
        );

        await supabase.from("notifications").insert(notifications);
      }
    } catch (notifErr) {
      console.error("[Register] Error sending admin notifications:", notifErr);
    }

    // 6. Email: notify admin of new agency registration
    try {
      await sendAdminNotification(
        `Nuova agenzia registrata: ${data.business_name}`,
        adminNewAgencyEmail(
          data.business_name,
          data.contact_name,
          data.email,
          data.city
        )
      );
    } catch (emailErr) {
      console.error("[Register] Error sending admin notification:", emailErr);
    }

    return { success: true };
  } catch (err) {
    console.error("[Register] Unexpected error:", err);
    return {
      success: false,
      error: "Si è verificato un errore imprevisto. Riprova più tardi.",
    };
  }
}

// ---------------------------------------------------------------------------
// createAgencyRecord — kept for backward compatibility (e.g. admin-created)
// ---------------------------------------------------------------------------

export async function createAgencyRecord(
  userId: string,
  data: AgencyData
): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient();

    // Insert agency record
    const { error: agencyError } = await supabase.from("agencies").insert({
      user_id: userId,
      business_name: data.business_name,
      vat_number: data.vat_number,
      fiscal_code: data.fiscal_code,
      license_number: data.license_number,
      address: data.address,
      city: data.city,
      zip_code: data.zip_code,
      province: data.province,
      contact_name: data.contact_name,
      phone: data.phone,
      email: data.email,
      website: data.website,
      newsletter_consent: data.newsletter_consent ?? false,
      status: "pending",
    });

    if (agencyError) {
      console.error("Error inserting agency:", agencyError);
      return { error: agencyError.message };
    }

    // Insert user role as 'agency'
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "agency",
    });

    if (roleError) {
      console.error("Error inserting user role:", roleError);
      return { error: roleError.message };
    }

    // Notify all super_admin users about the new agency registration
    try {
      const { data: superAdmins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "super_admin");

      if (superAdmins && superAdmins.length > 0) {
        const notifications = superAdmins.map(
          (admin: { user_id: string }) => ({
            user_id: admin.user_id,
            title: "Nuova agenzia registrata",
            message: `L'agenzia "${data.business_name}" ha richiesto la registrazione.`,
            link: "/admin/agenzie",
          })
        );

        await supabase.from("notifications").insert(notifications);
      }
    } catch (notifErr) {
      // Don't fail the registration if notification fails
      console.error("Error sending admin notifications:", notifErr);
    }

    // --- Email: welcome email to the agency ---
    try {
      await sendTransactionalEmail(
        { email: data.email, name: data.business_name },
        "Benvenuto su MishaTravel!",
        welcomeAgencyEmail(data.business_name)
      );
    } catch (emailErr) {
      console.error("Error sending welcome email:", emailErr);
    }

    // --- Email: notify admin of new agency registration ---
    try {
      await sendAdminNotification(
        `Nuova agenzia registrata: ${data.business_name}`,
        adminNewAgencyEmail(
          data.business_name,
          data.contact_name,
          data.email,
          data.city
        )
      );
    } catch (emailErr) {
      console.error("Error sending admin notification email:", emailErr);
    }

    return { error: null };
  } catch (err) {
    console.error("Unexpected error in createAgencyRecord:", err);
    return { error: "Errore imprevisto durante la creazione del record agenzia." };
  }
}
