import { Router } from 'express';
import { z } from 'zod';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/bookings.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createBookingSchema, updateBookingStatusSchema, bookingQuerySchema } from '../validators/bookings.validator';

const router = Router();

// Tất cả booking routes yêu cầu xác thực
router.use(authenticate);

// ── User routes ────────────────────────────────
router.post(
  '/',
  validate(z.object({ body: createBookingSchema })),
  createBooking
);

router.get(
  '/my-bookings',
  validate(z.object({ query: bookingQuerySchema })),
  getMyBookings
);

router.put('/:id/cancel', cancelBooking);

// ── Admin routes ───────────────────────────────
router.get(
  '/',
  requireAdmin,
  validate(z.object({ query: bookingQuerySchema })),
  getAllBookings
);

router.put(
  '/:id/status',
  requireAdmin,
  validate(z.object({ body: updateBookingStatusSchema })),
  updateBookingStatus
);

export default router;
