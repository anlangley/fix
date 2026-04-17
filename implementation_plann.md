# Kiến trúc & Thiết kế Hệ thống Hotel Booking (React Native & Expo)

Tài liệu này đề xuất chi tiết kiến trúc của ứng dụng đặt phòng khách sạn được xây dựng bằng React Native (sử dụng Expo Router), tuân thủ các tiêu chuẩn kỹ thuật về phân quyền, bảo mật và tổ chức code chuyên nghiệp hướng đến production.

## 1. Kiến trúc Thư mục (Expo Router gốc)

Dưới đây là một cấu trúc chuyên nghiệp được chia để tách biệt UI logic, Business logic và Services.

```text
app/
├── _layout.tsx                 # Root layout, bọc ứng dụng bằng AuthProvider, QueryClientProvider
├── (auth)/                     # Auth Group (Không có Navigation Tabs)
│   ├── login.tsx               # Màn hình đăng nhập
│   └── register.tsx            # Màn hình đăng ký
├── (tabs)/                     # Tab Group (Dành cho Role USER)
│   ├── _layout.tsx             # Layout Bottom Tabs cho ứng dụng
│   ├── index.tsx               # Trang chủ (Home)
│   ├── rooms/                  # Browse Phòng
│   │   ├── index.tsx           # Danh sách phòng (Có bộ lọc)
│   │   └── [id].tsx            # Chi tiết phòng (Room Detail)
│   ├── booking/                
│   │   ├── index.tsx           # Check-in, Check-out, Số lượng người...
│   │   └── payment.tsx         # Luồng thanh toán an toàn
│   └── history.tsx             # Lịch sử đặt phòng
└── admin/                      # Admin Group (Route bảo vệ nghiêm ngặt)
    ├── _layout.tsx             # Layout Admin (Gatekeeper check Role = ADMIN)
    ├── index.tsx               # Admin Dashboard (Thống kê chung)
    ├── rooms.tsx               # C.R.U.D thông tin phòng
    ├── users.tsx               # Quản lý người dùng
    └── bookings.tsx            # Quản lý tổng đơn đặt phòng hệ thống

components/
├── ui/                         # Các component nguyên thủy: StandardButton, FormInput, Modal, Loader
├── room/                       # Component composite phòng: RoomCard, FiltersBar, ImageCarousel
└── booking/                    # Component luồng đặt form: BookingSummary, PassengerForms

services/
├── api.ts                      # Cấu hình Axios instance & Interceptors (Gắn Token, bắt lỗi chung)
├── auth.ts                     # RESTful hàm auth (login, register)
├── room.ts                     # Hàm fetch danh sách phòng, detail
└── booking.ts                  # Hàm gửi payment / book confirm

contexts/ (hoặc store/ nếu dùng Redux)
└── AuthContext.tsx             # React Context quản lý global state (user profile, token valid, role)

hooks/
├── useAuth.ts                  # Hook tiện ích gọi dữ liệu từ AuthContext nhanh chóng
├── useProtectedRoute.ts        # (Tùy chọn) Chứa logic chuyển hướng auto theo route
└── useFormValidation.ts        # Quản lý validation form

utils/
├── storage.ts                  # Helper module xử lý SecureStore (Mã hóa Token ở native level)
├── validation.ts               # Khai báo Zod Schema / Yup schema dùng chung
├── format.ts                   # Định dạng tiền tệ VND/USD, format Date chuẩn ISO
└── errorHandler.ts             # Function format message lỗi từ phía backend về chuẩn frontend

constants/
├── config.ts                   # Chứa timeout, config pagination size...
└── theme.ts                    # Colors, typography design system

types/
├── index.ts                    # TypeScript interface (User, Room, Booking)
└── api.ts                      # Interface API Responses (ex: { data, message, isSuccess })
```

---

## 2. Giải thích & Luồng điều hướng

