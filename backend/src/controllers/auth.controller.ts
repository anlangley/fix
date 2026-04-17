import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { signToken } from '../middlewares/auth.middleware';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email.service';
import { env } from '../config/env';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validators/auth.validator';

// ══════════════════════════════════════════════
// AUTH CONTROLLER
// ══════════════════════════════════════════════

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới — gửi email xác thực
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, phone, password }: RegisterInput = req.body;

    // Kiểm tra email đã tồn tại
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.',
      });
      return;
    }

    // Hash password (bcrypt cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Tạo email verify token (UUID + expiry 24h)
    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Tạo user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        emailVerifyToken,
        emailVerifyExpiry,
        isEmailVerified: false,
        role: 'USER',
      },
      select: { id: true, name: true, email: true, role: true },
    });

    // Gửi email xác thực (async, không block response)
    const verifyUrl = `${env.API_BASE_URL}/api/auth/verify-email?token=${emailVerifyToken}`;
    sendVerificationEmail(email, name, verifyUrl).catch((err) =>
      console.error('Email send failed:', err)
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Xác thực email từ link gửi về hộp thư
 */
export async function verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.query as { token: string };

    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() }, // Chưa hết hạn
        isEmailVerified: false,
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Link xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.',
      });
      return;
    }

    // Cập nhật verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });

    // Redirect về app hoặc trả JSON
    res.status(200).json({
      success: true,
      message: '✅ Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/resend-verification
 * Gửi lại email xác thực
 */
export async function resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };

    const user = await prisma.user.findUnique({ where: { email } });

    // Luôn trả success để tránh email enumeration attack
    if (!user || user.isEmailVerified) {
      res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại và chưa xác thực, chúng tôi đã gửi lại link xác thực.',
      });
      return;
    }

    // Cập nhật token mới
    const emailVerifyToken = uuidv4();
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });

    const verifyUrl = `${env.API_BASE_URL}/api/auth/verify-email?token=${emailVerifyToken}`;
    sendVerificationEmail(email, user.name, verifyUrl).catch(console.error);

    res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại và chưa xác thực, chúng tôi đã gửi lại link xác thực.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Đăng nhập — trả JWT token
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password }: LoginInput = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Sai email hoặc password — dùng message chung để tránh enumeration
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác',
      });
      return;
    }

    // Chưa xác thực email
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để kích hoạt tài khoản.',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role as 'USER' | 'ADMIN' });

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatarUrl: user.avatarUrl,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Lấy thông tin user hiện tại (dùng token)
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/forgot-password
 * Gửi email reset mật khẩu
 */
export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email }: ForgotPasswordInput = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Luôn trả thành công (anti-enumeration)
    const genericMsg = 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.';

    if (user) {
      // Tạo mã OTP 6 số
      const resetPasswordToken = Math.floor(100000 + Math.random() * 900000).toString();
      const resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetPasswordExpiry },
      });

      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
      sendPasswordResetEmail(email, user.name, resetPasswordToken).catch(console.error);
    }

    res.status(200).json({ success: true, message: genericMsg });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 * Đặt lại mật khẩu mới
 */
export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password }: ResetPasswordInput = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/change-password
 * Đổi mật khẩu (dành cho user đã đăng nhập)
 */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { oldPassword, newPassword }: ChangePasswordInput = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return;
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
      return;
    }

    // Hash mật khẩu mới
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error) {
    next(error);
  }
}
