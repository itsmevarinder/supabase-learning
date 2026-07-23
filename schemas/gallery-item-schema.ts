import { z } from "zod";

export const galleryItemSchema = z
  .object({
    mediaType: z.enum(["image", "video"]),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    title: z.string().optional(),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.mediaType === "image" && !data.imageUrl) {
      ctx.addIssue({ code: "custom", path: ["imageUrl"], message: "Upload an image" });
    }
    if (data.mediaType === "video" && !data.videoUrl) {
      ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "Add a YouTube link or upload a video file" });
    }
  });

export type GalleryItemFormData = z.infer<typeof galleryItemSchema>;
