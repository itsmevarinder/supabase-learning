import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryItemForm } from "@/components/dashboard/gallery-item-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

interface EditGalleryItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryItemPage({ params }: EditGalleryItemPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: item } = await supabase.from("gallery_items").select("*").eq("id", id).single();

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Gallery Item</h1>
            <p className="text-muted-foreground">{item.title ?? item.media_type}</p>
          </div>
          <Link href="/admin/gallery">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryItemForm item={item} />
        </CardContent>
      </Card>
    </div>
  );
}
