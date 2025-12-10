import { Router } from 'express';
import { FeedbackController } from '../controllers/FeedbackController';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateFeedbackSchema } from '../schemas/validation';

const router = Router();

router.post('/', validate(CreateFeedbackSchema), FeedbackController.create);
router.get('/:formId', optionalAuth, FeedbackController.listByForm);
router.post('/:id/approve', authMiddleware, FeedbackController.approve);
router.post('/:id/reject', authMiddleware, FeedbackController.reject);

export default router;