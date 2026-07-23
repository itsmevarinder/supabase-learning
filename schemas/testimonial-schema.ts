import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  imageUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
  review: z.string().min(1, "Review is required"),
  rating: z.number().int().min(1).max(5),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type TestimonialFormData = z.infer<typeof testimonialSchema>;
