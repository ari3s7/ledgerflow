import { z } from 'zod';

export const depositSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),

    description: z.string().trim().max(255).optional(),
});

export const transferSchema = z.object({
    fromWalletId: z.string(),
    toWalletId: z.string(),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    description: z.string().trim().max(255).optional(),
}).refine(
        (data) => data.fromWalletId !== data.toWalletId,
        {
            message: "Source and destination wallets must be different",
            path: ["toWalletId"]
        }
    );

export type TransferInput = z.infer<typeof transferSchema>
export type DepositInput = z.infer<typeof depositSchema>