import { Router } from 'express';
import { z } from 'zod';
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getProfileStats,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

// ── Public routes ──────────────────────────────
router.post('/register',         validate(z.object({ body: registerSchema })),         register);
router.post('/login',            validate(z.object({ body: loginSchema })),             login);
router.get('/verify-email',      verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password',  validate(z.object({ body: forgotPasswordSchema })),   forgotPassword);
router.post('/reset-password',   validate(z.object({ body: resetPasswordSchema })),    resetPassword);

// ── Protected routes ───────────────────────────
router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(z.object({ body: changePasswordSchema })), changePassword);
router.put('/profile', authenticate, validate(z.object({ body: updateProfileSchema })), updateProfile);
router.get('/profile/stats', authenticate, getProfileStats);

export default router;
