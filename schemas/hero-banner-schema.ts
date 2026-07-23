import { z } from "zod";

export const heroBannerSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  imageUrl: z.url("Enter a valid image URL"),
  imageAlt: z.string().optional(),
  badgeEmoji: z.string().optional(),
  badgeText: z.string().min(1, "Badge text is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  primaryButtonText: z.string().optional(),
  primaryButtonLink: z.string().optional(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type HeroBannerFormData = z.infer<typeof heroBannerSchema>;
