import { z } from "zod";

export const eventSchema = z.object({
  imageUrl: z.union([z.url("Enter a valid image URL"), z.literal("")]).optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  eventDate: z.string().min(1, "Date is required"),
  eventTime: z.string().optional(),
  location: z.string().optional(),
  linkUrl: z.union([z.url("Enter a valid URL"), z.literal("")]).optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type EventFormData = z.infer<typeof eventSchema>;
