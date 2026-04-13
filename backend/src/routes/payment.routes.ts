import { Router } from 'express';
import {
  createMomoPaymentRequest,
  handleMomoCallback,
  getPaymentStatus,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ── MoMo Payment ──────────────────────────────
// Tạo lệnh thanh toán (cần auth)
router.post('/momo/create', authenticate, createMomoPaymentRequest);

// MoMo IPN Callback (MoMo server gọi, KHÔNG cần auth)
router.post('/momo/callback', handleMomoCallback);

// Kiểm tra trạng thái thanh toán
router.get('/status/:bookingId', authenticate, getPaymentStatus);

export default router;
