import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleCheckBig,
  CircleHelp,
  EyeOff,
  GalleryHorizontal,
  Heart,
  Image as ImageIcon,
  Mail,
  MessageSquareQuote,
  Plus,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentStatusChart } from "@/components/dashboard/content-status-chart";
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

const QUICK_ACTIONS = [
  { label: "Add hero banner", href: "/admin/hero-banners/add-banners", icon: GalleryHorizontal },
  { label: "Add portfolio project", href: "/admin/portfolio/add-project", icon: ImageIcon },
  { label: "Add testimonial", href: "/admin/testimonials/add-testimonial", icon: MessageSquareQuote },
  { label: "Add FAQ", href: "/admin/faqs/add-faq", icon: CircleHelp },
];

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const firstName = ((user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "there").split(
    " "
  )[0];
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: totalHeroBanners },
    { count: activeHeroBanners },
    { count: totalProjects },
    { count: activeProjects },
    { data: donateSection },
    { count: totalTestimonials },
    { count: activeTestimonials },
    { count: totalFaqs },
    { count: activeFaqs },
    { count: totalSubmissions },
    { data: recentSubmissionDates },
    { data: latestSubmissions },
  ] = await Promise.all([
    supabase.from("hero_banners").select("*", { count: "exact", head: true }),
    supabase.from("hero_banners").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("donate_section").select("phone_number").eq("id", 1).single(),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("faqs").select("*", { count: "exact", head: true }),
    supabase.from("faqs").select("*", { count: "exact", head: true }).eq("is_active", true),
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
    {
      label: "Donate QR",
      value: donateSection?.phone_number ? "Live" : "Setup",
      sub: donateSection?.phone_number ? "QR ready" : "Add a phone number",
      icon: Heart,
      href: "/admin/donate",
    },
    {
      label: "Testimonials",
      value: totalTestimonials ?? 0,
      sub: `${activeTestimonials ?? 0} active`,
      icon: MessageSquareQuote,
      href: "/admin/testimonials",
    },
    {
      label: "FAQs",
      value: totalFaqs ?? 0,
      sub: `${activeFaqs ?? 0} active`,
      icon: CircleHelp,
      href: "/admin/faqs",
    },
    {
      label: "Contact submissions",
      value: totalSubmissions ?? 0,
      icon: Mail,
      href: "/admin/contact-submissions",
    },
  ];

  const contentSections = [
    { label: "Hero banners", total: totalHeroBanners ?? 0, active: activeHeroBanners ?? 0, href: "/admin/hero-banners" },
    { label: "Portfolio", total: totalProjects ?? 0, active: activeProjects ?? 0, href: "/admin/portfolio" },
    { label: "Testimonials", total: totalTestimonials ?? 0, active: activeTestimonials ?? 0, href: "/admin/testimonials" },
    { label: "FAQs", total: totalFaqs ?? 0, active: activeFaqs ?? 0, href: "/admin/faqs" },
  ];

  // Content that exists but is toggled off — easy to lose track of once a
  // section has more than a couple of rows.
  const attentionItems = contentSections
    .map((item) => ({ ...item, inactive: item.total - item.active }))
    .filter((item) => item.inactive > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
          <p className="text-muted-foreground">{today} — here&apos;s a snapshot of your workspace.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <action.icon className="size-4 text-primary" />
                {action.label}
                <Plus className="size-3.5 text-muted-foreground" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const color = CHART_COLORS[index % CHART_COLORS.length];
          return (
            <Link key={stat.label} href={stat.href}>
              <Card
                className="group relative overflow-hidden py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderTop: `3px solid ${color}` }}
              >
                <span
                  className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.16]"
                  style={{ backgroundColor: color }}
                />
                <CardContent className="space-y-3 px-5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)` }}
                    >
                      <stat.icon className="size-4.5" style={{ color }} />
                    </div>
                    <CardDescription className="font-medium">{stat.label}</CardDescription>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                    {stat.sub && <span className="text-sm text-muted-foreground">{stat.sub}</span>}
                  </div>
                </CardContent>
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
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in oklch, var(--chart-2) 15%, transparent)" }}
              >
                <Users className="size-4.5" style={{ color: "var(--chart-2)" }} />
              </div>
              <div>
                <CardTitle className="text-lg">Recent submissions</CardTitle>
                <CardDescription>The latest 5 messages.</CardDescription>
              </div>
            </div>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in oklch, var(--chart-5) 15%, transparent)" }}
              >
                <BarChart3 className="size-4.5" style={{ color: "var(--chart-5)" }} />
              </div>
              <div>
                <CardTitle className="text-lg">Content status</CardTitle>
                <CardDescription>Active vs hidden, across your manageable sections.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ContentStatusChart data={contentSections} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in oklch, var(--chart-4) 15%, transparent)" }}
              >
                <EyeOff className="size-4.5" style={{ color: "var(--chart-4)" }} />
              </div>
              <div>
                <CardTitle className="text-lg">Needs attention</CardTitle>
                <CardDescription>Content that&apos;s hidden from the homepage.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionItems.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CircleCheckBig className="size-4.5 text-green-600" />
                Everything is active. Nothing hidden right now.
              </div>
            ) : (
              attentionItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm transition-colors hover:bg-muted/60"
                >
                  <span>
                    <span className="font-medium">{item.inactive}</span> hidden in {item.label}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
