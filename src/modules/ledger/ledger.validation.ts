import { z } from 'zod';
import { TransactionStatus, TransactionType } from '../../../generated/prisma/enums.js';

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

export const transactionQuerySchema = z.object({
  walletId: z.string().optional(),

  type: z
    .enum(TransactionType)
    .optional(),

  status: z
    .enum(TransactionStatus)
    .optional(),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),

  cursor: z.string().optional(),
});

export type TransferInput = z.infer<typeof transferSchema>
export type DepositInput = z.infer<typeof depositSchema>
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>