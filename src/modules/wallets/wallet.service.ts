import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateWalletInput } from "./wallet.validation.js";


export async function createWallet(userId: string, data: CreateWalletInput) {
    const existingWallet = await prisma.wallet.findFirst({
        where: {
            userId,
            name: data.name,
        }
    });

    if(existingWallet){
        throw new AppError(409, "Wallet ")
    }

    const wallet = await prisma.wallet.create({
        data: {
            userId,
            name: data.name
        }, select: {
                id: true,
                name: true,
                currency: true,
                balance: true,
                isActive: true,
                createdAt: true,
        }
    });
    return wallet;
}