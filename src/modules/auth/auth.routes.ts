import Router from 'express';
import { registerController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { registerSchema } from './auth.validation.js';

const router = Router();

router.post("/register", validate(registerSchema), registerController);

export default router;
