"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import {
  signupConfirmationEmail,
  welcomeAgencyEmail,
  adminNewAgencyEmail,
} from "@/lib/email/templates";

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
// registerAgency — full server-side signup with branded Brevo email
// ---------------------------------------------------------------------------

export async function registerAgency(
  data: AgencyData & { password: string },
  origin: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // 1. Create the user + generate signup confirmation link via Admin API
    //    This avoids Supabase sending its default email.
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: data.email,
        password: data.password,
        options: {
          data: {
            business_name: data.business_name,
            contact_name: data.contact_name,
            phone: data.phone,
          },
        },
      });

    if (linkError) {
      console.error("[Register] generateLink error:", linkError.message);
      if (linkError.message.includes("already been registered")) {
        return {
          success: false,
          error: "Esiste già un account con questo indirizzo email.",
        };
      }
      return { success: false, error: linkError.message };
    }

    const userId = linkData?.user?.id;
    const tokenHash = linkData?.properties?.hashed_token;

    if (!userId || !tokenHash) {
      console.error("[Register] No user or hashed_token returned");
      return {
        success: false,
        error: "Errore durante la registrazione. Riprova.",
      };
    }

    // 2. Send branded confirmation email via Brevo
    const baseUrl =
      origin || process.env.NEXT_PUBLIC_SITE_URL || "https://mishatravel.com";
    const confirmLink = `${baseUrl}/auth/confirm?token_hash=${encodeURIComponent(tokenHash)}&type=email`;

    try {
      await sendTransactionalEmail(
        { email: data.email, name: data.business_name },
        "Conferma il tuo account - MishaTravel",
        signupConfirmationEmail(data.business_name, confirmLink)
      );
    } catch (emailErr) {
      console.error("[Register] Error sending confirmation email:", emailErr);
    }

    // 3. Create agency record
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
      // User was created but agency record failed — still allow email confirm
    }

    // 4. Insert user role as 'agency'
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role: "agency",
    });

    if (roleError) {
      console.error("[Register] Error inserting user role:", roleError);
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
