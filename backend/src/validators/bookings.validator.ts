import { z } from 'zod';

// ══════════════════════════════════════════════
// BOOKINGS VALIDATORS (Zod)
// ══════════════════════════════════════════════

export const createBookingSchema = z
  .object({
    roomId: z.string({ message: 'ID phòng là bắt buộc' }).uuid('ID phòng không hợp lệ'),

    checkInDate: z
      .string({ message: 'Ngày nhận phòng là bắt buộc' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày nhận phòng phải có định dạng YYYY-MM-DD')
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Ngày nhận phòng phải từ hôm nay trở đi'),

    checkOutDate: z
      .string({ message: 'Ngày trả phòng là bắt buộc' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày trả phòng phải có định dạng YYYY-MM-DD'),

    guestsCount: z
      .number({ message: 'Số lượng khách là bắt buộc' })
      .int('Số lượng khách phải là số nguyên')
      .min(1, 'Tối thiểu 1 khách')
      .max(20, 'Tối đa 20 khách'),

    roomsCount: z
      .number()
      .int()
      .min(1, 'Tối thiểu 1 phòng')
      .max(5, 'Tối đa 5 phòng')
      .default(1),

    specialRequest: z
      .string()
      .max(500, 'Yêu cầu đặc biệt không được quá 500 ký tự')
      .optional(),

    paymentMethod: z.enum(['MOMO', 'VNPAY', 'ZALOPAY', 'CARD', 'CASH', 'VIETQR']).optional(),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      message: 'Ngày trả phòng phải sau ngày nhận phòng',
      path: ['checkOutDate'],
    }
  )
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      const diffDays = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays <= 30;
    },
    {
      message: 'Không được đặt phòng quá 30 đêm liên tiếp',
      path: ['checkOutDate'],
    }
  );

export const updateBookingStatusSchema = z.object({
  status: z.enum(['AWAITING_PAYMENT', 'AWAITING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING'], {
    message: 'Trạng thái không hợp lệ hoặc bị thiếu'
  }),
});

export const bookingQuerySchema = z.object({
  status: z.enum(['AWAITING_PAYMENT', 'AWAITING_CONFIRMATION', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  userId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type BookingQueryInput = z.infer<typeof bookingQuerySchema>;
