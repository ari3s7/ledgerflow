import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { DepositInput, TransferInput } from "./ledger.validation.js";


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
};

export async function transfer(userId: string, data: TransferInput){
    const amount = new Prisma.Decimal(data.amount);
    return prisma.$transaction(async(tx) => {
        const walletIds = [
            data.fromWalletId,
            data.toWalletId
        ].sort();

        for(const walletId of walletIds){
            await tx.$queryRaw`
            SELECT id
            FROM "Wallet"
            WHERE id = ${walletId}
            FOR UPDATE
            `;
        }
        const [fromWallet, toWallet]  = await Promise.all([
        tx.wallet.findFirst({
        where: {
            id: data.fromWalletId,
            userId,
            isActive: true,
        }   
    }),
    tx.wallet.findFirst({
        where: {
            id: data.toWalletId,
            userId,
            isActive: true,
        },
     }),
    ]);

    if(!fromWallet){
        throw new AppError(404, "Source wallet not found")
    }

    if(!toWallet){
        throw new AppError(404, "Destination wallet not found")
    }

    if(fromWallet.balance.lt(data.amount)) {
        throw new AppError(400, "Insufficient balance")
    }

    const transaction = await tx.transaction.create({
        data: {
            reference: crypto.randomUUID(),
            amount,
            type: "TRANSFER",
            status: "SUCCESS",
            ...(data.description !== undefined && {
                description: data.description
            }),
        },
    });

    await tx.ledgerEntry.create({
        data: {
            transactionId: transaction.id,
            walletId: fromWallet.id,
            entryType: "DEBIT",
            amount,
        },
     });

     await tx.wallet.update({
        where: {
            id: fromWallet.id,
        },
        data: {
            balance: {
                decrement: amount,
            }
        }
     });

     await tx.wallet.update({
        where: {
            id: toWallet.id,
        },
        data: {
            balance: {
                increment: amount
            },
        },
     });

     return tx.transaction.findUnique({
        where: {
            id: transaction.id,
        },
        include: {
            ledgerEntries: true,
        },
     });
    });
} 