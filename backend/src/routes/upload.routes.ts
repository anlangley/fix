import { Router } from 'express';
import { upload, uploadImages, uploadAvatar } from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/upload
 * @desc    Upload danh sách ảnh (Admin)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.array('images', 10),
  uploadImages
);

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload ảnh đại diện (User)
 */
router.post(
  '/avatar',
  authenticate,
  upload.single('avatar'),
  uploadAvatar
);

export default router;
