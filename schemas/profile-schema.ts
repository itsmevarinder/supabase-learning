import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  avatarUrl: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
