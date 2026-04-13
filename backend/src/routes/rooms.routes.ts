import { Router } from 'express';
import { z } from 'zod';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/rooms.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createRoomSchema, updateRoomSchema, roomQuerySchema } from '../validators/rooms.validator';

const router = Router();

// ── Public: Xem danh sách và chi tiết phòng ───
router.get('/',    validate(z.object({ query: roomQuerySchema })), getRooms);
router.get('/:id', getRoomById);

// ── Admin: Quản lý phòng ───────────────────────
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(z.object({ body: createRoomSchema })),
  createRoom
);

router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(z.object({ body: updateRoomSchema })),
  updateRoom
);

router.delete('/:id', authenticate, requireAdmin, deleteRoom);

export default router;
