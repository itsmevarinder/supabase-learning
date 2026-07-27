import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioTrackForm } from "@/components/dashboard/audio-track-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { createClient } from "@/lib/supabase/server";

interface EditAudioTrackPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAudioTrackPage({ params }: EditAudioTrackPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: track } = await supabase.from("audio_tracks").select("*").eq("id", id).single();

  if (!track) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader>
        <div className="flex items-center flex-wrap gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Audio Track</h1>
            <p className="text-muted-foreground">{track.title}</p>
          </div>
          <Link href="/admin/audio">
            <Button variant="ghost" className="-ml-4">
              <ArrowLeft />
              Back to Audio
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioTrackForm track={track} />
        </CardContent>
      </Card>
    </div>
  );
}
