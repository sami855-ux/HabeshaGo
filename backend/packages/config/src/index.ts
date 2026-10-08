import { z } from "zod";

export function parseEnv<T extends z.ZodRawShape>(
  shape: T,
  source: NodeJS.ProcessEnv = process.env,
) {
  const result = z.object(shape).safeParse(source);
  if (!result.success) {
    console.error("Invalid environment", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const csv = z
  .string()
  .transform((value) => value.split(",").map((item) => item.trim()).filter(Boolean));

export { z };
