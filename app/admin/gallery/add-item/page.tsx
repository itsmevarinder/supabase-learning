import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GalleryItemForm } from "@/components/dashboard/gallery-item-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AddGalleryItemPage() {
  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Gallery Item</h1>
            <p className="text-muted-foreground">Shown in the homepage gallery once active.</p>
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
          <CardTitle className="text-lg">Add a photo or video</CardTitle>
        </CardHeader>
        <CardContent>
          <GalleryItemForm />
        </CardContent>
      </Card>
    </div>
  );
}
