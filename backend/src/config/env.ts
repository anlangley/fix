import dotenv from 'dotenv';
import path from 'path';

// Load .env từ thư mục backend
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ══════════════════════════════════════════════
// ENV CONFIG — Validate at startup
// ══════════════════════════════════════════════

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  // Server
  PORT: parseInt(optional('PORT', '3000'), 10),
  NODE_ENV: optional('NODE_ENV', 'development'),

  // Database
  DATABASE_URL: required('DATABASE_URL'),

  // JWT
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  // Email
  EMAIL_HOST: optional('EMAIL_HOST', 'smtp.gmail.com'),
  EMAIL_PORT: parseInt(optional('EMAIL_PORT', '587'), 10),
  EMAIL_SECURE: optional('EMAIL_SECURE', 'false') === 'true',
  EMAIL_USER: required('EMAIL_USER'),
  EMAIL_PASS: required('EMAIL_PASS'),
  EMAIL_FROM: optional('EMAIL_FROM', 'LuxStay Hotel <no-reply@luxstay.vn>'),

  // MoMo
  MOMO_PARTNER_CODE: optional('MOMO_PARTNER_CODE', 'MOMO'),
  MOMO_ACCESS_KEY: required('MOMO_ACCESS_KEY'),
  MOMO_SECRET_KEY: required('MOMO_SECRET_KEY'),
  MOMO_ENDPOINT: optional(
    'MOMO_ENDPOINT',
    'https://test-payment.momo.vn/v2/gateway/api/create'
  ),
  MOMO_REDIRECT_URL: optional('MOMO_REDIRECT_URL', 'luxstay://payment/result'),
  MOMO_NOTIFY_URL: required('MOMO_NOTIFY_URL'),

  // URLs
  API_BASE_URL: optional('API_BASE_URL', 'http://localhost:3000'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:8081'),
} as const;
