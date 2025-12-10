import { Router } from 'express';
import { ChannelController } from '../controllers/ChannelController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateChannelSchema, UpdateChannelSchema } from '../schemas/validation';

const router = Router();

router.post('/', authMiddleware, validate(CreateChannelSchema), ChannelController.create);
router.get('/form/:formId', ChannelController.listByForm);
router.put('/:id', authMiddleware, validate(UpdateChannelSchema), ChannelController.update);
router.delete('/:id', authMiddleware, ChannelController.delete);

export default router;