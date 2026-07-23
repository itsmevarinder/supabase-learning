import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingPlanForm } from "@/components/dashboard/pricing-plan-form";
import { createClient } from "@/lib/supabase/server";

interface EditPricingPlanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPricingPlanPage({ params }: EditPricingPlanPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plan } = await supabase.from("pricing_plans").select("*").eq("id", id).single();

  if (!plan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4 items-center">
        <div>
          <h1 className="mt-2 text-2xl font-bold">Edit Plan</h1>
          <p className="text-muted-foreground">{plan.title}</p>
        </div>
        <Link href="/admin/pricing">
          <Button variant="ghost" className="-ml-4">
            <ArrowLeft />
            Back to Pricing
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PricingPlanForm plan={plan} />
        </CardContent>
      </Card>
    </div>
  );
}
