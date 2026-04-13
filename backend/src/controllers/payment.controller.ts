import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import {
  createMomoPayment,
  verifyMomoCallback,
  type MomoCallbackBody,
} from '../services/momo.service';

// ══════════════════════════════════════════════
// PAYMENT CONTROLLER — MoMo Integration
// ══════════════════════════════════════════════

/**
 * POST /api/payments/momo/create
 * Khởi tạo yêu cầu thanh toán MoMo
 * Frontend nhận payUrl và mở browser/deep link
 */
export async function createMomoPaymentRequest(
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

    // Tạo MoMo orderId duy nhất
    const momoOrderId = `LUX-${uuidv4().slice(0, 8).toUpperCase()}-${Date.now()}`;
    const amount = Math.round(Number(booking.totalPrice)); // MoMo yêu cầu integer

    const orderInfo = `LuxStay - ${booking.room.name} - #${bookingId.slice(-6).toUpperCase()}`;

    // Gọi MoMo API
    const momoResult = await createMomoPayment({
      orderId: momoOrderId,
      bookingId,
      amount,
      orderInfo,
    });

    // Lưu MoMo order ID vào booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        momoOrderId,
        paymentMethod: 'MOMO',
      },
    });

    // Tạo bản ghi Payment
    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        method: 'MOMO',
        amount: booking.totalPrice,
        momoOrderId,
        momoPayUrl: momoResult.payUrl,
        status: 'UNPAID',
      },
      update: {
        momoOrderId,
        momoPayUrl: momoResult.payUrl,
        status: 'UNPAID',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Tạo yêu cầu thanh toán MoMo thành công',
      data: {
        payUrl: momoResult.payUrl,
        deeplink: momoResult.deeplink,
        qrCodeUrl: momoResult.qrCodeUrl,
        orderId: momoOrderId,
        amount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payments/momo/callback
 * MoMo IPN (Instant Payment Notification) — MoMo gọi endpoint này sau khi thanh toán
 * KHÔNG cần authentication middleware (MoMo server gọi trực tiếp)
 */
export async function handleMomoCallback(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as MomoCallbackBody;
    const { orderId, resultCode, transId, message, extraData } = body;

    console.log(`[MoMo IPN] orderId=${orderId} resultCode=${resultCode} transId=${transId}`);

    // 1. Xác thực chữ ký từ MoMo (quan trọng — tránh giả mạo)
    if (!verifyMomoCallback(body)) {
      console.error('[MoMo IPN] Invalid signature!');
      res.status(400).json({ success: false, message: 'Chữ ký không hợp lệ' });
      return;
    }

    // 2. Parse bookingId từ extraData
    let bookingId: string | null = null;
    try {
      const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf-8'));
      bookingId = decoded.bookingId;
    } catch {
      console.error('[MoMo IPN] Failed to parse extraData');
    }

    // 3. Cập nhật Payment record
    const paymentStatus = resultCode === 0 ? 'PAID' : 'FAILED';
    const bookingStatus = resultCode === 0 ? 'CONFIRMED' : 'PENDING';

    if (bookingId) {
      await prisma.$transaction(async (tx) => {
        // Cập nhật Payment
        await tx.payment.updateMany({
          where: { momoOrderId: orderId },
          data: {
            status: paymentStatus,
            momoTransId: String(transId),
            momoResultCode: resultCode,
            momoMessage: message,
            paidAt: resultCode === 0 ? new Date() : null,
          },
        });

        // Cập nhật Booking
        await tx.booking.update({
          where: { id: bookingId! },
          data: {
            paymentStatus,
            status: bookingStatus,
            momoTransId: String(transId),
          },
        });
      });

      // Nếu thanh toán thành công, gửi email xác nhận
      if (resultCode === 0) {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { name: true, email: true } },
            room: { select: { name: true } },
          },
        });

        if (booking) {
          const { sendBookingConfirmationEmail } = await import('../services/email.service');
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
      }
    }

    // MoMo expects 200 response
    res.status(200).json({ message: 'OK' });
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
        payment: { select: { momoPayUrl: true, paidAt: true, momoMessage: true } },
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
