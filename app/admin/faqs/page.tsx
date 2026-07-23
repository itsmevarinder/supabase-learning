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
import { DeleteFaqButton } from "@/components/dashboard/delete-faq-button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminFaqsPage() {
  const supabase = await createClient();
  const { data: faqs, error } = await supabase
    .from("faqs")
    .select("id, question, answer, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">FAQs</h1>
          <p className="text-muted-foreground">
            Questions shown in the homepage FAQ accordion. Inactive ones are kept but hidden.
          </p>
        </div>
        <Link href="/admin/faqs/add-faq">
          <Button className="rounded-full px-6 py-5">
            Add <Plus />
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load FAQs: {error.message}</p>
          ) : !faqs?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No FAQs yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqs.map((faq) => (
                  <TableRow key={faq.id}>
                    <TableCell className="font-medium">{faq.question}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{faq.answer}</TableCell>
                    <TableCell>{faq.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={faq.is_active ? "default" : "secondary"}>
                        {faq.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/faqs/${faq.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteFaqButton id={faq.id} question={faq.question} />
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
