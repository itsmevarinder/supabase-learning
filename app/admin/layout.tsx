import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient, getSiteSettings } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  if (user.app_metadata?.role !== "admin") {
    redirect("/");
  }

  const userName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Admin";
  const siteSettings = await getSiteSettings();

  return (
    <DashboardShell
      roleLabel="Admin"
      userEmail={user.email ?? ""}
      userName={userName}
      showLoginButton={siteSettings?.show_login_button ?? true}
    >
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            error: "!bg-destructive !text-white !border-destructive",
          },
        }}
      />
      {children}
    </DashboardShell>
  );
}
