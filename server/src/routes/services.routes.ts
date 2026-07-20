import { Router } from 'express';
import {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', authenticate, authorize('ADMIN'), createService);
router.put('/:id', authenticate, authorize('ADMIN'), updateService);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteService);

export default router;
