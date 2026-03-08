// import { z } from "zod";

// export const createWalletSchema = z.object({
//   userId: z.string(),
// });

// export const depositWalletSchema = z.object({
//   userId: z.string(),
//   amount: z.number().min(0.01),
//   reference: z.string().optional(),
// });
import { z } from "zod";

export const depositWalletSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});
