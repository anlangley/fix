import nodemailer from 'nodemailer';
import { env } from '../config/env';

// ══════════════════════════════════════════════
// EMAIL SERVICE — Nodemailer
// ══════════════════════════════════════════════

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

// Verify connection on startup (non-blocking)
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ─── HTML Email Templates ──────────────────────

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LuxStay Hotel</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1B1F3B 0%, #2D3561 100%); padding: 32px 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; color: #F59E0B; letter-spacing: 2px; }
    .logo-sub { font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 1px; margin-top: 4px; }
    .body { padding: 40px; }
    .title { font-size: 22px; font-weight: 700; color: #1B1F3B; margin-bottom: 12px; }
    .text { font-size: 15px; color: #6B7280; line-height: 1.6; margin-bottom: 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #F59E0B, #D97706); color: #fff; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; text-decoration: none; margin: 20px 0; }
    .code-box { background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1B1F3B; }
    .footer { background: #F9FAFB; padding: 24px 40px; text-align: center; font-size: 13px; color: #9CA3AF; border-top: 1px solid #E5E7EB; }
    .highlight { color: #1B1F3B; font-weight: 600; }
    .warning { font-size: 13px; color: #9CA3AF; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">✦ LuxStay</div>
      <div class="logo-sub">KHÁCH SẠN SANG TRỌNG</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© 2026 LuxStay Hotel. Mọi quyền được bảo lưu.</p>
      <p>Bạn nhận được email này vì đã đăng ký tài khoản tại LuxStay.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Send Functions ────────────────────────────

/**
 * Gửi email xác thực tài khoản
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<void> {
  const html = baseTemplate(`
    <p class="title">Xác thực tài khoản của bạn 📧</p>
    <p class="text">Xin chào <span class="highlight">${name}</span>,</p>
    <p class="text">Chào mừng bạn đến với <strong>LuxStay Hotel</strong>! Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email và kích hoạt tài khoản của bạn.</p>
    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">✓ Xác Thực Email Ngay</a>
    </div>
    <p class="warning">⏰ Link xác thực sẽ hết hạn sau <strong>24 giờ</strong>.</p>
    <p class="warning">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
  `);

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: '✦ LuxStay — Xác thực tài khoản của bạn',
    html,
  });
}

/**
 * Gửi email đặt lại mật khẩu
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const html = baseTemplate(`
    <p class="title">Đặt lại mật khẩu 🔐</p>
    <p class="text">Xin chào <span class="highlight">${name}</span>,</p>
    <p class="text">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã xác thực bên dưới để hoàn tất quá trình:</p>
    <div class="code-box">
      <div style="font-size: 13px; color: #6B7280; margin-bottom: 8px;">MÃ XÁC THỰC</div>
      <div class="code">${token}</div>
    </div>
    <p class="text">Nhập mã này vào ứng dụng để đặt lại mật khẩu của bạn.</p>
    <p class="warning">⏰ Mã xác thực sẽ hết hạn sau <strong>1 giờ</strong>.</p>
    <p class="warning">Nếu bạn không yêu cầu, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
  `);

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: '✦ LuxStay — Yêu cầu đặt lại mật khẩu',
    html,
  });
}

/**
 * Gửi email xác nhận đặt phòng thành công
 */
export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  booking: {
    id: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalPrice: string;
    guests: number;
  }
): Promise<void> {
  const html = baseTemplate(`
    <p class="title">Đặt phòng thành công! 🎉</p>
    <p class="text">Xin chào <span class="highlight">${name}</span>,</p>
    <p class="text">Đặt phòng của bạn đã được xác nhận. Dưới đây là thông tin chi tiết:</p>
    <div class="code-box">
      <div style="font-size: 13px; color: #6B7280; margin-bottom: 8px;">MÃ ĐẶT PHÒNG</div>
      <div class="code">#${booking.id.slice(-8).toUpperCase()}</div>
    </div>
    <table style="width:100%; border-collapse:collapse; margin-top: 16px;">
      <tr><td style="padding: 10px 0; color: #6B7280; width: 50%;">Phòng</td><td style="font-weight:600; color: #1B1F3B;">${booking.roomName}</td></tr>
      <tr><td style="padding: 10px 0; color: #6B7280; border-top:1px solid #F3F4F6;">Nhận phòng</td><td style="font-weight:600; color: #1B1F3B; border-top:1px solid #F3F4F6;">${booking.checkIn} (14:00)</td></tr>
      <tr><td style="padding: 10px 0; color: #6B7280; border-top:1px solid #F3F4F6;">Trả phòng</td><td style="font-weight:600; color: #1B1F3B; border-top:1px solid #F3F4F6;">${booking.checkOut} (12:00)</td></tr>
      <tr><td style="padding: 10px 0; color: #6B7280; border-top:1px solid #F3F4F6;">Số khách</td><td style="font-weight:600; color: #1B1F3B; border-top:1px solid #F3F4F6;">${booking.guests} người</td></tr>
      <tr><td style="padding: 10px 0; color: #6B7280; border-top:1px solid #F3F4F6; font-weight:700;">Tổng thanh toán</td><td style="color: #F59E0B; font-weight:800; font-size: 18px; border-top:1px solid #F3F4F6;">${booking.totalPrice}đ</td></tr>
    </table>
    <p class="text" style="margin-top: 24px;">Cảm ơn bạn đã tin tưởng lựa chọn LuxStay! Chúc bạn có kỳ nghỉ tuyệt vời 🏨</p>
  `);

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `✦ LuxStay — Xác nhận đặt phòng #${booking.id.slice(-8).toUpperCase()}`,
    html,
  });
}
