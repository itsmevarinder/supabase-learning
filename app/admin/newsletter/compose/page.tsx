import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NewsletterComposeForm } from "@/components/dashboard/newsletter-compose-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewsletterComposePage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("id, email")
    .eq("is_active", true)
    .order("email", { ascending: true });

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Compose</h1>
            <p className="text-muted-foreground">Send an update to every active newsletter subscriber.</p>
          </div>
          <Link
            href="/admin/newsletter"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <Button variant="ghost" className="-ml-4"><ArrowLeft /> Back to subscribers</Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <NewsletterComposeForm subscribers={subscribers ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
