import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AboutSectionRow } from "@/components/shadn/AboutSection";
import type { AudioTrackRow } from "@/components/shadn/AudioSection";
import type { FaqRow } from "@/components/shadn/Accordion";
import type { DonateSectionRow } from "@/components/shadn/DonateSection";
import type { EventRow } from "@/components/shadn/EventsSection";
import type { GalleryItemRow } from "@/components/shadn/GallerySection";
import type { HeroBannerRow } from "@/components/shadn/HeroSection";
import type { PortfolioProjectRow } from "@/components/shadn/PortfolioSection";
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
            
          }
        },
      },
    }
  );
}

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

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load site_settings:", error.message);
    return null;
  }

  return data;
}

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

export async function getAboutSection(): Promise<AboutSectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("about_section").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load about_section:", error.message);
    return null;
  }

  return data;
}

export async function getVideoSection(): Promise<VideoSectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("video_section").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load video_section:", error.message);
    return null;
  }

  return data;
}

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

export async function getAudioTracks(): Promise<AudioTrackRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audio_tracks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load audio_tracks:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDonateSection(): Promise<DonateSectionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("donate_section").select("*").eq("id", 1).single();

  if (error) {
    console.error("Failed to load donate_section:", error.message);
    return null;
  }

  return data;
}

export async function getEventsSection(): Promise<{ background_image_url: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events_section")
    .select("background_image_url")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to load events_section:", error.message);
    return null;
  }

  return data;
}

export async function getAudioSection(): Promise<{ background_image_url: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audio_section")
    .select("background_image_url")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Failed to load audio_section:", error.message);
    return null;
  }

  return data;
}
