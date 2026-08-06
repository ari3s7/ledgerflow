import Router from 'express';
import { validate } from '../../middlewares/validate.js';
import { createWalletSchema, updateWalletSchema } from './wallet.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { createWalletController, getWalletByIdController, getWalletController, updateWalletController } from './wallet.controller.js';

const router = Router();

router.post("/", validate(createWalletSchema), authenticate, createWalletController);
router.get("/", authenticate, getWalletController);
router.get("/:walletId", authenticate, getWalletByIdController);
router.patch("/:walletId", validate(updateWalletSchema), authenticate, updateWalletController);


export default router;