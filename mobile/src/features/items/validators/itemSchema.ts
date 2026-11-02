// mobile/src/features/items/validators/itemSchema.ts

import { z } from "zod";

/* =========================================================
   CONSTANTS
========================================================= */

export const ITEM_TYPES = ["LOST", "FOUND"] as const;

export const ITEM_CATEGORIES = [
  "Electronics",
  "Books & Notes",
  "ID Cards",
  "Wallets",
  "Keys",
  "Bags",
  "Clothing",
  "Accessories",
  "Documents",
  "Other",
] as const;

export const MAX_ITEM_TITLE_LENGTH = 100;

export const MAX_ITEM_DESCRIPTION_LENGTH = 2000;

export const MAX_IDENTIFYING_FEATURES_LENGTH = 1000;

export const MAX_ITEM_IMAGES = 5;

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/* =========================================================
   REUSABLE VALIDATORS
========================================================= */

const requiredText = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required.`);

const optionalText = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength, `Must not exceed ${maxLength} characters.`)
    .optional()
    .or(z.literal(""));

/* =========================================================
   DATE VALIDATOR
========================================================= */

export const itemDateSchema = z
  .string()
  .trim()
  .min(1, "Date is required.")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Please enter a valid calendar date.");

/* =========================================================
   IMAGE VALIDATOR
========================================================= */

export const itemImageSchema = z.object({
  uri: z.string().trim().min(1, "Image URI is required."),

  name: z.string().trim().min(1, "Image name is required."),

  type: z
    .string()
    .trim()
    .regex(
      /^image\/(jpeg|jpg|png|webp|heic|heif)$/i,
      "Only supported image formats are allowed.",
    ),

  size: z
    .number()
    .positive()
    .max(MAX_IMAGE_SIZE, "Each image must be 5 MB or smaller.")
    .optional(),
});

export const itemImagesSchema = z
  .array(itemImageSchema)
  .max(
    MAX_ITEM_IMAGES,
    `You can upload a maximum of ${MAX_ITEM_IMAGES} images.`,
  )
  .optional();

/* =========================================================
   CREATE ITEM SCHEMA
========================================================= */

export const createItemSchema = z.object({
  title: requiredText("Item name")
    .min(3, "Item name must contain at least 3 characters.")
    .max(
      MAX_ITEM_TITLE_LENGTH,
      `Item name cannot exceed ${MAX_ITEM_TITLE_LENGTH} characters.`,
    ),

  description: requiredText("Description")
    .min(10, "Description must contain at least 10 characters.")
    .max(
      MAX_ITEM_DESCRIPTION_LENGTH,
      `Description cannot exceed ${MAX_ITEM_DESCRIPTION_LENGTH} characters.`,
    ),

  type: z.enum(ITEM_TYPES),

  category: requiredText("Category"),

  categoryId: z.string().trim().optional(),

  location: requiredText("Location").max(
    200,
    "Location cannot exceed 200 characters.",
  ),

  locationId: z.string().trim().optional(),

  dateLostOrFound: itemDateSchema,

  color: optionalText(50),

  brand: optionalText(100),

  identifyingFeatures: optionalText(MAX_IDENTIFYING_FEATURES_LENGTH),

  images: itemImagesSchema,
});

/* =========================================================
   LOST ITEM SCHEMA
========================================================= */

export const lostItemSchema = createItemSchema.extend({
  type: z.literal("LOST"),
});

/* =========================================================
   FOUND ITEM SCHEMA
========================================================= */

export const foundItemSchema = createItemSchema.extend({
  type: z.literal("FOUND"),
});

/* =========================================================
   UPDATE ITEM SCHEMA
========================================================= */

export const updateItemSchema = z.object({
  title: z.string().trim().min(3).max(MAX_ITEM_TITLE_LENGTH).optional(),

  description: z
    .string()
    .trim()
    .min(10)
    .max(MAX_ITEM_DESCRIPTION_LENGTH)
    .optional(),

  category: z.string().trim().optional(),

  categoryId: z.string().trim().optional(),

  location: z.string().trim().max(200).optional(),

  locationId: z.string().trim().optional(),

  dateLostOrFound: itemDateSchema.optional(),

  color: optionalText(50),

  brand: optionalText(100),

  identifyingFeatures: optionalText(MAX_IDENTIFYING_FEATURES_LENGTH),

  images: itemImagesSchema,

  remainingImageUrls: z.array(z.string().url()).optional(),

  removedImageUrls: z.array(z.string().url()).optional(),
});

/* =========================================================
   SEARCH FILTER SCHEMA
========================================================= */

export const itemSearchSchema = z.object({
  search: z.string().trim().max(100).optional(),

  type: z.enum(ITEM_TYPES).optional(),

  status: z.string().trim().optional(),

  categoryId: z.string().trim().optional(),

  locationId: z.string().trim().optional(),

  page: z.number().int().min(1).default(1),

  limit: z.number().int().min(1).max(100).default(10),

  sortBy: z
    .enum(["createdAt", "dateLostOrFound", "title"])
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/* =========================================================
   ITEM ID SCHEMA
========================================================= */

export const itemIdSchema = z.object({
  itemId: z.string().trim().min(1, "Item ID is required."),
});

/* =========================================================
   TYPE EXPORTS
========================================================= */

export type CreateItemFormValues = z.infer<typeof createItemSchema>;

export type LostItemFormValues = z.infer<typeof lostItemSchema>;

export type FoundItemFormValues = z.infer<typeof foundItemSchema>;

export type UpdateItemFormValues = z.infer<typeof updateItemSchema>;

export type ItemSearchValues = z.infer<typeof itemSearchSchema>;

export type ItemIdValues = z.infer<typeof itemIdSchema>;

/* =========================================================
   VALIDATION HELPERS
========================================================= */

export function validateCreateItem(values: unknown) {
  return createItemSchema.safeParse(values);
}

export function validateLostItem(values: unknown) {
  return lostItemSchema.safeParse(values);
}

export function validateFoundItem(values: unknown) {
  return foundItemSchema.safeParse(values);
}

export function validateUpdateItem(values: unknown) {
  return updateItemSchema.safeParse(values);
}

export function validateItemSearch(values: unknown) {
  return itemSearchSchema.safeParse(values);
}

/* =========================================================
   FORM ERROR HELPER
========================================================= */

export function getItemValidationErrors(
  values: unknown,
): Record<string, string> {
  const result = createItemSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: Record<string, string> = {};

  result.error.issues.forEach((issue) => {
    const field = issue.path.join(".");

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return errors;
}

/* =========================================================
   FIRST VALIDATION ERROR
========================================================= */

export function getFirstItemValidationError(values: unknown): string | null {
  const result = createItemSchema.safeParse(values);

  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message || null;
}

/* =========================================================
   DEFAULT FORM VALUES
========================================================= */

export const defaultItemFormValues: CreateItemFormValues = {
  title: "",
  description: "",
  type: "LOST",
  category: "",
  categoryId: "",
  location: "",
  locationId: "",
  dateLostOrFound: "",
  color: "",
  brand: "",
  identifyingFeatures: "",
  images: [],
};

/* =========================================================
   DEFAULT SEARCH VALUES
========================================================= */

export const defaultItemSearchValues: ItemSearchValues = {
  search: "",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default createItemSchema;
