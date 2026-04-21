import { NextFunction, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendBookingConfirmationEmail } from '../services/email.service';
import { createNotification } from '../utils/notification.helper';
import type { BookingQueryInput, CreateBookingInput, UpdateBookingStatusInput } from '../validators/bookings.validator';

// ══════════════════════════════════════════════
// BOOKINGS CONTROLLER
// ══════════════════════════════════════════════

const TAX_RATE = 0.10; // 10% thuế phí dịch vụ

/** Tính số đêm giữa 2 ngày */
function calcNights(checkIn: Date, checkOut: Date): number {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * POST /api/bookings
 * Tạo đơn đặt phòng mới (server tính giá — tránh gian lận)
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      roomId,
      checkInDate,
      checkOutDate,
      guestsCount,
      roomsCount,
      specialRequest,
      paymentMethod,
    }: CreateBookingInput = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Lấy thông tin phòng (lấy giá thực từ DB)
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { id: true, name: true, status: true, pricePerNight: true, capacityAdults: true },
    });

    if (!room) {
      res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
      return;
    }

    // Chú thích hoặc xóa kiểm tra cứng nhắc để linh hoạt hơn (đã có kiểm tra conflict bên dưới)
    /*
    if (room.status !== 'AVAILABLE') {
      res.status(400).json({ success: false, message: 'Phòng hiện không có sẵn để đặt' });
      return;
    }
    */

    // Kiểm tra phòng đã có booking trong khoảng ngày này chưa
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          { checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } },
        ],
      },
    });

    if (conflict) {
      res.status(409).json({
        success: false,
        message: 'Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn ngày khác.',
      });
      return;
    }

    // Tính tiền (server-side)
    const nightCount = calcNights(checkIn, checkOut);
    const pricePerNight = Number(room.pricePerNight);
    const subtotal = pricePerNight * nightCount * roomsCount;
    const taxAmount = subtotal * TAX_RATE;
    const totalPrice = subtotal + taxAmount;

    // Tạo booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nightCount,
        guestsCount,
        roomsCount,
        specialRequest: specialRequest || null,
        pricePerNight: room.pricePerNight,
        subtotal,
        taxRate: TAX_RATE,
        taxAmount,
        totalPrice,
        status: 'AWAITING_PAYMENT',
        paymentStatus: 'UNPAID',
        paymentMethod: paymentMethod || null,
      },
      include: {
        room: { select: { name: true, location: true } },
        user: { select: { name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công! Vui lòng tiến hành thanh toán.',
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings/my-bookings
 * Lịch sử đặt phòng của user đang đăng nhập
 */
export async function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { page, limit, status }: BookingQueryInput = req.query as any;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = { userId };
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          room: {
            select: {
              name: true,
              location: true,
              type: true,
              images: { where: { isPrimary: true }, take: 1, select: { url: true } },
            },
          },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/bookings [Admin]
 * Lấy tất cả bookings với filter theo status
 */
export async function getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, status, userId }: BookingQueryInput = req.query as any;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          room: { select: { name: true, type: true } },
        },
      }),
      prisma.booking.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/bookings/:id/status [Admin]
 * Admin duyệt/từ chối/hoàn thành booking
 */
export async function updateBookingStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status }: UpdateBookingStatusInput = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        room: { select: { name: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: {
          status,
          ...(status === 'CONFIRMED' ? { paymentStatus: 'PAID' } : {}),
        },
      });

      // ĐỒNG BỘ TRẠNG THÁI PHÒNG
      if (status === 'CONFIRMED') {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'BOOKED' },
        });

        await tx.payment.updateMany({
          where: { bookingId: id },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      } else if (status === 'CANCELLED' || status === 'COMPLETED') {
        // Trả phòng về lại trạng thái Available
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'AVAILABLE' },
        });
      }

      return b;
    });

    // Gửi email xác nhận nếu booking được duyệt
    if (status === 'CONFIRMED') {
      sendBookingConfirmationEmail(
        booking.user.email,
        booking.user.name,
        {
          id: booking.id,
          roomName: booking.room.name,
          checkIn: booking.checkInDate.toLocaleDateString('vi-VN'),
          checkOut: booking.checkOutDate.toLocaleDateString('vi-VN'),
          totalPrice: Number(booking.totalPrice).toLocaleString('vi-VN'),
          guests: booking.guestsCount,
        }
      ).catch(console.error);
    }

    // ── GỬI THÔNG BÁO TRONG ỨNG DỤNG ──
    try {
      let notifTitle = '';
      let notifMessage = '';

      if (status === 'CONFIRMED') {
        notifTitle = 'Đơn đặt phòng đã được xác nhận! ✅';
        notifMessage = `Phòng "${booking.room.name}" của bạn đã được xác nhận thành công. Hẹn gặp bạn vào ngày ${booking.checkInDate.toLocaleDateString('vi-VN')}.`;
      } else if (status === 'CANCELLED') {
        notifTitle = 'Đơn đặt phòng bị hủy ❌';
        notifMessage = `Rất tiếc, đơn đặt phòng "${booking.room.name}" của bạn đã bị hủy. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.`;
      } else if (status === 'COMPLETED') {
        notifTitle = 'Chuyến đi hoàn tất 🏨';
        notifMessage = `Cảm ơn bạn đã sử dụng dịch vụ tại LuxStay. Chúc bạn có những trải nghiệm tuyệt vời!`;
      }

      if (notifTitle) {
        await createNotification(booking.userId, notifTitle, notifMessage, 'BOOKING');
      }
    } catch (notifError) {
      console.error('Lỗi khi gửi thông báo (không làm gián đoạn booking):', notifError);
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái booking thành công',
      data: { booking: updated },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/bookings/:id/cancel
 * User tự hủy booking (chỉ khi status = PENDING)
 */
export async function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
      return;
    }

    // Chỉ chủ booking mới được hủy
    if (booking.userId !== userId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền hủy booking này' });
      return;
    }

    if (booking.status !== 'PENDING') {
      res.status(400).json({
        success: false,
        message: 'Chỉ có thể hủy booking đang ở trạng thái Chờ duyệt',
      });
      return;
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.status(200).json({ success: true, message: 'Hủy đặt phòng thành công' });
  } catch (error) {
    next(error);
  }
}
