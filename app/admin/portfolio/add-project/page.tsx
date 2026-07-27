import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PortfolioProjectForm } from "@/components/dashboard/portfolio-project-form";

export default function AddPortfolioProjectPage() {
  return (
    <div className="md:space-y-6 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Project</h1>
            <p className="text-muted-foreground">
              Shown in the homepage portfolio grid once active.
            </p>
          </div>
          <Link href="/admin/portfolio">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Portfolio
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a project</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioProjectForm />
        </CardContent>
      </Card>
    </div>
  );
}
