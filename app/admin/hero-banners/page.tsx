import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

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
import { DeleteHeroBannerButton } from "@/components/dashboard/delete-hero-banner-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminHeroBannersPage() {
  const supabase = await createClient();
  const { data: banners, error } = await supabase
    .from("hero_banners")
    .select("id, slug, title, badge_text, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true });

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hero Banners</h1>
            <p className="text-muted-foreground">
              Slides shown in the homepage hero carousel. Inactive banners are kept but hidden.
            </p>
          </div>
          <Link href={`/admin/hero-banners/add-banners`}>
            <Button className="rounded-full px-6 py-5">Add <Plus /></Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load banners: {error.message}</p>
          ) : !banners?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No banners yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="text-muted-foreground">{banner.slug}</TableCell>
                    <TableCell>{banner.badge_text}</TableCell>
                    <TableCell>{banner.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/hero-banners/${banner.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteHeroBannerButton id={banner.id} title={banner.title} />
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
