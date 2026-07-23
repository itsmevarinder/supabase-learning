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
import { createClient } from "@/lib/supabase/server";

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data: plans, error } = await supabase
    .from("pricing_plans")
    .select("id, title, price, is_featured, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">
          The 3 plans shown in the homepage pricing section.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load plans: {error.message}</p>
          ) : !plans?.length ? (
            <p className="p-6 text-sm text-muted-foreground">
              No plans found — run the pricing_plans setup SQL first.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.title}</TableCell>
                    <TableCell>{plan.price}</TableCell>
                    <TableCell>
                      {plan.is_featured && <Badge>Featured</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/pricing/${plan.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
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
