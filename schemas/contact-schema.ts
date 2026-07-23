import { z } from "zod";

export const contactSchema = z.object({
  fullName: z.string().min(3, "Full name is required"),
  email: z.email("Please enter a valid email"),
  company: z.string().optional(),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().min(10, "Please enter at least 10 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;