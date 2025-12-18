import { z } from "zod";

// Create Driver schema
export const createDriverSchema = z.object({
  userId: z.string({
    required_error: "userId is required",
    invalid_type_error: "userId must be a string",
  }),
  licenseNo: z.string({
    required_error: "licenseNo is required",
    invalid_type_error: "licenseNo must be a string",
  }),
  experience: z.number().int().optional().nullable(),
});

// Update Driver schema
export const updateDriverSchema = z.object({
  licenseNo: z.string().optional(),
  experience: z.number().int().optional().nullable(),
});