### Luồng Đăng Nhập -> Lưu Token -> Phân Quyền
1. Màn hình `app/(auth)/login.tsx` thu thập Email & Password. Sử dụng schema (Zod/Yup) để bắt lỗi input rỗng hay định dạng sai trước khi cho nhấn gửi.
2. Form gọi `apiClient.post('/login')`. Nếu success, backend trả về `JWT_TOKEN` và `USER_PROFILE` (chứa `id, email, role: 'USER' | 'ADMIN'`).
3. App chạy hàm `auth.login()` từ **AuthContext**, lưu `JWT_TOKEN` an toàn xuống Keychain/Keystore (Mobile OS) thông qua thư viện `expo-secure-store`. **Tuyệt đối không lưu vào `AsyncStorage` (lưu dạng plain text, dễ bị hack).**
4. Trạng thái Local của Context (`user`) được update. 
5. Căn cứ theo `user.role`, hệ thống chủ động gọi `router.replace(...)` để đuổi người dùng vào UI thuộc về họ (`/admin` cho admin, `/(tabs)` cho khách đặt phòng).

### Cách xử lý Protect Route & Admin
Bởi vì cấu trúc là File-based Routing (Expo Router), cách bảo vệ tốt nhất là sử dụng một `_layout.tsx` đặt trên đầu của phân vùng nhạy cảm đó (Ví dụ: tại nhánh `admin/_layout.tsx`). Nó sẽ đóng vai trò như một **Middleware React**. 
Hệ thống sẽ render Layout này đầu tiên. Layout sẽ hook vào Context API đọc quyền. Nếu Role != ADMIN -> Nó render `<Redirect href="/(tabs)" />` ngay lập tức, người sử dụng không thể nhìn thấy màn hình con bên trong `admin/*`.

---

## 3. Kiến trúc Bảo Mật (Security Compliance)

**1. Authentication:**
- **Không bao giờ lưu username/password cục bộ**. Cả luồng giao tác chỉ dùng Token Header.
- Token được lưu trữ bằng `SecureStore` chạy trên Hardware encryption layer của iOS hoặc Android Keystore.
- Khi Logout gọi `SecureStore.deleteItemAsync()`, đồng thời reset Context.

**2. Data/API Protection:**
- **Axios Interceptors Response**: Giám sát lỗi server (VD code 401 Unauthorized, 403 Forbidden). Nếu Token bị hết hạn hoặc cố tình bị chỉnh sửa trái phép, tự động đăng xuất và điều hướng user về Screen Đăng nhập. Chống treo app và lộ dữ liệu rác.
- **Axios Interceptors Request**: Tự động ghép nối Header `Authorization: Bearer <TOKEN>` cho mọi request ra ngoài.
- Dữ liệu API key hay Base URL được giấu vào file `.env` root, được truy xuất thông qua `process.env.EXPO_PUBLIC_API_URL`.

**3. Spam Logic (Throttle/Debounce):**
- Nút submit, nút thanh toán được khóa (disable) lập tức khi đang ở trạng thái `isSubmitting` tránh user click nhiều lần tạo spam đơn hàng rác.

---

## 4. Code Mẫu Minh Họa Các Yếu Tố Cốt Lõi

### A. AuthContext - Điểm điều phối User Authentication 
Khởi chạy khi mở app, load lại session nếu người dùng trước đó chưa logout.

