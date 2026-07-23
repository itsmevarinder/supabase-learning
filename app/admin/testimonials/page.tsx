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
import { DeleteTestimonialButton } from "@/components/dashboard/delete-testimonial-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("id, name, role, rating, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <PageHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">Testimonials</h1>
            <p className="text-muted-foreground">
              Reviews shown in the homepage testimonials carousel. Inactive ones are kept but hidden.
            </p>
          </div>
          <Link href="/admin/testimonials/add-testimonial">
            <Button className="rounded-full px-6 py-5">
              Add <Plus />
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load testimonials: {error.message}</p>
          ) : !testimonials?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No testimonials yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell className="font-medium">{testimonial.name}</TableCell>
                    <TableCell className="text-muted-foreground">{testimonial.role}</TableCell>
                    <TableCell>{testimonial.rating} / 5</TableCell>
                    <TableCell>{testimonial.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={testimonial.is_active ? "default" : "secondary"}>
                        {testimonial.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/testimonials/${testimonial.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteTestimonialButton id={testimonial.id} name={testimonial.name} />
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
