"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendTransactionalEmail, sendAdminNotification } from "@/lib/email/brevo";
import { welcomeAgencyEmail, adminNewAgencyEmail } from "@/lib/email/templates";

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
}

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
