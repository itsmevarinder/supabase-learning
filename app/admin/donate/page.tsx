import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonateSectionForm } from "@/components/dashboard/donate-section-form";
import { getDonateSection } from "@/lib/supabase/server";

export default async function AdminDonatePage() {
  const donate = await getDonateSection();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Donate Section</h1>
        <p className="text-muted-foreground">
          The background, copy, and UPI phone number used to generate the QR code shown when a visitor clicks Donate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DonateSectionForm donate={donate} />
        </CardContent>
      </Card>
    </div>
  );
}
