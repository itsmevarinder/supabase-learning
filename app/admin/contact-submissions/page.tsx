import { Mail, Phone, Building2, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminContactSubmissionsPage() {
  const supabase = await createClient();
  const { data: submissions, error } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Submissions</h1>
        <p className="text-muted-foreground">
          Everyone who&apos;s filled out the &ldquo;Start Your Next Project&rdquo; form.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Couldn&apos;t load submissions: {error.message}</p>
      ) : !submissions?.length ? (
        <p className="text-sm text-muted-foreground">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardContent className="space-y-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{submission.full_name}</h3>
                    {submission.company && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {submission.company}
                      </p>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <a
                    href={`mailto:${submission.email}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {submission.email}
                  </a>
                  <a
                    href={`tel:${submission.phone}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {submission.phone}
                  </a>
                </div>

                <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                  {submission.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
