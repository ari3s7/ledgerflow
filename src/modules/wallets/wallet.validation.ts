import { z } from 'zod';

export const createWalletSchema = z.object({
    name: z.string().trim()
    .min(3, "Wallet name must be at least 3 characters")
    .max(50, "Wallet name cannot exceed 50 characters"),
})

export type CreateWalletInput = z.infer<typeof createWalletSchema>