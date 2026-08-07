import { AppError } from "../../common/errors/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateWalletInput, UpdateWalletInput } from "./wallet.validation.js";


export const walletService = {
    async create(userId: string, data: CreateWalletInput) {
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
  },

  async getAll(userId: string){
    return prisma.wallet.findMany({
        where: {
            userId,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
            currency: true,
            balance: true,
            isActive: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc",
        }
    })
  },

  async getById(userId: string, walletId: string){
    const wallet = await prisma.wallet.findFirst({
        where: {
            id: walletId,
            userId,
            isActive: true,
        }, select: {
            id: true,
            name: true,
            currency: true,
            balance: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        },
    });

    if(!wallet){
        throw new AppError(404, "Wallet not found")
    }
    return wallet;
  },

  async update(userId: string, walletId: string, data: UpdateWalletInput) {
      const wallet = await prisma.wallet.findFirst({
        where: {
            id: walletId,
            userId,
            isActive: true,
        },
      });

      if(!wallet){
        throw new AppError(404, "Wallet not found")
      };

      const duplicate = await prisma.wallet.findFirst({
        where: {
            userId,
            name: data.name,
            NOT: {
                id: walletId,
            },
        },
      });

      if(duplicate) {
        throw new AppError(409, "Wallet with this name already exists");
      };
      return prisma.wallet.update({
    where: {
        id: walletId,
    }, data: {
        name: data.name,
    },
    select: {
        id: true,
        name: true,
        currency: true,
        balance: true,
        isActive: true,
        updatedAt: true,
    },
  })
  },

  async deactivate(userId: string, walletId: string) {
    const wallet = await prisma.wallet.findFirst({
        where: {
            id: walletId,
            userId,
            isActive: true,
        },
    });
    if (!wallet) {
        throw new AppError(404, "Wallet not found");
    }

    if (wallet.balance.gt(0)) {
        throw new AppError(400,"Cannot deactivate a wallet with a non-zero balance");
    }
    return prisma.wallet.update({
        where: {
            id: walletId,
        }, data: {
            isActive: false
        },
        select: {
            id: true,
            name: true,
            isActive: true,
            updatedAt: true,
        },
    });
  },
}