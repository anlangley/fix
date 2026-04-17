import { Router } from 'express';
import { getDashboardStats, getAllUsers, updateUserRole } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả admin routes đều yêu cầu đăng nhập và quyền ADMIN
router.use(authenticate, requireAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Lấy thống kê dashboard
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Lấy danh sách người dùng
 */
router.get('/users', getAllUsers);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Cập nhật quyền người dùng (Cần ADMIN)
 */
router.patch('/users/:id/role', updateUserRole);

export default router;
