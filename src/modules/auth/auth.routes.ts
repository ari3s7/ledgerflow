import Router from 'express';
import { loginController, registerController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);

export default router;
