import type { Request, Response, NextFunction } from "express";
import type { DepositInput, TransactionQueryInput, TransferInput, WalletStatementQueryInput } from "./ledger.validation.js";
import { deposit, getTransactions, getWalletStatement, transfer } from "./ledger.service.js";
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

export async function transferController(
  req: Request<{}, {}, TransferInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const transaction = await transfer(
      req.user!.id,
      req.body
    );

    return res.status(201).json(
      ApiResponse.success(
        "Transfer successful",
        transaction
      )
    );
  } catch (error) {
    next(error);
  }
}

export async function getTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const transactions = await getTransactions(
      req.user!.id,
      req.query as unknown as TransactionQueryInput
    );

    return res.status(200).json(
      ApiResponse.success(
        "Transactions fetched successfully",
        transactions
      )
    );
  } catch (error) {
    next(error);
  }
}


export async function getWalletStatementController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const walletId = req.params.walletId as string;

    const query = req.query as unknown as WalletStatementQueryInput;

    const statement = await getWalletStatement(
      req.user!.id,
      walletId,
      query
    );

    return res.status(200).json(
      ApiResponse.success(
        "Wallet statement fetched successfully",
        statement
      )
    );
  } catch (error) {
    next(error);
  }
}