
/**
 * Login DTO
 *
 * Validates user sign-in information.
 */

import { z } from 'zod';

// ======================================================
// 1. LOGIN SCHEMA
// ======================================================

export const loginDtoSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(254),

  password: z
    .string()
    .min(1, 'Password is required.')
    .max(128),

  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

// ======================================================
// 2. LOGIN DTO TYPE
// ======================================================

export type LoginDto = z.infer<
  typeof loginDtoSchema
>;

// ======================================================
// 3. VALIDATE LOGIN
// ======================================================

export function validateLoginDto(
  data: unknown,
) {
  return loginDtoSchema.safeParse(data);
}

// ======================================================
// 4. NORMALIZE LOGIN DATA
// ======================================================

export function normalizeLoginDto(
  data: LoginDto,
): LoginDto {
  return {
    ...data,

    email: data.email.trim().toLowerCase(),
  };
}

// ======================================================
// 5. DEFAULT EXPORT
// ======================================================

export default loginDtoSchema;
