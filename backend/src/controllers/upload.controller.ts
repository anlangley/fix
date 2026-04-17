import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

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
 * Upload nhiều ảnh
 */
export const uploadImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Ép kiểu files về mảng Multer File
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
