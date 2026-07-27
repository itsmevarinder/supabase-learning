import Link from "next/link";
import { Pencil } from "lucide-react";

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
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDonatePage() {
  const supabase = await createClient();
  const { data: donations, error } = await supabase
    .from("donations")
    .select("id, amount, currency, status, donor_name, donor_email, donor_contact, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Donate Section</h1>
            <p className="text-muted-foreground">
              The background, copy, and button shown in the homepage Donate section.
            </p>
          </div>
          <Link href="/admin/donate/edit">
            <Button className="rounded-full px-6 py-5">
              <Pencil />
              Edit
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load donations: {error.message}</p>
          ) : !donations?.length ? (
            <p className="p-6 text-sm text-muted-foreground">
              No donations yet — they&apos;ll show up here once someone pays via Razorpay.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">
                      {donation.donor_name || donation.donor_email || donation.donor_contact || "Anonymous"}
                    </TableCell>
                    <TableCell>
                      {donation.currency} {donation.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={donation.status === "captured" ? "default" : "secondary"}>
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(donation.created_at).toLocaleString()}
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
