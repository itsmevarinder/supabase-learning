import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqForm } from "@/components/dashboard/faq-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

interface EditFaqPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: faq } = await supabase.from("faqs").select("*").eq("id", id).single();

  if (!faq) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Edit FAQ</h1>
            <p className="text-muted-foreground">{faq.question}</p>
          </div>
          <Link href="/admin/faqs">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to FAQs
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqForm faq={faq} />
        </CardContent>
      </Card>
    </div>
  );
}
