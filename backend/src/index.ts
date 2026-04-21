import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import './config/env'; // Load và validate ENV trước tất cả
import { env } from './config/env';
import prisma from './lib/prisma';
import { errorHandler } from './middlewares/validation.middleware';

// ── Import Routes ──────────────────────────────
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/bookings.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/reviews.routes';
import roomsRoutes from './routes/rooms.routes';
import uploadRoutes from './routes/upload.routes';
import favoritesRoutes from './routes/favorites.routes';
import notificationRoutes from './routes/notifications.routes';
import { initJobs } from './jobs/booking.jobs';

// ══════════════════════════════════════════════
// EXPRESS APP SETUP
// ══════════════════════════════════════════════

const app = express();

// ─── Security Headers ─────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      'http://localhost:8081',
      'http://172.20.10.4:8081',
      'http://localhost:19000',
      'http://localhost:19006'
    ],
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100,                  // Tối đa 100 requests / IP / 15 phút
  message: { success: false, message: 'Quá nhiều request, vui lòng thử lại sau.' },
});
app.use('/api/', limiter);

// Giới hạn chặt hơn cho auth endpoints (chống brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Quá nhiều lần thử, vui lòng đợi 15 phút.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsers ─────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static Files (Uploads) ───────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Logger ───────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ── Health Check ──────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'LuxStay Hotel API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── API Routes ────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationRoutes);

// ── 404 Handler ───────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy endpoint này' });
});

// ── Global Error Handler ──────────────────────
app.use(errorHandler);

// ══════════════════════════════════════════════
// START SERVER
// ══════════════════════════════════════════════

async function startServer() {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Run scheduled jobs
    initJobs();

    app.listen(env.PORT, '0.0.0.0', () => {
      console.log('');
      console.log('  ✦ LuxStay Hotel API');
      console.log(`  ➜ Local:        http://localhost:${env.PORT}`);
      console.log(`  ➜ Network:      ${env.API_BASE_URL}`);
      console.log(`  ➜ Environment:  ${env.NODE_ENV}`);
      console.log(`  ➜ Health check: ${env.API_BASE_URL}/health`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

export default app;
