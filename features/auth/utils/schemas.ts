import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
