import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, ArrowLeft } from "lucide-react";

import Header from "@/components/shadn/header";
import Footer from "@/components/shadn/footer";
import { Button } from "@/components/ui/button";
import { getPortfolioProjects, getSiteSettings } from "@/lib/supabase/server";

export const metadata = {
  title: "All Projects — Portfolio",
  description: "Every project we've shipped, in one place.",
};

export default async function AllProjectsPage() {
  const [projects, siteSettings, t, tCommon] = await Promise.all([
    getPortfolioProjects(),
    getSiteSettings(),
    getTranslations("Portfolio"),
    getTranslations("Common"),
  ]);

  return (
    <main className="overflow-x-clip">
      <Header showLoginButton={siteSettings?.show_login_button ?? true} />

      <section className="pt-36 pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon("backToHome")}
          </Link>

          <div className="mx-auto mt-10 max-w-2xl border-b pb-16 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              {t("eyebrow")}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-tight lg:text-5xl">{t("allProjects")}</h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              {t("allProjectsDescription")}
            </p>
          </div>

          {projects.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.id}`}
                  className="group overflow-hidden rounded-3xl border bg-background shadow-sm transition-shadow duration-300 hover:shadow-2xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                      <Button className="rounded-full">{t("viewProject")}</Button>
                    </div>
                  </div>

                  <div className="p-6">
                    <span className="text-sm font-medium text-primary">{project.category}</span>
                    <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      {t("learnMore")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer settings={siteSettings} />
    </main>
  );
}
