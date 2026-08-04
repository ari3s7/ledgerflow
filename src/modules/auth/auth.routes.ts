import Router from 'express';
import { getMeController, loginController, registerController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema, registerSchema } from './auth.validation.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.get("/me", authenticate, getMeController)

export default router;
