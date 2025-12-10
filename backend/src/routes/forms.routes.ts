import { Router } from 'express';
import { FormController } from '../controllers/FormController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { CreateFormSchema, UpdateFormSchema } from '../schemas/validation';

const router = Router();

router.use(authMiddleware); // Todas as rotas requerem autenticação

router.post('/', validate(CreateFormSchema), FormController.create);
router.get('/', FormController.list);
router.get('/:id', FormController.getById);
router.get('/:id/stats', FormController.getStats);
router.put('/:id', validate(UpdateFormSchema), FormController.update);
router.post('/:id/publish', FormController.publish);
router.delete('/:id', FormController.delete);

export default router;