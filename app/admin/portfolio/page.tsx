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
import { DeletePortfolioProjectButton } from "@/components/dashboard/delete-portfolio-project-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from("portfolio_projects")
    .select("id, title, category, is_active, sort_order, created_at")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <PageHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">
              Projects shown in the homepage portfolio grid. Inactive projects are kept but hidden.
            </p>
          </div>
          <Link href="/admin/portfolio/add-project">
            <Button className="rounded-full px-6 py-5">
              Add <Plus />
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load projects: {error.message}</p>
          ) : !projects?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No projects yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell className="text-muted-foreground">{project.category}</TableCell>
                    <TableCell>{project.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={project.is_active ? "default" : "secondary"}>
                        {project.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/portfolio/${project.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeletePortfolioProjectButton id={project.id} title={project.title} />
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
