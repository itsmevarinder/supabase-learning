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
import { DeleteAudioTrackButton } from "@/components/dashboard/delete-audio-track-button";
import { SectionBackgroundForm } from "@/components/dashboard/section-background-form";
import { createClient, getAudioSection } from "@/lib/supabase/server";

export default async function AdminAudioPage() {
  const supabase = await createClient();
  const [{ data: tracks, error }, audioSection] = await Promise.all([
    supabase
      .from("audio_tracks")
      .select("id, title, description, is_active, sort_order")
      .order("sort_order", { ascending: true }),
    getAudioSection(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audio</h1>
          <p className="text-muted-foreground">
            MP3 tracks shown in the homepage audio player. Inactive ones are kept but hidden.
          </p>
        </div>
        <Link href="/admin/audio/add-track">
          <Button className="rounded-full px-6 py-5">
            Add <Plus />
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <SectionBackgroundForm
            title="Section background"
            description="The background photo behind the homepage audio player."
            table="audio_section"
            bucket="audio-section"
            imageUrl={audioSection?.background_image_url ?? null}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <p className="p-6 text-sm text-destructive">Couldn&apos;t load audio tracks: {error.message}</p>
          ) : !tracks?.length ? (
            <p className="p-6 text-sm text-muted-foreground">No audio tracks yet — add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {track.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{track.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={track.is_active ? "default" : "secondary"}>
                        {track.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 text-right">
                      <Link href={`/admin/audio/${track.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil />
                          Edit
                        </Button>
                      </Link>
                      <DeleteAudioTrackButton id={track.id} title={track.title} />
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
