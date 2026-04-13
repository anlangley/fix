# 🏨 Cải Tạo Giao Diện App Đặt Phòng Khách Sạn - Premium UI

## Mục tiêu

Nâng cấp toàn bộ giao diện ứng dụng từ **MVP đơn giản** → **giao diện chuyên nghiệp** như các app đặt phòng thực tế (Booking.com, Agoda, Airbnb). Bổ sung hình ảnh, gradient, animations, rich mock data, và thiết kế premium.

## Phong cách thiết kế

- **Color Palette**: Deep Navy (#1B1F3B) làm primary, Gold (#D4A853) accent, gradient warm tones
- **Typography**: System font weight hierarchy rõ ràng (Bold headings, Regular body)
- **Cards**: Rounded corners, shadow, image-first design
- **Icons**: Ionicons đã có sẵn
- **Images**: Sử dụng ảnh có sẵn trong `assets/images/` (room1.jpg, room2.jpg, room3.jpg, nn1-3.jpg) + ảnh URL từ Unsplash/Picsum cho mock data

---

## Proposed Changes

### 1. Theme System

#### [MODIFY] [theme.ts](file:///d:/CNTT/react/hoc/MyApp/constants/theme.ts)
- Bổ sung color palette premium: primary, secondary, accent, gradient colors
- Thêm spacing, border radius, shadow presets
- Thêm typography sizes

---

### 2. Màn Hình Đăng Nhập / Đăng Ký

#### [MODIFY] [login.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(auth)/login.tsx)
- Background gradient overlay trên hình ảnh khách sạn
- Logo/Brand name lớn phía trên
- Input fields với icon prefix (Ionicons: mail, lock)
- Nút đăng nhập gradient
- Social login buttons (Google, Facebook) - UI only
- Glassmorphism card chứa form

#### [MODIFY] [register.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(auth)/register.tsx)
- Tương tự login nhưng với form đăng ký
- Cùng style hệ thống

---

### 3. Trang Chủ (Home Screen) — Điểm nhấn chính

#### [MODIFY] [index.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/index.tsx)
- **Header**: Avatar + greeting + notification bell icon
- **Search Bar**: Tìm kiếm phòng với icon
- **Banner Carousel**: ScrollView ngang với các banner khuyến mãi (dùng ảnh sẵn có)
- **Danh mục nhanh**: Icons cho loại phòng (Đơn, Đôi, Suite, VIP)
- **Phòng nổi bật**: Cards ngang với ảnh, tên, giá, rating stars
- **Deals đặc biệt**: Section với countdown/badge "HOT"
- Mock data phong phú với 6-8 phòng, rating, location

---

### 4. Danh Sách Phòng

#### [MODIFY] [rooms/index.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/rooms/index.tsx)
- **Filter bar**: Nút lọc (Giá, Loại phòng, Đánh giá) - horizontal scroll
- **Room cards**: Ảnh lớn trên, info dưới, badge "Hot Deal", rating stars, price hiển thị nổi bật
- **Grid/List toggle**
- Mock data 6+ phòng với ảnh đa dạng

#### [MODIFY] [rooms/[id].tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/rooms/[id].tsx)
- **Image gallery**: ScrollView ngang ảnh phòng
- **Room info**: Tên, loại phòng, vị trí
- **Amenities**: Icons grid (WiFi, AC, TV, Minibar, Pool, Gym...)
- **Description**: Mô tả chi tiết
- **Reviews section**: Mock reviews với avatar, tên, rating, comment
- **Price & Book button**: Fixed bottom bar với giá + nút "Đặt Ngay" gradient

---

### 5. Đặt Phòng

#### [MODIFY] [booking/index.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/booking/index.tsx)
- **Room summary card**: Hiện ảnh + tên phòng đã chọn
- **Date picker**: Check-in / Check-out styled inputs
- **Guest count**: Stepper (+/-) cho số khách
- **Special requests**: TextArea
- **Price breakdown**: Chi tiết giá phòng, thuế, tổng cộng
- **Continue button**: Gradient button

#### [MODIFY] [booking/payment.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/booking/payment.tsx)
- **Order summary**: Card tóm tắt đơn
- **Payment methods**: Cards cho MoMo, VNPay, ZaloPay (dùng logo sẵn có), Credit Card
- **Selected payment highlight**
- **Confirm button**: Gradient + icon
- **Success modal**: Animation khi thanh toán thành công

---

### 6. Lịch Sử Đặt Phòng

#### [MODIFY] [history.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/history.tsx)
- **Tab filter**: Tất cả / Đang ở / Hoàn thành / Đã hủy
- **Booking cards**: Ảnh phòng, tên, ngày, status badge (màu sắc), giá
- **Empty state**: Illustration khi chưa có booking
- Mock data 4-5 bookings với các trạng thái khác nhau

---

### 7. Tab Bar & Layout

#### [MODIFY] [_layout.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/_layout.tsx)
- Custom tab bar style: background color, active tint, shadow
- Tab icons lớn hơn, có label
- Thêm tab "Tài khoản" (Profile)

#### [NEW] [profile.tsx](file:///d:/CNTT/react/hoc/MyApp/app/(tabs)/profile.tsx)
- **Avatar + user info**
- **Menu items**: Thông tin cá nhân, Phòng yêu thích, Cài đặt, Hỗ trợ, Đăng xuất
- **Stats**: Số lần đặt phòng, điểm thưởng mock

---

### 8. Admin Dashboard

#### [MODIFY] [admin/index.tsx](file:///d:/CNTT/react/hoc/MyApp/app/admin/index.tsx)
- **Stats cards**: Tổng phòng, Bookings hôm nay, Doanh thu, Users - với icons và colors
- **Quick actions**: Grid buttons đẹp
- **Recent bookings**: Mini list
- Logout button

#### [MODIFY] [admin/rooms.tsx](file:///d:/CNTT/react/hoc/MyApp/app/admin/rooms.tsx)
- **Room list**: Cards với ảnh, tên, trạng thái (Available/Occupied), giá
- **Add room FAB button**
- Mock data

#### [MODIFY] [admin/bookings.tsx](file:///d:/CNTT/react/hoc/MyApp/app/admin/bookings.tsx)
- **Booking list**: Cards với info khách, phòng, ngày, status badge
- **Status filter**
- Mock data

#### [MODIFY] [admin/users.tsx](file:///d:/CNTT/react/hoc/MyApp/app/admin/users.tsx)
- **User list**: Avatar, tên, email, role badge
- Mock data

---

## Cài đặt thêm

Cần cài thêm `expo-linear-gradient` cho gradient effects:

```bash
npx expo install expo-linear-gradient
```

---

## Verification Plan

### Manual Verification
- Chạy `npx expo start --web` hoặc trên thiết bị
- Kiểm tra từng màn hình trông chuyên nghiệp
- Test navigation giữa các screens
- Kiểm tra responsive trên các kích thước màn hình

### Automated Tests
- Kiểm tra TypeScript compile không lỗi
- Kiểm tra app khởi động thành công
