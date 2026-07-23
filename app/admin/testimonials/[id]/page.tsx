import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";
import { createClient } from "@/lib/supabase/server";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({ params }: EditTestimonialPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: testimonial } = await supabase.from("testimonials").select("*").eq("id", id).single();

  if (!testimonial) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Edit Testimonial</h1>
            <p className="text-muted-foreground">{testimonial.name}</p>
          </div>
          <Link href="/admin/testimonials">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Testimonials
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialForm testimonial={testimonial} />
        </CardContent>
      </Card>
    </div>
  );
}
