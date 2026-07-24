import { z } from "zod";

export const portfolioProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.url("Enter a valid image URL"),
  projectLink: z.string().optional(),
  description: z.string().optional(),
  clientName: z.string().optional(),
  projectYear: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().int(),
});

export type PortfolioProjectFormData = z.infer<typeof portfolioProjectSchema>;
