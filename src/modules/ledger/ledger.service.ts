import { Prisma } from "../../../generated/prisma/client.js";
import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { DepositInput, TransactionQueryInput, TransferInput } from "./ledger.validation.js";


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

export async function getTransactions(
  userId: string,
  query: TransactionQueryInput
) {
  const {
    walletId,
    type,
    status,
    limit,
    cursor,
  } = query;

  const transactions = await prisma.transaction.findMany({
    where: {
      ledgerEntries: {
        some: {
          wallet: {
            userId,
          },
          ...(walletId && {
            walletId,
          }),
        },
      },

      ...(type && {
        type,
      }),

      ...(status && {
        status,
      }),
    },

    select: {
      id: true,
      reference: true,
      amount: true,
      type: true,
      status: true,
      description: true,
      createdAt: true,

      ledgerEntries: {
        select: {
          walletId: true,
          entryType: true,
          amount: true,

          wallet: {
            select: {
              name: true,
            },
          },
        },
      },
    },

    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],

    take: limit + 1,

    ...(cursor && {
      cursor: {
        id: cursor,
      },
      skip: 1,
    }),
  });

  const hasNextPage = transactions.length > limit;

const result = hasNextPage
  ? transactions.slice(0, limit)
  : transactions;

const nextCursor =
  hasNextPage
    ? result[result.length - 1]?.id ?? null
    : null;

return {
  transactions: result,
  nextCursor,
};
}