import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { DepositInput } from "./ledger.validation.js";


export async function deposit(userId: string, walletId: string, data: DepositInput){
    const wallet = await prisma.wallet.findFirst({
        where: {
            id: walletId,
            userId,
            isActive: true,
        },
    });

    if(!wallet){
        throw new AppError(404, "Wallet not found");
    }

    const result = await prisma.$transaction(async(tx) => {
        const transaction = await tx.transaction.create({
            data: {
                reference: crypto.randomUUID(),
                amount: data.amount,
                type: "DEPOSIT",
                status: "SUCCESS",
                ...(data.description !== undefined && {
                   description: data.description,
                }),
            },
        });

        await tx.ledgerEntry.create({
            data:{
                transactionId: transaction.id,
                walletId,
                entryType: "CREDIT",
                amount: data.amount,
            },
        });

        await tx.wallet.update({
            where: {
                id: walletId,
            },
            data: {
                balance: {
                    increment: data.amount
                },
            },
        });
        return transaction;
    });

    return result;
}