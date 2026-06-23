import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createTrip,
  listTrips,
  getTrip,
  updateTrip,
  regenerateDay,
  deleteTrip,
} from '../controllers/tripController';

const router = Router();

// All trip routes require authentication
router.use(protect);

router.route('/').get(listTrips).post(createTrip);

router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip);

router.put('/:id/regenerate-day/:dayNumber', regenerateDay);

export default router;
