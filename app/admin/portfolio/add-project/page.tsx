import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioProjectForm } from "@/components/dashboard/portfolio-project-form";

export default function AddPortfolioProjectPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
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
