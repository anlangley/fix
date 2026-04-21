import prisma from '../lib/prisma';

export enum NotificationType {
  BOOKING = 'BOOKING',
  SYSTEM = 'SYSTEM',
  PROMOTION = 'PROMOTION',
}

/**
 * Helper để tạo thông báo cho user
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: keyof typeof NotificationType = 'INFO' as any
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    // Không ném lỗi để tránh làm gián đoạn luồng chính (vd: đặt phòng)
    return null;
  }
}
