/**
 * Registration DTO
 *
 * Validates new campus user registration.
 */

import { z } from "zod";

// ======================================================
// 1. REGISTRATION SCHEMA
// ======================================================

export const registerDtoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must contain at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .refine((value) => /\p{L}/u.test(value), "Enter a valid full name."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters.")
    .max(128, "Password cannot exceed 128 characters.")
    .refine(
      (value) => /[a-z]/.test(value),
      "Password must contain a lowercase letter.",
    )
    .refine(
      (value) => /[A-Z]/.test(value),
      "Password must contain an uppercase letter.",
    )
    .refine((value) => /\d/.test(value), "Password must contain a number."),

  studentId: z.string().trim().min(2).max(50).optional(),

  department: z.string().trim().min(2).max(100).optional(),

  phone: z.string().trim().min(7).max(30).optional(),

  // Public registration must not accept a role.
  // Role is assigned by the server.
});

// ======================================================
// 2. DTO TYPE
// ======================================================

export type RegisterDto = z.infer<typeof registerDtoSchema>;

// ======================================================
// 3. VALIDATION HELPER
// ======================================================

export function validateRegisterDto(data: unknown) {
  return registerDtoSchema.safeParse(data);
}

// ======================================================
// 4. NORMALIZE REGISTRATION DATA
// ======================================================

export function normalizeRegisterDto(data: RegisterDto): RegisterDto {
  return {
    ...data,

    fullName: data.fullName.trim(),

    email: data.email.trim().toLowerCase(),

    ...(data.studentId ? { studentId: data.studentId.trim() } : {}),

    ...(data.department ? { department: data.department.trim() } : {}),

    ...(data.phone ? { phone: data.phone.trim() } : {}),
  };
}

// ======================================================
// 5. DEFAULT EXPORT
// ======================================================

export default registerDtoSchema;
