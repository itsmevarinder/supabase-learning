"use server";

import { createClient } from "@/lib/supabase/server";
import { translateFields, type TranslatableFields } from "@/lib/translate";

const TARGET_LOCALES = ["hi", "pa"];

async function translateAndStore(table: string, id: string | number, fields: TranslatableFields) {
  try {
    const translations = await translateFields(fields, TARGET_LOCALES);
    if (Object.keys(translations).length === 0) return;

    const supabase = await createClient();
    const { error } = await supabase.from(table).update({ translations }).eq("id", id);
    if (error) console.error(`translateAndStore: failed to save translations for ${table}#${id}`, error.message);
  } catch (error) {
    console.error(`translateAndStore: unexpected failure for ${table}#${id}`, error);
  }
}

export async function translateHeroBanner(id: string, fields: TranslatableFields) {
  await translateAndStore("hero_banners", id, fields);
}

export async function translateAboutSection(fields: TranslatableFields) {
  await translateAndStore("about_section", 1, fields);
}

export async function translatePortfolioProject(id: string, fields: TranslatableFields) {
  await translateAndStore("portfolio_projects", id, fields);
}

export async function translateTestimonial(id: string, fields: TranslatableFields) {
  await translateAndStore("testimonials", id, fields);
}

export async function translateFaq(id: string, fields: TranslatableFields) {
  await translateAndStore("faqs", id, fields);
}

export async function translateEvent(id: string, fields: TranslatableFields) {
  await translateAndStore("events", id, fields);
}

export async function translateGalleryItem(id: string, fields: TranslatableFields) {
  await translateAndStore("gallery_items", id, fields);
}

export async function translateAudioTrack(id: string, fields: TranslatableFields) {
  await translateAndStore("audio_tracks", id, fields);
}

export async function translateDonateSection(fields: TranslatableFields) {
  await translateAndStore("donate_section", 1, fields);
}

export async function translateVideoSection(fields: TranslatableFields) {
  await translateAndStore("video_section", 1, fields);
}
