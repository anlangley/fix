import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import prisma from '../lib/prisma';

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Kiểm tra định dạng file
const fileFilter = (_req: Request, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp)'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB cho thoải mái
});

/**
 * Upload nhiều ảnh (Admin)
 */
export const uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as any[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });
      return;
    }

    const imageUrls = files.map(file => `${env.API_BASE_URL}/uploads/${file.filename}`);

    res.status(200).json({
      success: true,
      data: { imageUrls },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload ảnh đại diện (User)
 */
export const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = req.file as any;

    if (!file) {
      res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh đại diện' });
      return;
    }

    const avatarUrl = `${env.API_BASE_URL}/uploads/${file.filename}`;

    // Cập nhật avatarUrl trong DB
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatarUrl },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật ảnh đại diện thành công',
      data: { user, avatarUrl },
    });
  } catch (error) {
    next(error);
  }
};
