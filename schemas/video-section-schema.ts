import { z } from "zod";

export const videoSectionSchema = z.object({
  videoUrl: z
    .string()
    .min(1, "Video URL is required")
    .refine((value) => /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}/.test(value), {
      message: "Enter a valid YouTube video link",
    }),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isActive: z.boolean(),
});

export type VideoSectionFormData = z.infer<typeof videoSectionSchema>;
