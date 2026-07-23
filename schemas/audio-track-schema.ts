import { z } from "zod";

export const audioTrackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  audioUrl: z.string().min(1, "Upload an audio file"),
  coverImageUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type AudioTrackFormData = z.infer<typeof audioTrackSchema>;
