import Router from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { depositSchema, transactionQuerySchema, transferSchema, walletStatementQuerySchema } from './ledger.validation.js';
import { depositController, getTransactionsController, getWalletStatementController, transferController } from './ledger.controller.js';

const router = Router();

router.post("/deposit/:walletId", authenticate, validate(depositSchema), depositController);
router.post("/transfer", authenticate, validate(transferSchema), transferController);
router.get("/transactions", authenticate,validate(transactionQuerySchema), getTransactionsController);
router.get("/wallets/:walletId/statement",authenticate, validate(walletStatementQuerySchema, "query"),getWalletStatementController);


export default router;