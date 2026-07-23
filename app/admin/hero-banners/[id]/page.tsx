import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroBannerForm } from "@/components/dashboard/hero-banner-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

interface EditHeroBannerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHeroBannerPage({ params }: EditHeroBannerPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: banner } = await supabase.from("hero_banners").select("*").eq("id", id).single();

  if (!banner) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-bold">Edit Hero Banner</h1>
            <p className="text-muted-foreground">{banner.title}</p>
          </div>
          <Link href="/admin/hero-banners">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Hero Banners
            </Button>
          </Link>

        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroBannerForm banner={banner} />
        </CardContent>
      </Card>
    </div>
  );
}
