import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodObject } from 'zod';

/**
 * Validate request body, query, params với Zod schema
 * Trả về 400 nếu data không hợp lệ với danh sách lỗi chi tiết
 */
export function validate(schema: ZodObject<any, any>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.slice(1).join('.'), // Bỏ prefix 'body.', 'query.' etc.
          message: e.message,
        }));

        console.log('❌ Validation Error:', errors);
        res.status(400).json({
          success: false,
          message: errors[0].message || 'Dữ liệu không hợp lệ',
          errors,
        });
        return;
      }
      next(error);
    }
  };
}

// ══════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ══════════════════════════════════════════════

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] Error:`, err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'field';
    res.status(409).json({
      success: false,
      message: `${field} đã tồn tại trong hệ thống`,
    });
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Không tìm thấy dữ liệu',
    });
    return;
  }

  // Default
  res.status(err.status ?? 500).json({
    success: false,
    message: err.message ?? 'Lỗi hệ thống, vui lòng thử lại sau',
  });
}
