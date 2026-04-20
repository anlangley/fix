import { Router } from 'express';
import { getMyFavorites, addFavorite, removeFavorite, checkFavorite } from '../controllers/favorites.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticate);

/**
 * @route   GET /api/favorites
 * @desc    Lấy danh sách phòng yêu thích
 */
router.get('/', getMyFavorites);

/**
 * @route   GET /api/favorites/check/:roomId
 * @desc    Kiểm tra phòng có trong yêu thích không
 */
router.get('/check/:roomId', checkFavorite);

/**
 * @route   POST /api/favorites/:roomId
 * @desc    Thêm phòng vào yêu thích
 */
router.post('/:roomId', addFavorite);

/**
 * @route   DELETE /api/favorites/:roomId
 * @desc    Bỏ phòng khỏi yêu thích
 */
router.delete('/:roomId', removeFavorite);

export default router;
