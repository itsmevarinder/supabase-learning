import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonateSectionForm } from "@/components/dashboard/donate-section-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { getDonateSection } from "@/lib/supabase/server";

export default async function EditDonateSectionPage() {
  const donate = await getDonateSection();

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Donate Section</h1>
            <p className="text-muted-foreground">
              The background, copy, and button shown in the homepage Donate section.
            </p>
          </div>
          <Link href="/admin/donate">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Donate
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DonateSectionForm donate={donate} />
        </CardContent>
      </Card>
    </div>
  );
}