```tsx
// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type UserData = { id: string; email: string; role: 'USER' | 'ADMIN' };
type AuthContextType = {
  user: UserData | null;
  isLoading: boolean;
  login: (token: string, user: UserData) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Luồng boot ban đầu: Khôi phục phiên bản đăng nhập 
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('tq_jwt_token');
        const storedUser = await SecureStore.getItemAsync('tq_user_data');
        if (token && storedUser) setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Storage Error:", e);
      }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const login = async (token: string, userData: UserData) => {
    await SecureStore.setItemAsync('tq_jwt_token', token);
    await SecureStore.setItemAsync('tq_user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('tq_jwt_token');
    await SecureStore.deleteItemAsync('tq_user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### B. Màn hình Protect (Admin Layout Gatekeeper)
Quản lý quyền tự động khóa cửa từ chối các kết nối cố tình vào admin nếu không đủ Role.

```tsx
// app/admin/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../hooks/useAuth'; 
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();

  // 1. Chờ khôi phục thông tin từ SecureStore
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. Chặn Request nặc danh
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // 3. Phân quyền cốt lõi
  if (user.role !== 'ADMIN') {
    // Throw error hoặc redirect khách về tab của khách
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

### C. Màn hình Login Tích Hợp Zod & React Hook Form
Đảm bảo mọi validation chạy mượt trên device frontend mà ít hao tài nguyên.

```tsx
// app/(auth)/login.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api';
import { router } from 'expo-router';

// 1. Khai báo Schema (Strict Validation Constraints)
const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải lớn hơn 6 ký tự'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  
  // 2. Tích hợp RHF vs Zod
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // 3. Data đã an toàn để gửi Server
      const res = await apiClient.post('/auth/login', data);
      
      const { token, user } = res.data;
      
      // 4. Lưu JWT và set Global Auth State
      await login(token, user);
      
      // 5. Điều hướng Routing an toàn theo Role
      if(user.role === 'ADMIN') router.replace('/admin');
      else router.replace('/(tabs)');
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Alert.alert("Lỗi Đăng Nhập", "Thông tin tài khoản không chính xác!");
      } else {
        Alert.alert("Lỗi Hệ Thống", "Gặp lỗi bảo mật hoặc server!");
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Booking App Signin</Text>
      
      {/* Field Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 15 }}>
            <TextInput
              placeholder="Email của bạn"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ padding: 12, borderWidth: 1, borderRadius: 8, borderColor: errors.email ? 'red' : '#ddd' }}
              value={value}
              onChangeText={onChange}
            />
            {errors.email && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>}
          </View>
        )}
      />

      {/* Field Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 25 }}>
            <TextInput
              placeholder="Mật khẩu"
              secureTextEntry
              style={{ padding: 12, borderWidth: 1, borderRadius: 8, borderColor: errors.password ? 'red' : '#ddd' }}
              value={value}
              onChangeText={onChange}
            />
            {errors.password && <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>{errors.password.message}</Text>}
          </View>
        )}
      />

      {/* Nút Submit ngăn spam click */}
      <TouchableOpacity 
        disabled={isSubmitting} 
        onPress={handleSubmit(onSubmit)}
        style={{ 
          backgroundColor: isSubmitting ? '#a2c8ff' : '#007AFF', 
          padding: 16, 
          borderRadius: 8, 
          alignItems: 'center' 
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {isSubmitting ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### D. Axios API Interceptor (Trái tim của Security API Layer)
Code này xử lý Tự động nhét Authentication Token qua mọi request, và tự đăng xuất nếu Token vô hiệu.

```ts
// services/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

// Lấy link API từ biến môi trường (không lộ raw string URL)
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.yourdomain.com',
  timeout: 10000,
});

// THÊM TOKEN TỰ ĐỘNG
apiClient.interceptors.request.use(
  async (config) => {
    // Load token native
    const token = await SecureStore.getItemAsync('tq_jwt_token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// XỬ LÝ LỖI GLOBAL KHI SEVER BÁO UNAUTHORIZED
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Ví dụ: Server báo token đã hết hạn (401)
      // -> Ngay lập tức clear dữ liệu offline, và đá ra trang login 
      await SecureStore.deleteItemAsync('tq_jwt_token');
      await SecureStore.deleteItemAsync('tq_user_data');
      
      // router.replace hoạt động mượt của expo
      router.replace('/(auth)/login'); 
    }
    return Promise.reject(error);
  }
);
```

> [!TIP]
> Việc xây dựng ứng dụng với hệ thống chuẩn hóa như trên giúp mã nguồn hoạt động cực kì an toàn vì Token được mã hóa, User Context quản lý State và Axios Middleware xử lý luồng giao tiếp. Cấu trúc thư mục này dễ dàng đưa vào CI/CD hay mở rộng nhiều chức năng mới.
