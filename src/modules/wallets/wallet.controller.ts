import type { Request, Response, NextFunction } from "express";
import { walletService } from "./wallet.service.js";
import { ApiResponse } from "../../common/responses/api-response.js";
import type { WalletParams } from "./wallet.validation.js";


export async function createWalletController(req: Request, res:Response, next:NextFunction){
    try {
        const wallet = await walletService.create(req.user!.id, req.body);

        return  res.status(201).json(
            ApiResponse.success("Wallet created successfully", wallet)
        );
    } catch(error){
        next(error)
    }
}

export async function getWalletController(req: Request, res: Response, next: NextFunction) {
   try{
      const wallets = await walletService.getAll(req.user!.id);

      return res.status(200).json(
        ApiResponse.success("Wallet fetched successfully", wallets)
      );
   } catch(error){
    next(error);
   }
}

export async function getWalletByIdController(req: Request<WalletParams>, res: Response, next: NextFunction) {
    try{
        const wallet = await walletService.getById(req.user!.id, req.params.walletId);

        return res.status(200).json(
            ApiResponse.success("Wallet fetched successfully", wallet)
        )
    } catch(error){
        next(error)
    }
}

export async function updateWalletController(req: Request<WalletParams>, res: Response, next: NextFunction){
    try{
        const wallet = await walletService.update(req.user!.id, req.params.walletId, req.body)

        return res.status(200).json(
            ApiResponse.success("Wallet updated successfully", wallet)
        );
    } catch(error){
        next(error);
    }
}