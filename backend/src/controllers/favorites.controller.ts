import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// ══════════════════════════════════════════════
// FAVORITES CONTROLLER
// ══════════════════════════════════════════════

/**
 * GET /api/favorites
 * Lấy danh sách phòng yêu thích của user
 */
export async function getMyFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            type: true,
            pricePerNight: true,
            location: true,
            avgRating: true,
            reviewCount: true,
            status: true,
            images: { where: { isPrimary: true }, take: 1, select: { url: true } },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/favorites/:roomId
 * Thêm phòng vào danh sách yêu thích
 */
export async function addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;

    // Kiểm tra phòng tồn tại
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
      return;
    }

    // Kiểm tra đã yêu thích chưa
    const existing = await prisma.favorite.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (existing) {
      res.status(200).json({ success: true, message: 'Phòng đã có trong danh sách yêu thích' });
      return;
    }

    await prisma.favorite.create({
      data: { userId, roomId },
    });

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào yêu thích',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/favorites/:roomId
 * Bỏ phòng khỏi danh sách yêu thích
 */
export async function removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;

    await prisma.favorite.deleteMany({
      where: { userId, roomId },
    });

    res.status(200).json({
      success: true,
      message: 'Đã bỏ yêu thích',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/favorites/check/:roomId
 * Kiểm tra phòng có trong yêu thích không
 */
export async function checkFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { roomId } = req.params;

    const fav = await prisma.favorite.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    res.status(200).json({
      success: true,
      data: { isFavorited: !!fav },
    });
  } catch (error) {
    next(error);
  }
}
