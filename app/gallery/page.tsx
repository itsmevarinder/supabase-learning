import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Header from "@/components/shadn/header";
import Footer from "@/components/shadn/footer";
import GallerySection from "@/components/shadn/GallerySection";
import { getGalleryItems, getSiteSettings } from "@/lib/supabase/server";

export const metadata = {
  title: "Gallery — Grace Community Church",
  description: "Every photo and video from our church family, in one place.",
};

export default async function AllGalleryPage() {
  const [galleryItems, siteSettings] = await Promise.all([getGalleryItems(), getSiteSettings()]);

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
            Back to home
          </Link>
        </div>

        <GallerySection items={galleryItems} />
      </div>

      <Footer settings={siteSettings} />
    </main>
  );
}
