"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Update agency profile
// ---------------------------------------------------------------------------

export async function updateAgencyProfile(
  agencyId: string,
  data: {
    business_name: string;
    vat_number?: string | null;
    fiscal_code?: string | null;
    license_number?: string | null;
    address?: string | null;
    city?: string | null;
    zip_code?: string | null;
    province?: string | null;
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify authenticated user owns this agency
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Non autenticato." };
    }

    const { data: agency } = await supabase
      .from("agencies")
      .select("id, user_id")
      .eq("id", agencyId)
      .single();

    if (!agency || agency.user_id !== user.id) {
      return { success: false, error: "Non autorizzato." };
    }

    // Update the agency record
    const { error } = await supabase
      .from("agencies")
      .update({
        business_name: data.business_name,
        vat_number: data.vat_number ?? null,
        fiscal_code: data.fiscal_code ?? null,
        license_number: data.license_number ?? null,
        address: data.address ?? null,
        city: data.city ?? null,
        zip_code: data.zip_code ?? null,
        province: data.province ?? null,
        contact_name: data.contact_name ?? null,
        phone: data.phone ?? null,
        email: data.email ?? null,
        website: data.website ?? null,
      })
      .eq("id", agencyId);

    if (error) {
      console.error("Error updating agency profile:", error);
      return { success: false, error: "Errore durante il salvataggio." };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in updateAgencyProfile:", err);
    return { success: false, error: "Errore imprevisto." };
  }
}

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

export async function changePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Error changing password:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Unexpected error in changePassword:", err);
    return { success: false, error: "Errore imprevisto." };
  }
}

// ---------------------------------------------------------------------------
// Save agency document
// ---------------------------------------------------------------------------

export async function saveAgencyDocument(
  agencyId: string,
  fileUrl: string,
  fileName: string
): Promise<{ error: string | null }> {
  try {
    // Verify the requesting user owns this agency
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Non autenticato." };

    const { data: agency } = await supabase
      .from("agencies")
      .select("id, user_id")
      .eq("id", agencyId)
      .single();

    if (!agency || agency.user_id !== user.id) {
      return { error: "Non autorizzato." };
    }

    // Use admin client to insert (bypasses RLS)
    const admin = createAdminClient();

    const { error } = await admin.from("agency_documents").insert({
      agency_id: agencyId,
      document_type: "visura_camerale",
      file_url: fileUrl,
      file_name: fileName,
    });

    if (error) {
      console.error("Error saving agency document:", error);
      return { error: error.message };
    }

    revalidatePath("/agenzia/profilo");
    return { error: null };
  } catch (err) {
    console.error("Unexpected error in saveAgencyDocument:", err);
    return { error: "Errore imprevisto." };
  }
}

// ---------------------------------------------------------------------------
// Delete agency document
// ---------------------------------------------------------------------------

export async function deleteAgencyDocument(
  documentId: string
): Promise<{ error: string | null }> {
  try {
    // Verify the requesting user owns the document's agency
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "Non autenticato." };

    // Use admin client to check & delete (bypasses RLS)
    const admin = createAdminClient();

    // Fetch the document to check ownership
    const { data: doc } = await admin
      .from("agency_documents")
      .select("id, agency_id")
      .eq("id", documentId)
      .single();

    if (!doc) return { error: "Documento non trovato." };

    // Verify user owns the agency
    const { data: agency } = await supabase
      .from("agencies")
      .select("id, user_id")
      .eq("id", doc.agency_id)
      .single();

    if (!agency || agency.user_id !== user.id) {
      return { error: "Non autorizzato." };
    }

    const { error } = await admin
      .from("agency_documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      console.error("Error deleting agency document:", error);
      return { error: error.message };
    }

    revalidatePath("/agenzia/profilo");
    return { error: null };
  } catch (err) {
    console.error("Unexpected error in deleteAgencyDocument:", err);
    return { error: "Errore imprevisto." };
  }
}
