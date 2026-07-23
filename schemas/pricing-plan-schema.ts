import { z } from "zod";

export const pricingPlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.string().min(1, "Price is required"),
  description: z.string().optional(),
  // One feature per line in the form — split/joined at the edges, stored as
  // a plain string[] in the DB.
  features: z.string().optional(),
  isFeatured: z.boolean(),
  buttonText: z.string().optional(),
});

export type PricingPlanFormData = z.infer<typeof pricingPlanSchema>;
