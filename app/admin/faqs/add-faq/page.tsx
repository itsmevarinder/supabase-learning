import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqForm } from "@/components/dashboard/faq-form";

export default function AddFaqPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add FAQ</h1>
          <p className="text-muted-foreground">Shown in the homepage FAQ accordion once active.</p>
        </div>
        <Link href="/admin/faqs">
          <Button variant="ghost" className="-ml-4">
            <ArrowLeft />
            Back to FAQs
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a FAQ</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqForm />
        </CardContent>
      </Card>
    </div>
  );
}
