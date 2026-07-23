"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteUserAction(userId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser || currentUser.app_metadata?.role !== "admin") {
    return { error: "Forbidden" };
  }

  const admin = createAdminClient();

  const { data: targetProfile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !targetProfile) {
    return { error: "User not found" };
  }

  if (targetProfile.role === "admin") {
    return { error: "Admin accounts can't be deleted" };
  }

  await admin.from("profiles").delete().eq("id", userId);

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    return { error: deleteError.message };
  }

  return {};
}
