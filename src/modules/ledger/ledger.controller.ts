import type { Request, Response, NextFunction } from "express";
import type { DepositInput } from "./ledger.validation.js";
import { deposit } from "./ledger.service.js";
import { ApiResponse } from "../../common/responses/api-response.js";



export async function depositController(req: Request<{walletId: string}, {}, DepositInput>, res: Response, next: NextFunction) {
   try{
    const transaction = await deposit(req.user!.id, req.params.walletId, req.body);

    return res.status(201).json(
        ApiResponse.success("Deposit successfull", transaction)
    )
   } catch(error){
    next(error);
   }
}