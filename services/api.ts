import axios from 'axios';
import { getSecureItem, deleteSecureItem } from '../utils/storage';

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';
import { router } from 'expo-router';

// Lấy link API từ biến môi trường
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://mockapi.example.com/v1',
  timeout: 10000,
});

// TỰ ĐỘNG THÊM TOKEN CHO MỌI REQUEST
apiClient.interceptors.request.use(
  async (config) => {
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
