import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PasswordForm } from "@/components/dashboard/password-form";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { SiteSettingsForm } from "@/components/dashboard/site-settings-form";
import { createClient, getSiteSettings } from "@/lib/supabase/server";

function PolishedCard({ color, className, children }: { color: string; className?: string; children: ReactNode }) {
  return (
    <Card className={`relative overflow-hidden ${className ?? ""}`} style={{ borderTop: `3px solid ${color}` }}>
      <span
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl"
        style={{ backgroundColor: color }}
      />
      {children}
    </Card>
  );
}

function PolishedCardHeader({
  color,
  title,
  description,
}: {
  color: string;
  title: string;
  description: string;
}) {
  return (
    <CardHeader>
      <div className="flex items-center gap-3">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
  );
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const defaultFullName = (user?.user_metadata?.full_name as string | undefined) ?? "";
  const defaultAvatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? "";
  const siteSettings = await getSiteSettings();

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your own account.</p>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <PolishedCard color="var(--chart-1)">
          <PolishedCardHeader
            color="var(--chart-1)"
            title="Profile"
            description="Your display name across the admin panel."
          />
          <CardContent>
            <ProfileForm defaultFullName={defaultFullName} defaultAvatarUrl={defaultAvatarUrl} />
          </CardContent>
        </PolishedCard>

        <PolishedCard color="var(--chart-2)">
          <PolishedCardHeader
            color="var(--chart-2)"
            title="Password"
            description="Change the password used to sign in."
          />
          <CardContent>
            <PasswordForm />
          </CardContent>
        </PolishedCard>
      </div>

      <PolishedCard color="var(--chart-3)">
        <PolishedCardHeader
          color="var(--chart-3)"
          title="Site Settings"
          description="Contact info and social links shown in the footer and contact section."
        />
        <CardContent>
          <SiteSettingsForm settings={siteSettings} />
        </CardContent>
      </PolishedCard>
    </div>
  );
}
