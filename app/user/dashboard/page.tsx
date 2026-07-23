import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const joined = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {displayName}</h1>
        <p className="text-muted-foreground">Here&apos;s your account at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Email</CardDescription>
            <CardTitle className="text-lg">{user?.email}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Member since</CardDescription>
            <CardTitle className="text-lg">{joined}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
