import { z } from 'zod';

export const depositSchema = z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0"),

    description: z.string().trim().max(255).optional(),
});

export type DepositInput = z.infer<typeof depositSchema>