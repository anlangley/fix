import { Router } from 'express';
import {
  createVietQRPaymentRequest,
  confirmPayment,
  getPaymentStatus,
} from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// ── VietQR Payment ──────────────────────────────
// Tạo lệnh thanh toán (cần auth)
router.post('/vietqr/create', authenticate, createVietQRPaymentRequest);

// Xác nhận đã thanh toán (cần auth)
router.post('/confirm', authenticate, confirmPayment);

// Kiểm tra trạng thái thanh toán
router.get('/status/:bookingId', authenticate, getPaymentStatus);

export default router;
