import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AboutSectionRow } from "@/components/shadn/AboutSection";
import type { FaqRow } from "@/components/shadn/Accordion";
import type { EventRow } from "@/components/shadn/EventsSection";
import type { GalleryItemRow } from "@/components/shadn/GallerySection";
import type { HeroBannerRow } from "@/components/shadn/HeroSection";
import type { PortfolioProjectRow } from "@/components/shadn/PortfolioSection";
import type { PricingPlanRow } from "@/components/shadn/PricingSection";
import type { SiteSettings } from "@/types/site-settings";
import type { TestimonialRow } from "@/components/shadn/TestimonialSection";
import type { VideoSectionRow } from "@/components/shadn/VideoSection";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies (e.g. during
            // render). Safe to ignore as long as proxy.ts refreshes the session.
          }
        },
      },
    }
  );
}

// Active hero_banners rows, in display order — used by the homepage's
// Hero carousel. Falls back to an empty array (HeroSection has its own
// hardcoded fallback slides) rather than throwing if the query fails.
export async function getHeroBanners(): Promise<HeroBannerRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_banners")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load hero_banners:", error.message);
    return [];
  }

  return data ?? [];
}

// Active portfolio_projects rows, in display order — used by the homepage's
// Portfolio grid. Falls back to an empty array (PortfolioSection has its own
// hardcoded fallback projects) rather than throwing if the query fails.
export async function getPortfolioProjects(): Promise<PortfolioProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load portfolio_projects:", error.message);
    return [];
  }

  return data ?? [];
}

// All pricing_plans rows, in display order — used by the homepage's Pricing
// section. Always exactly 3 (Starter/Pro/Enterprise), edited (not
// added/removed) via the admin panel. Falls back to an empty array
// (PricingSection has its own hardcoded fallback plans).
export async function getPricingPlans(): Promise<PricingPlanRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pricing_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load pricing_plans:", error.message);
    return [];
  }

  return data ?? [];
}

// The single site_settings row — contact info and social links shared by
// the Footer and Contact sections. Returns null (both components have their
// own hardcoded fallback values) rather than throwing if the query fails.
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load site_settings:", error.message);
    return null;
  }

  return data;
}

// Active testimonials rows, in display order — used by the homepage's
// Testimonials carousel. Falls back to an empty array (TestimonialSection
// shows an empty-state message) rather than throwing if the query fails.
export async function getTestimonials(): Promise<TestimonialRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load testimonials:", error.message);
    return [];
  }

  return data ?? [];
}

// Active FAQ rows, in display order — used by the homepage's FAQ accordion.
// Falls back to an empty array (FAQSection shows an empty-state message)
// rather than throwing if the query fails.
export async function getFaqs(): Promise<FaqRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load faqs:", error.message);
    return [];
  }

  return data ?? [];
}

// The single about_section row — image + copy for the homepage About
// section. Returns null (AboutSection has its own hardcoded fallback values)
// rather than throwing if the query fails.
export async function getAboutSection(): Promise<AboutSectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("about_section").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load about_section:", error.message);
    return null;
  }

  return data;
}

// The single video_section row — the YouTube link + copy for the homepage
// video showcase. Returns null (VideoSection renders nothing) rather than
// throwing if the query fails.
export async function getVideoSection(): Promise<VideoSectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("video_section").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load video_section:", error.message);
    return null;
  }

  return data;
}

// Active events, in date order — used by the homepage's events schedule.
// Falls back to an empty array (EventsSection shows an empty-state message)
// rather than throwing if the query fails.
export async function getEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Failed to load events:", error.message);
    return [];
  }

  return data ?? [];
}

// Active gallery items, in display order — used by the homepage's photo/video
// gallery. Falls back to an empty array (GallerySection shows an empty-state
// message) rather than throwing if the query fails.
export async function getGalleryItems(): Promise<GalleryItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load gallery_items:", error.message);
    return [];
  }

  return data ?? [];
}
