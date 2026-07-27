import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { TestimonialForm } from "@/components/dashboard/testimonial-form";

export default function AddTestimonialPage() {
  return (
    <div className="md:space-y-8 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Testimonial</h1>
            <p className="text-muted-foreground">Shown in the homepage testimonials carousel once active.</p>
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
          <CardTitle className="text-lg">Add a testimonial</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialForm />
        </CardContent>
      </Card>
    </div>
  );
}
