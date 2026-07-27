import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ExternalLink, FolderKanban, Sparkles } from "lucide-react";

import Header from "@/components/shadn/header";
import Footer from "@/components/shadn/footer";
import { ShareProjectButton } from "@/components/shadn/ShareProjectButton";
import { SimilarProjectsSlider } from "@/components/shadn/SimilarProjectsSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient, getSiteSettings } from "@/lib/supabase/server";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "All Projects — Portfolio",
  description: "Every project we've shipped, in one place.",
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: project }, siteSettings] = await Promise.all([
    supabase.from("portfolio_projects").select("*").eq("id", id).eq("is_active", true).single(),
    getSiteSettings(),
  ]);

  if (!project) {
    notFound();
  }

  const { data: sameCategory } = await supabase
    .from("portfolio_projects")
    .select("id, title, category, image_url")
    .eq("is_active", true)
    .eq("category", project.category)
    .neq("id", id)
    .order("sort_order", { ascending: true })
    .limit(6);

  let similarProjects = sameCategory ?? [];
  if (similarProjects.length < 6) {
    const excludeIds = [id, ...similarProjects.map((p) => p.id)];
    const { data: others } = await supabase
      .from("portfolio_projects")
      .select("id, title, category, image_url")
      .eq("is_active", true)
      .not("id", "in", `(${excludeIds.join(",")})`)
      .order("sort_order", { ascending: true })
      .limit(6 - similarProjects.length);

    similarProjects = [...similarProjects, ...(others ?? [])];
  }

  const externalLink = project.project_link?.trim();
  const isExternalUrl = Boolean(externalLink && /^https?:\/\//i.test(externalLink));

  const completedLabel =
    project.project_year?.trim() ||
    (project.created_at
      ? new Date(project.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : null);
  const statusLabel = isExternalUrl ? "Live" : "In portfolio";

  return (
    <main className="overflow-x-clip">
      <Header showLoginButton={siteSettings?.show_login_button ?? true} />

      <article className="pt-36 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all projects
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {project.category}
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">{project.title}</h1>

              <div className="mt-12 overflow-hidden rounded-3xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image_url} alt={project.title} className="h-auto w-full object-cover" />
              </div>

              {project.description && (
                <div className="mt-12 whitespace-pre-line text-lg leading-8 text-muted-foreground">
                  {project.description}
                </div>
              )}
            </div>

            {/* Sidebar — project facts + a lead-gen CTA card, sticky on desktop */}
            <aside className="md:space-y-6 space-y-5 lg:sticky lg:top-32">
              <Card className="overflow-hidden rounded-3xl py-0">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <FolderKanban className="h-4 w-4" />
                    Project details
                  </div>

                  <div className="flex items-center justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{project.category}</span>
                  </div>

                  {project.client_name && (
                    <div className="flex items-center justify-between border-t pt-4 text-sm">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-medium">{project.client_name}</span>
                    </div>
                  )}

                  {project.role && (
                    <div className="flex items-center justify-between border-t pt-4 text-sm">
                      <span className="text-muted-foreground">Our role</span>
                      <span className="font-medium">{project.role}</span>
                    </div>
                  )}

                  {completedLabel && (
                    <div className="flex items-center justify-between border-t pt-4 text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span className="font-medium">{completedLabel}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span
                        className={`h-2 w-2 rounded-full ${isExternalUrl ? "bg-green-500" : "bg-muted-foreground/40"}`}
                      />
                      {statusLabel}
                    </span>
                  </div>

                  {isExternalUrl && (
                    <a
                      href={externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between border-t pt-4 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Visit live site
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  <ShareProjectButton />
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-3xl border-primary/20 bg-primary/5 py-0">
                <CardContent className="space-y-4 p-6">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-2 font-semibold">
                    <Image src="/logo.png" alt="" width={20} height={20} className="w-5" />
                    Like what you see?
                  </div>

                  <p className="text-sm text-muted-foreground">
                    We&apos;d love to build something just as good for you.
                  </p>

                  <Link href="/#contact">
                    <Button className="w-full rounded-full">
                      Start your project
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </div>

          <SimilarProjectsSlider projects={similarProjects ?? []} />
        </div>
      </article>

      <Footer settings={siteSettings} />
    </main>
  );
}
