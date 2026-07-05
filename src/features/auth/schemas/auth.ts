import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export const signUpSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  fullName: z.string().trim().min(1, "Enter your name."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});
