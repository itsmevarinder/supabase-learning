import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { VideoSectionForm } from "@/components/dashboard/video-section-form";
import { getVideoSection } from "@/lib/supabase/server";

export default async function AdminVideoPage() {
  const video = await getVideoSection();

  return (
    <div className="space-y-8">
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold">Video Section</h1>
          <p className="text-muted-foreground">
            The YouTube video and copy shown in the homepage &ldquo;Watch Our Story&rdquo; section.
          </p>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoSectionForm video={video} />
        </CardContent>
      </Card>
    </div>
  );
}
