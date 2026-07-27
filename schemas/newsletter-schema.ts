import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;
