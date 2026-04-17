import { Router } from 'express';
import { upload, uploadImages } from '../controllers/upload.controller';
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

export default router;
