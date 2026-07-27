import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminNewsletterHistoryPage() {
  const supabase = await createClient();
  const { data: sends, error } = await supabase
    .from("newsletter_sends")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Send history</h1>
            <p className="text-muted-foreground">Every newsletter you&apos;ve sent, most recent first.</p>
          </div>
          <Link
            href="/admin/newsletter"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to newsletter
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load send history: {error.message}</p>
          ) : !sends?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No newsletters sent yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sends.map((send) => (
                  <TableRow key={send.id}>
                    <TableCell className="font-medium">{send.subject}</TableCell>
                    <TableCell>
                      <span className="mr-2">
                        {send.sent_count}/{send.total_count}
                      </span>
                      {send.failed_count > 0 && (
                        <Badge variant="secondary">{send.failed_count} failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(send.created_at).toLocaleString()}
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
