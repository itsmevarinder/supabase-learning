import Link from "next/link";
import {
  ArrowRight,
  GalleryHorizontal,
  Image as ImageIcon,
  Mail,
  Shield,
  Tag,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmissionsChart } from "@/components/dashboard/submissions-chart";
import { createClient } from "@/lib/supabase/server";

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Cycles through the site's own --chart-1..5 tokens (navy/gold/teal/wine/slate)
// so each stat tile gets a distinct, on-brand accent instead of one flat color.
const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: totalAdmins },
    { count: totalHeroBanners },
    { count: activeHeroBanners },
    { count: totalProjects },
    { count: activeProjects },
    { count: totalPlans },
    { count: totalSubmissions },
    { data: recentSubmissionDates },
    { data: latestSubmissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    supabase.from("hero_banners").select("*", { count: "exact", head: true }),
    supabase.from("hero_banners").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("pricing_plans").select("*", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("created_at").gte("created_at", fourteenDaysAgo.toISOString()),
    supabase
      .from("contact_submissions")
      .select("id, full_name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const dayBuckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    dayBuckets.set(dayKey(d), 0);
  }
  recentSubmissionDates?.forEach((row) => {
    const key = row.created_at.slice(0, 10);
    if (dayBuckets.has(key)) {
      dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    }
  });
  const chartData = Array.from(dayBuckets, ([date, count]) => ({ date, count }));

  const stats = [
    { label: "Total users", value: totalUsers ?? 0, icon: Users, href: "/admin/users" },
    { label: "Admins", value: totalAdmins ?? 0, icon: Shield, href: "/admin/users" },
    {
      label: "Hero banners",
      value: totalHeroBanners ?? 0,
      sub: `${activeHeroBanners ?? 0} active`,
      icon: GalleryHorizontal,
      href: "/admin/hero-banners",
    },
    {
      label: "Portfolio projects",
      value: totalProjects ?? 0,
      sub: `${activeProjects ?? 0} active`,
      icon: ImageIcon,
      href: "/admin/portfolio",
    },
    { label: "Pricing plans", value: totalPlans ?? 0, icon: Tag, href: "/admin/pricing" },
    {
      label: "Contact submissions",
      value: totalSubmissions ?? 0,
      icon: Mail,
      href: "/admin/contact-submissions",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground">A snapshot of your workspace.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <Link key={stat.label} href={stat.href}>
              <Card
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderTop: `3px solid ${color}` }}
              >
                <span
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.14]"
                  style={{ backgroundColor: color }}
                />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardDescription className="font-medium">{stat.label}</CardDescription>
                    <div
                      className="flex size-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
                    >
                      <stat.icon className="size-5" style={{ color }} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <CardTitle className="text-3xl">{stat.value}</CardTitle>
                    {stat.sub && <span className="text-sm text-muted-foreground">{stat.sub}</span>}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in oklch, var(--chart-1) 15%, transparent)" }}
              >
                <Mail className="size-4.5" style={{ color: "var(--chart-1)" }} />
              </div>
              <div>
                <CardTitle className="text-lg">Contact submissions — last 14 days</CardTitle>
                <CardDescription>
                  Daily count of &ldquo;Start Your Next Project&rdquo; form submissions.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SubmissionsChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent submissions</CardTitle>
            <CardDescription>The latest 5 messages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!latestSubmissions?.length ? (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            ) : (
              latestSubmissions.map((submission) => (
                <div key={submission.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initialsFor(submission.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium">{submission.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">{submission.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link
              href="/admin/contact-submissions"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all submissions
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
