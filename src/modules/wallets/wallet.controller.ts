import type { Request, Response, NextFunction } from "express";
import { createWallet } from "./wallet.service.js";
import { ApiResponse } from "../../common/responses/api-response.js";


export async function createWalletController(req: Request, res:Response, next:NextFunction){
    try {
        const wallet = await createWallet(req.user!.id, req.body);

        return  res.status(201).json(
            ApiResponse.success("Wallet created successfully", wallet)
        );
    } catch(error){
        next(error)
    }
}