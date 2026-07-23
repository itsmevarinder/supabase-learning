import { z } from "zod";

export const aboutSectionSchema = z.object({
  imageUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
  imageUrl2: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
  eyebrowText: z.string().min(1, "Eyebrow text is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  yearsExperience: z.number().int().min(0),
  buttonText: z.string().min(1, "Button text is required"),
  features: z.string().min(1, "Add at least one feature"),
});

export type AboutSectionFormData = z.infer<typeof aboutSectionSchema>;
