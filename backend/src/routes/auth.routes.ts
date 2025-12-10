import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { RegisterSchema, LoginSchema, PasswordResetSchema } from '../schemas/validation';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/password-reset', validate(PasswordResetSchema), AuthController.requestPasswordReset);
router.post('/password-reset-confirm', AuthController.confirmPasswordReset);
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;