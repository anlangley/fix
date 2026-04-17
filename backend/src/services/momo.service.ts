import crypto from 'crypto';
import axios from 'axios';
import { env } from '../config/env';

// ══════════════════════════════════════════════
// MOMO PAYMENT SERVICE (API v2)
// ══════════════════════════════════════════════

interface MomoCreatePaymentParams {
  orderId: string;       // Unique order ID
  bookingId: string;     // Internal booking reference
  amount: number;        // VND amount (integer)
  orderInfo: string;     // Display info to user
  extraData?: string;    // Extra metadata (base64)
}

interface MomoCreatePaymentResult {
  payUrl: string;
  deeplink: string;
  qrCodeUrl: string;
  orderId: string;
  requestId: string;
  resultCode: number;
  message: string;
}

interface MomoCallbackBody {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  orderInfo: string;
  orderType: string;
  transId: number;
  resultCode: number;
  message: string;
  payType: string;
  responseTime: number;
  extraData: string;
  signature: string;
}

/**
 * Tạo chữ ký HMAC-SHA256 cho MoMo request
 */
function createSignature(rawSignature: string): string {
  return crypto
    .createHmac('sha256', env.MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');
}

/**
 * Tạo yêu cầu thanh toán MoMo
 * Trả về payUrl để redirect user
 */
export async function createMomoPayment(
  params: MomoCreatePaymentParams
): Promise<MomoCreatePaymentResult> {
  const { orderId, bookingId, amount, orderInfo } = params;
  const requestId = `${orderId}-${Date.now()}`;
  const requestType = 'payWithATM';

  // Chế độ MOCK nếu chưa cấu hình Key thật
  if (
    !env.MOMO_ACCESS_KEY ||
    env.MOMO_ACCESS_KEY.startsWith('your_') ||
    !env.MOMO_SECRET_KEY ||
    env.MOMO_SECRET_KEY.startsWith('your_')
  ) {
    console.log('⚠️ [Momo Service] Using MOCK mode (placeholder keys detected)');
    return {
      payUrl: 'https://momo.vn/payment-mock',
      deeplink: 'momo://mock-payment',
      qrCodeUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
      orderId,
      requestId,
      resultCode: 0,
      message: 'MOCK Success (Development only)',
    };
  }

  // Dữ liệu extra (base64 JSON)
  const extraData = Buffer.from(JSON.stringify({ bookingId })).toString('base64');

  // Raw signature string theo docs MoMo v2
  const rawSignature = [
    `accessKey=${env.MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${env.MOMO_NOTIFY_URL}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${env.MOMO_PARTNER_CODE}`,
    `redirectUrl=${env.MOMO_REDIRECT_URL}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join('&');

  const signature = createSignature(rawSignature);

  const body = {
    partnerCode: env.MOMO_PARTNER_CODE,
    partnerName: 'LuxStay Hotel',
    storeId: 'LuxStayHotel',
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl: env.MOMO_REDIRECT_URL,
    ipnUrl: env.MOMO_NOTIFY_URL,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData,
    orderGroupId: '',
    signature,
  };

  const response = await axios.post<MomoCreatePaymentResult>(env.MOMO_ENDPOINT, body, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
  });

  if (response.data.resultCode !== 0) {
    throw new Error(`MoMo error [${response.data.resultCode}]: ${response.data.message}`);
  }

  return response.data;
}

/**
 * Xác thực chữ ký từ MoMo IPN Callback
 * Returns true nếu signature hợp lệ
 */
export function verifyMomoCallback(body: MomoCallbackBody): boolean {
  const {
    partnerCode, orderId, requestId, amount, orderInfo,
    orderType, transId, resultCode, message, payType,
    responseTime, extraData, signature,
  } = body;

  const rawSignature = [
    `accessKey=${env.MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join('&');

  const expectedSignature = createSignature(rawSignature);
  return expectedSignature === signature;
}

export type { MomoCallbackBody, MomoCreatePaymentResult };
