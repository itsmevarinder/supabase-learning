import Link from "next/link";
import { Mail, Clock, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionBackgroundForm } from "@/components/dashboard/section-background-form";
import { createClient, getNewsletterSection } from "@/lib/supabase/server";

export default async function AdminNewsletterPage() {
  const supabase = await createClient();
  const [{ data: subscribers, error }, newsletterSection] = await Promise.all([
    supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
    getNewsletterSection(),
  ]);

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Newsletter</h1>
            <p className="text-muted-foreground">
              Everyone who&apos;s subscribed from the &ldquo;Stay In Touch&rdquo; section.
            </p>
          </div>
          <Link href="/admin/newsletter/compose">
            <Button className="rounded-full px-6 py-5">
              Compose <Send />
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <SectionBackgroundForm
            title="Section background"
            description="The background photo behind the homepage newsletter signup."
            table="newsletter_section"
            bucket="newsletter-section"
            imageUrl={newsletterSection?.background_image_url ?? null}
          />
        </CardContent>
      </Card>

      {error ? (
        <p className="text-sm text-destructive">Couldn&apos;t load subscribers: {error.message}</p>
      ) : !subscribers?.length ? (
        <p className="text-sm text-muted-foreground">No subscribers yet.</p>
      ) : (
        <Card>
          <CardContent className="divide-y py-0">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              >
                <a
                  href={`mailto:${subscriber.email}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {subscriber.email}
                </a>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(subscriber.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
