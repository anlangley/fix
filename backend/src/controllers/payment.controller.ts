import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// ══════════════════════════════════════════════
// PAYMENT CONTROLLER — VietQR (MB Bank)
// ══════════════════════════════════════════════

/**
 * POST /api/payments/vietqr/create
 * Khởi tạo thông tin thanh toán VietQR (MB Bank)
 */
export async function createVietQRPaymentRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookingId } = req.body as { bookingId: string };
    const userId = req.user!.userId;

    if (!bookingId) {
      res.status(400).json({ success: false, message: 'bookingId là bắt buộc' });
      return;
    }

    // Lấy booking và kiểm tra quyền
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: { select: { name: true } } },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
      return;
    }

    if (booking.userId !== userId) {
      res.status(403).json({ success: false, message: 'Bạn không có quyền thanh toán booking này' });
      return;
    }

    if (booking.paymentStatus === 'PAID') {
      res.status(400).json({ success: false, message: 'Booking này đã được thanh toán' });
      return;
    }

    // Thông tin tài khoản MB Bank
    const bankId = 'MB'; // Ngân hàng Quân Đội
    const accountNo = '0923847453';
    const template = 'compact2';
    const amount = Math.round(Number(booking.totalPrice));
    const description = `LUX${bookingId.slice(-6).toUpperCase()}`;
    const accountName = 'LuxStay';

    // Tạo URL QR Code từ VietQR API
    const qrCodeUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;

    // Cập nhật phương thức thanh toán cho Booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentMethod: 'VIETQR',
        paymentStatus: 'UNPAID',
      },
    });

    // Tạo hoặc cập nhật bản ghi Payment
    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method: 'VIETQR',
        amount: booking.totalPrice,
        status: 'UNPAID',
      },
      update: {
        method: 'VIETQR',
        status: 'UNPAID',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Thông tin thanh toán VietQR đã sẵn sàng',
      data: {
        qrCodeUrl,
        amount,
        bankId,
        accountNo,
        accountName,
        description,
        bookingId
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments/confirm
 * Người dùng xác nhận đã thực hiện chuyển khoản thành công
 */
export async function confirmPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookingId } = req.body as { bookingId: string };
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt phòng' });
      return;
    }

    // Cập nhật trạng thái sang PENDING để chờ Admin xác nhận
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'AWAITING_CONFIRMATION',
          paymentStatus: 'UNPAID' // Vẫn là UNPAID cho đến khi Admin duyệt
        },
      }),
      prisma.payment.update({
        where: { bookingId },
        data: { status: 'PENDING' },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Hệ thống đã ghi nhận xác nhận của bạn. Vui lòng chờ Admin kiểm tra và duyệt.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/status/:bookingId
 * Kiểm tra trạng thái thanh toán của booking
 */
export async function getPaymentStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { bookingId } = req.params;
    const userId = req.user!.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        status: true,
        totalPrice: true,
        payment: { 
          select: { 
            method: true,
            status: true,
            paidAt: true 
          } 
        },
      },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Không tìm thấy booking' });
      return;
    }

    // Chỉ cho phép xem payment của chính mình (hoặc admin)
    if (booking.userId !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Không có quyền xem' });
      return;
    }

    res.status(200).json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
}
