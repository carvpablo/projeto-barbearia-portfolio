import { Router } from 'express';
import {
  createAppointment,
  listMyAppointments,
  cancelAppointment,
  completeAppointment,
  getAdminStats,
} from '../controllers/appointments.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listMyAppointments);
router.post('/', authorize('CLIENT'), createAppointment);
router.patch('/:id/cancel', cancelAppointment);
router.patch('/:id/complete', authorize('BARBER', 'ADMIN'), completeAppointment);
router.get('/admin/stats', authorize('ADMIN'), getAdminStats);

export default router;
