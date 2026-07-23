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
import { DeleteEventButton } from "@/components/dashboard/delete-event-button";
import { PageHeader } from "@/components/dashboard/page-header";
import { SectionBackgroundForm } from "@/components/dashboard/section-background-form";
import { createClient, getEventsSection } from "@/lib/supabase/server";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const [{ data: events, error }, eventsSection] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date, event_time, location, is_active, sort_order")
      .order("event_date", { ascending: true }),
    getEventsSection(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader>
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Shown in the homepage events schedule. Inactive ones are kept but hidden.
            </p>
          </div>
          <Link href="/admin/events/add-event">
            <Button className="rounded-full px-6 py-5">
              Add <Plus />
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardContent>
          <SectionBackgroundForm
            title="Section background"
            description="The background photo behind the homepage events schedule."
            table="events_section"
            bucket="events-section"
            imageUrl={eventsSection?.background_image_url ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load events: {error.message}</p>
          ) : !events?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No events yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {event.event_time ? ` · ${event.event_time}` : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.location ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={event.is_active ? "default" : "secondary"}>
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteEventButton id={event.id} title={event.title} />
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
