import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../lib/prisma';

// ══════════════════════════════════════════════
// AUTH MIDDLEWARE — JWT Verification
// ══════════════════════════════════════════════

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Xác thực JWT token từ Authorization header
 * Gán req.user nếu hợp lệ
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Xác thực thất bại: Thiếu token',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      });
      return;
    }

    // Kiểm tra user còn tồn tại trong DB không
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isEmailVerified: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Tài khoản không còn tồn tại',
      });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: 'Vui lòng xác thực email trước khi thực hiện thao tác này',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware chỉ dành cho Admin
 * Phải dùng SAU authenticate
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối: Yêu cầu quyền Admin',
    });
    return;
  }
  next();
}

/**
 * Helper tạo JWT token
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}
