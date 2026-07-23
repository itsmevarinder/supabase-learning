import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioTrackForm } from "@/components/dashboard/audio-track-form";

export default function AddAudioTrackPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Audio Track</h1>
          <p className="text-muted-foreground">Shown in the homepage audio player once active.</p>
        </div>
        <Link href="/admin/audio">
          <Button variant="ghost" className="-ml-4">
            <ArrowLeft />
            Back to Audio
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a track</CardTitle>
        </CardHeader>
        <CardContent>
          <AudioTrackForm />
        </CardContent>
      </Card>
    </div>
  );
}
