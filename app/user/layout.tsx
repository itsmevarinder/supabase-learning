import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts already guards this route, but Server Components should never
  // rely on Proxy alone — verify again here.
  if (!user) {
    redirect("/login");
  }

  const userName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "there";

  return (
    <DashboardShell variant="user" roleLabel="Member" userEmail={user.email ?? ""} userName={userName}>
      {children}
    </DashboardShell>
  );
}
