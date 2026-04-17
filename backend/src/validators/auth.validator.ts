import { z } from 'zod';

// ══════════════════════════════════════════════
// AUTH VALIDATORS (Zod — Server-side)
// ══════════════════════════════════════════════

/**
 * Đăng ký — validate tất cả trường bắt buộc
 * Bao gồm: tên, email, phone (tùy chọn), mật khẩu mạnh, xác nhận mật khẩu
 */
export const registerSchema = z
  .object({
    name: z
      .string({ message: 'Tên là bắt buộc' })
      .min(2, 'Tên cần ít nhất 2 ký tự')
      .max(100, 'Tên không được quá 100 ký tự')
      .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),

    email: z
      .string({ message: 'Email là bắt buộc' })
      .min(1, 'Vui lòng nhập Email')
      .email('Email không đúng định dạng')
      .max(200, 'Email không được quá 200 ký tự')
      .toLowerCase(),

    phone: z
      .string()
      .regex(/^(0[3|5|7|8|9])[0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)')
      .optional()
      .or(z.literal('')),

    password: z
      .string({ message: 'Mật khẩu là bắt buộc' })
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(72, 'Mật khẩu quá dài')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),

    confirmPassword: z.string().optional(),
  })
  .refine((data) => {
    if (data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

/**
 * Đăng nhập
 */
export const loginSchema = z.object({
  email: z
    .string({ message: 'Email là bắt buộc' })
    .min(1, 'Vui lòng nhập Email')
    .email('Email không đúng định dạng')
    .toLowerCase(),

  password: z
    .string({ message: 'Mật khẩu là bắt buộc' })
    .min(1, 'Vui lòng nhập mật khẩu'),
});

/**
 * Verify email token
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
});

/**
 * Yêu cầu reset mật khẩu
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: 'Email là bắt buộc' })
    .email('Email không đúng định dạng')
    .toLowerCase(),
});

/**
 * Đặt lại mật khẩu mới
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

/**
 * Đổi mật khẩu (khi đã đăng nhập)
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
