import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/dashboard/event-form";
import { PageHeader } from "@/components/dashboard/page-header";

export default function AddEventPage() {
  return (
    <div className="md:space-y-8 space-y-5">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Event</h1>
            <p className="text-muted-foreground">Shown in the homepage events schedule once active.</p>
          </div>
          <Link href="/admin/events">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Events
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add an event</CardTitle>
        </CardHeader>
        <CardContent>
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
