import Link from "next/link";
import { Image as ImageIcon, Pencil, Plus, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteGalleryItemButton } from "@/components/dashboard/delete-gallery-item-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("gallery_items")
    .select("id, media_type, title, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <PageHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-muted-foreground">
              Photos and videos shown in the homepage gallery. Inactive ones are kept but hidden.
            </p>
          </div>
          <Link href="/admin/gallery/add-item">
            <Button className="rounded-full px-6 py-5">
              Add <Plus />
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load gallery items: {error.message}</p>
          ) : !items?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No gallery items yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Caption</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((galleryItem) => (
                  <TableRow key={galleryItem.id}>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {galleryItem.media_type === "video" ? (
                          <Video className="size-4" />
                        ) : (
                          <ImageIcon className="size-4" />
                        )}
                        {galleryItem.media_type === "video" ? "Video" : "Image"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{galleryItem.title ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{galleryItem.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={galleryItem.is_active ? "default" : "secondary"}>
                        {galleryItem.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/gallery/${galleryItem.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteGalleryItemButton
                        id={galleryItem.id}
                        label={galleryItem.title ?? galleryItem.media_type}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
