import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.email("Please enter a valid email"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
