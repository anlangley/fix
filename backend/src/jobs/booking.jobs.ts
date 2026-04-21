import cron from 'node-cron';
import prisma from '../lib/prisma';

/**
 * Initialize all scheduled jobs
 */
export function initJobs() {
  // Chạy mỗi giờ một lần vào phút thứ 0 (0 * * * *)
  cron.schedule('0 * * * *', async () => {
    console.log('[Job] Đang kiểm tra và tự động giải phóng phòng...');
    await autoCheckOut();
  });

  // Chạy test mỗi 5 phút trong môi trường dev (tùy chọn)
  if (process.env.NODE_ENV === 'development') {
    cron.schedule('*/5 * * * *', async () => {
      console.log('[Job-Dev] Quét nhanh trạng thái booking...');
      await autoCheckOut();
    });
  }
}

/**
 * Tự động chuyển CONFIRMED -> COMPLETED nếu đã quá ngày checkout
 * và giải phóng Room về AVAILABLE nếu không có đơn nào khác đang ở trong phòng đó.
 */
async function autoCheckOut() {
  try {
    const now = new Date();

    // 1. Tìm các booking hết hạn
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkOutDate: { lt: now }
      },
      include: {
        room: true
      }
    });

    if (expiredBookings.length === 0) return;

    console.log(`[Job] Tìm thấy ${expiredBookings.length} booking cần hoàn tất.`);

    // 2. Cập nhật booking sang COMPLETED trong 1 transaction
    await prisma.$transaction(async (tx) => {
      const bookingIds = expiredBookings.map(b => b.id);
      
      await tx.booking.updateMany({
        where: { id: { in: bookingIds } },
        data: { status: 'COMPLETED' }
      });

      // 3. Xử lý trạng thái phòng
      const affectedRoomIds = Array.from(new Set(expiredBookings.map(b => b.roomId)));

      for (const roomId of affectedRoomIds) {
        // Kiểm tra xem phòng này có đơn nào khác đang trong thời gian ở không
        const activeBooking = await tx.booking.findFirst({
          where: {
            roomId,
            status: 'CONFIRMED',
            checkInDate: { lte: now },
            checkOutDate: { gte: now }
          }
        });

        // Nếu không có ai đang ở, giải phóng phòng
        if (!activeBooking) {
          await tx.room.update({
            where: { id: roomId },
            data: { status: 'AVAILABLE' }
          });
          console.log(`[Job] Giải phóng phòng ID: ${roomId}`);
        }
      }
    });

    console.log('[Job] Hoàn tất quét checkout tự động.');
  } catch (error) {
    console.error('[Job Error] Lỗi khi xử lý checkout tự động:', error);
  }
}
