import { z } from 'zod';

// ══════════════════════════════════════════════
// ROOMS VALIDATORS (Zod)
// ══════════════════════════════════════════════

const amenitySchema = z.object({
  icon: z.string().min(1, 'Icon là bắt buộc'),
  label: z.string().min(1, 'Label là bắt buộc'),
});

export const createRoomSchema = z.object({
  name: z
    .string({ message: 'Tên phòng là bắt buộc' })
    .min(3, 'Tên phòng cần ít nhất 3 ký tự')
    .max(200, 'Tên phòng không được quá 200 ký tự'),

  type: z.enum(['SINGLE', 'DOUBLE', 'SUITE', 'VIP'], {
    message: 'Loại phòng không hợp lệ hoặc bị thiếu'
  }),

  pricePerNight: z
    .number({ message: 'Giá phòng là bắt buộc' })
    .positive('Giá phòng phải lớn hơn 0')
    .max(100_000_000, 'Giá phòng vượt quá giới hạn'),

  location: z
    .string({ message: 'Địa điểm là bắt buộc' })
    .min(2, 'Địa điểm không hợp lệ')
    .max(100),

  description: z
    .string({ message: 'Mô tả là bắt buộc' })
    .min(20, 'Mô tả cần ít nhất 20 ký tự'),

  capacityAdults: z
    .number()
    .int()
    .min(1, 'Sức chứa tối thiểu 1 người')
    .max(20)
    .default(2),

  capacityChildren: z.number().int().min(0).max(10).default(0),

  amenities: z.array(amenitySchema).optional(),

  imageUrls: z.array(z.string().url('URL ảnh không hợp lệ')).optional(),
});

export const updateRoomSchema = createRoomSchema.partial().extend({
  status: z
    .enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
    .optional(),
});

export const roomQuerySchema = z.object({
  type: z.enum(['SINGLE', 'DOUBLE', 'SUITE', 'VIP']).optional(),
  location: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  checkIn: z.string().datetime({ offset: true }).optional()
    .or(z.string().date().optional()),
  checkOut: z.string().datetime({ offset: true }).optional()
    .or(z.string().date().optional()),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
}).refine(
  (data) => {
    if (data.checkIn && data.checkOut) {
      return new Date(data.checkOut) > new Date(data.checkIn);
    }
    return true;
  },
  { message: 'Ngày check-out phải sau ngày check-in', path: ['checkOut'] }
);

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomQueryInput = z.infer<typeof roomQuerySchema>;
