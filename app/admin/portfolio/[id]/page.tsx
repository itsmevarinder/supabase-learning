import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioProjectForm } from "@/components/dashboard/portfolio-project-form";
import { createClient } from "@/lib/supabase/server";

interface EditPortfolioProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPortfolioProjectPage({ params }: EditPortfolioProjectPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("portfolio_projects").select("*").eq("id", id).single();

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-3 items-center">
        <div>
          <h1 className="mt-2 text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">{project.title}</p>
        </div>
        <Link href="/admin/portfolio">
          <Button variant="ghost" className="-ml-4">
            <ArrowLeft />
            Back to Portfolio
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioProjectForm project={project} />
        </CardContent>
      </Card>
    </div>
  );
}
