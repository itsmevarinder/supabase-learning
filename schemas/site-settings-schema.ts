import { z } from "zod";

export const siteSettingsSchema = z.object({
  contactPhone: z.string().optional(),
  contactEmail: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  officeAddress: z.string().optional(),
  workingHours: z.string().optional(),
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  showLoginButton: z.boolean(),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
