import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * GET /api/admin/stats
 * Lấy các con số thống kê tổng hợp cho Dashboard
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [roomsCount, bookingsToday, revenueResult, usersCount] = await Promise.all([
      prisma.room.count(),
      prisma.booking.count({
        where: {
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          paymentStatus: 'PAID',
          updatedAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        roomsCount,
        bookingsToday,
        monthlyRevenue: Number(revenueResult._sum.totalPrice || 0),
        usersCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 * Lấy danh sách tất cả người dùng (Admin mới có quyền)
 */
export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          isEmailVerified: true,
          createdAt: true,
          _count: {
            select: { bookings: true },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * Cập nhật vai trò (Role) của người dùng
 */
export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'USER'].includes(role)) {
      res.status(400).json({ success: false, message: 'Vai trò không hợp lệ. Phải là ADMIN hoặc USER.' });
      return;
    }

    // Không cho phép tự hạ quyền của chính mình (đề phòng lỗi)
    if (id === req.user!.userId) {
      res.status(400).json({ success: false, message: 'Bạn không thể tự thay đổi quyền của chính mình.' });
      return;
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.status(200).json({ success: true, message: 'Cập nhật quyền thành công' });
  } catch (error) {
    next(error);
  }
}

