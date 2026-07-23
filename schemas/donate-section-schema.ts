import { z } from "zod";

export const donateSectionSchema = z.object({
  backgroundImageUrl: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
  description: z.string().optional(),
  buttonText: z.string().min(1, "Button text is required"),
  phoneNumber: z.string().optional(),
});

export type DonateSectionFormData = z.infer<typeof donateSectionSchema>;
