import Router from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { depositSchema, transferSchema } from './ledger.validation.js';
import { depositController, transferController } from './ledger.controller.js';

const router = Router();

router.post("/deposit/:walletId", authenticate, validate(depositSchema), depositController);
router.post("/transfer", authenticate, validate(transferSchema), transferController);


export default router;