import axios from 'axios';
import { router } from 'expo-router';
import { deleteSecureItem, getSecureItem } from '../utils/storage';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

import { Platform } from 'react-native';

const LOCAL_IP = '192.168.1.16'; // IP máy tính của bạn
const PORT = '3000';

// Tự động xác định BASE_URL dựa trên môi trường chạy
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // Nếu là giả lập Android, dùng 10.0.2.2
  // Nếu là điện thoại thật/iOS simulator, dùng LOCAL_IP
  const host = Platform.OS === 'android' && !Platform.isTV ? (
    // Kiểm tra xem có phải giả lập không (đơn giản hóa)
    // Trong thực tế có thể dùng expo-device, ở đây ta ưu tiên IP thật để chạy trên điện thoại
    LOCAL_IP
  ) : LOCAL_IP;

  return `http://${host}:${PORT}/api`;
};

// Lấy link API từ biến môi trường
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

// TỰ ĐỘNG THÊM TOKEN CHO MỌI REQUEST
apiClient.interceptors.request.use(
  async (config) => {
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    const token = await getSecureItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// XỬ LÝ LỖI GLOBAL TỪ SERVER 
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Xử lý mất quyền (401: Unauthorized, Token hết hạn/không hợp lệ)
    if (error.response?.status === 401) {
      await deleteSecureItem(TOKEN_KEY);
      await deleteSecureItem(USER_KEY);

      // Đá về màn hình đăng nhập
      router.replace('/(auth)/login' as any);
    }
    return Promise.reject(error);
  }
);
