import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AboutSectionForm } from "@/components/dashboard/about-section-form";
import { getAboutSection } from "@/lib/supabase/server";

export default async function AdminAboutPage() {
  const about = await getAboutSection();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">About Section</h1>
        <p className="text-muted-foreground">
          The image and copy shown in the homepage About section, left image / right text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AboutSectionForm about={about} />
        </CardContent>
      </Card>
    </div>
  );
}
