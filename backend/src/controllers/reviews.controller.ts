import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';

// ══════════════════════════════════════════════
// REVIEWS CONTROLLER
// ══════════════════════════════════════════════

const createReviewSchema = z.object({
  roomId: z.string().uuid('ID phòng không hợp lệ'),
  rating: z
    .number()
    .int()
    .min(1, 'Điểm đánh giá tối thiểu là 1')
    .max(5, 'Điểm đánh giá tối đa là 5'),
  comment: z
    .string()
    .min(10, 'Nhận xét cần ít nhất 10 ký tự')
    .max(1000, 'Nhận xét không được quá 1000 ký tự'),
});

/**
 * GET /api/reviews/:roomId
 * Lấy danh sách đánh giá của một phòng
 */
export async function getRoomReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { roomId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      prisma.review.count({ where: { roomId } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/reviews
 * Tạo đánh giá mới — chỉ user đã sử dụng phòng (booking status COMPLETED)
 */
export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const parsed = createReviewSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }

    const { roomId, rating, comment } = parsed.data;

    // Kiểm tra user đã thực sự ở phòng này
    const completedBooking = await prisma.booking.findFirst({
      where: { userId, roomId, status: 'COMPLETED' },
    });

    if (!completedBooking) {
      res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá phòng đã sử dụng dịch vụ',
      });
      return;
    }

    // Kiểm tra đã review chưa
    const existing = await prisma.review.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Bạn đã đánh giá phòng này rồi',
      });
      return;
    }

    // Tạo review và cập nhật avgRating của Room
    const [review] = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: { userId, roomId, rating, comment },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      });

      // Tính lại avgRating
      const stats = await tx.review.aggregate({
        where: { roomId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.room.update({
        where: { id: roomId },
        data: {
          avgRating: stats._avg.rating ?? 0,
          reviewCount: stats._count.rating,
        },
      });

      return [newReview];
    });

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã đánh giá!',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}
