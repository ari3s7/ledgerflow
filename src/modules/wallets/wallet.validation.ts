import { z } from 'zod';

export const createWalletSchema = z.object({
    name: z.string().trim()
    .min(3, "Wallet name must be at least 3 characters")
    .max(50, "Wallet name cannot exceed 50 characters"),
})

export const walletParamSchema = z.object({
    walletId: z.string(),
})

export const updateWalletSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Wallet name must be at least 3 characters")
    .max(50, "Wallet name cannot exceed 50 characters"),
});

export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
export type CreateWalletInput = z.infer<typeof createWalletSchema>
export type WalletParams = z.infer<typeof walletParamSchema>