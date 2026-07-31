import { z } from "zod";

function socialUrlSchema(domains: string[], label: string) {
  return z.string().optional().refine((value) => {
    if (!value) return true;
    try {
      const hostname = new URL(value).hostname.replace(/^www\./, "");
      return domains.some((domain) => hostname === domain);
    } catch {
      return false;
    }
  }, `Enter a valid ${label} URL`);
}

export const siteSettingsSchema = z.object({
  contactPhone: z.string().optional(),
  contactEmail: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  officeAddress: z.string().optional(),
  workingHours: z.string().optional(),
  facebookUrl: socialUrlSchema(["facebook.com", "fb.com"], "Facebook"),
  instagramUrl: socialUrlSchema(["instagram.com"], "Instagram"),
  twitterUrl: socialUrlSchema(["twitter.com", "x.com"], "X / Twitter"),
  linkedinUrl: socialUrlSchema(["linkedin.com"], "LinkedIn"),
  showLoginButton: z.boolean(),
  contactBackgroundImageUrl: z.string().optional(),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;
