import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),

  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must contain at least 3 characters.")
      .max(100, "Full name is too long."),

    email: z.string().trim().email("Enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password is too long."),

    confirmPassword: z.string().min(1, "Please confirm your password."),

    studentId: z.string().trim().optional(),

    department: z.string().trim().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),

    password: z.string().min(8, "Password must contain at least 8 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must contain at least 8 characters."),

    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
