import { Router } from 'express';
import {
  listBarbers,
  getBarber,
  getAvailableSlots,
} from '../controllers/barbers.controller';

const router = Router();

router.get('/', listBarbers);
router.get('/:id', getBarber);
router.get('/:id/slots', getAvailableSlots);

export default router;
