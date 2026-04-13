import { Router } from 'express';
import { getRoomReviews, createReview } from '../controllers/reviews.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:roomId',    getRoomReviews);
router.post('/', authenticate, createReview);

export default router;
