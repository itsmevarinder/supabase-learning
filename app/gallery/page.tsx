import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/shadn/header";
import Footer from "@/components/shadn/footer";
import GallerySection from "@/components/shadn/GallerySection";
import { getGalleryItems, getSiteSettings } from "@/lib/supabase/server";

export const metadata = {
  title: "All Gallery",
  description: "Every photo and video in our gallery, in one place.",
};

export default async function AllGalleryPage() {
  const [galleryItems, siteSettings, tCommon] = await Promise.all([
    getGalleryItems(),
    getSiteSettings(),
    getTranslations("Common"),
  ]);

  return (
    <main className="overflow-x-clip">
      <Header showLoginButton={siteSettings?.show_login_button ?? true} />

      <div className="pt-28">
        <div className="container mx-auto px-4 md:px-6">
          <Link
            href="/#gallery"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon("backToHome")}
          </Link>
        </div>

        <GallerySection items={galleryItems} />
      </div>

      <Footer settings={siteSettings} />
    </main>
  );
}
