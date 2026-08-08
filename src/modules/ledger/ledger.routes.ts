import Router from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.js';
import { depositSchema } from './ledger.validation.js';
import { depositController } from './ledger.controller.js';

const router = Router();

router.post("/deposit/:walletId", authenticate, validate(depositSchema), depositController);


export default router;