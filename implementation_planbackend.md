# Kế Hoạch Hệ Thống Cơ Sở Dữ Liệu & Backend

Dựa trên việc phân tích giao diện UI (Mock Data, components, luồng điều hướng) của dự án, dưới đây là phân tích chi tiết về luồng nghiệp vụ, cũng như kế hoạch thiết kế Cơ sở dữ liệu và Backend cho ứng dụng Khách sạn.

## 1. Phân Tích Luồng Nghiệp Vụ (Business Flow)

### 1.1 Khách hàng (User App)
- **Xác thực (Authentication):** Đăng nhập, Đăng ký bằng Email/Password (có thể thêm OAuth sau). Màn hình `(auth)/login.tsx` và `(auth)/register.tsx`. Context `useAuth()` đóng vai trò lưu trữ token và thông tin User hiện tại.
- **Trang chủ & Tìm kiếm (Home):** Khám phá các banner khuyến mãi, danh mục phòng (Phòng đơn, Phòng đôi, Suite, VIP), phòng nổi bật (Featured Rooms) và các ưu đãi (Deals). `(tabs)/index.tsx`
- **Danh sách & Chi tiết Phòng (Rooms):** Xem danh sách tất cả phòng `(tabs)/rooms/index.tsx`, và bấm vào xem chi tiết trang thiết bị, thư viện ảnh (gallery slider), mô tả, đánh giá bình luận (reviews) tại `(tabs)/rooms/[id].tsx`.
- **Đặt phòng (Booking):**
  - Nhập thông tin: Ngày nhận phòng, ngày trả phòng (check-in/check-out), số lượng khách, số lượng phòng, yêu cầu đặc biệt `(tabs)/booking/index.tsx`.
  - Tính toán chi phí: Tính tổng theo số đêm + Thuế/Phí dịch vụ.
  - Thanh toán: Chuyển qua màn hình `(tabs)/booking/payment.tsx` để xác nhận thanh toán/chọn phương thức.
- **Quản lý cá nhân:** Xem lịch sử đặt phòng `(tabs)/history.tsx` và Quản lý tài khoản `(tabs)/profile.tsx`.

### 1.2 Quản trị viên (Admin App)
Lưu ý: Màn hình Admin yêu cầu quyền `role: 'admin'`.
- **Quản lý Đặt phòng (Bookings):** `admin/bookings.tsx` Xem danh sách Booking theo trạng thái (Tất cả, Xác nhận, Chờ duyệt, Đã hủy). Có chức năng "Duyệt" (Approve) hoặc "Từ chối" (Reject) các booking đang chờ.
- **Quản lý Phòng (Rooms):** `admin/rooms.tsx` Thêm/Sửa/Xóa phòng, cập nhật hình ảnh, giá cả, và tiện nghi.
- **Quản lý Người dùng:** `admin/users.tsx` Xem danh sách khách hàng.

---

## 2. Đề Xuất Cấu Trúc Cơ Sở Dữ Liệu

> [!TIP]
> **Hệ quản trị CSDL đề xuất:** **PostgreSQL** (kết hợp ORM như Prisma hoặc TypeORM) nhờ khả năng biểu diễn quan hệ mạnh mẽ, rất phù hợp với nghiệp vụ đặt phòng (tránh trùng lặp, đảm bảo tính toàn vẹn dữ liệu). Hoặc **MongoDB** nếu muốn tập trung tốc độ phát triển.

Dưới đây là thiết kế các Bảng/Collection chính:

### Bảng `Users`
- `id`: UUID (PK)
- `name`: String
- `email`: String (Unique)
- `password_hash`: String
- `phone`: String (Nullable)
- `avatar_url`: String (Nullable)
- `role`: Enum ('user', 'admin') (Default: 'user')
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Bảng `Rooms` (Phòng / Loại Phòng)
- `id`: UUID (PK)
- `name`: String (VD: "Phòng Deluxe Ocean View")
- `type`: Enum ('Phòng Đơn', 'Phòng Đôi', 'Suite', 'VIP')
- `price_per_night`: Decimal
- `location`: String (VD: "Đà Nẵng", "Hà Nội")
- `description`: Text
- `rating`: Decimal (Tính trung bình từ đánh giá)
- `capacity_adults`: Int
- `capacity_children`: Int
- `status`: Enum ('available', 'maintenance', 'out_of_service')
- `created_at`: Timestamp

### Bảng `RoomImages` (Hình ảnh phòng - Quan hệ 1-N với Rooms)
- `id`: UUID (PK)
- `room_id`: UUID (FK -> Rooms.id)
- `url`: String

### Bảng `Amenities` (Tiện nghi - Quan hệ N-N hoặc Dạng JSON lưu trong bảng Rooms)
- _Nếu N-N_: Tạo bảng `Amenities` (id, icon, label) cùng bảng trung gian `RoomAmenities`.
- _Cách đơn giản (khuyên dùng lúc đầu)_: Lưu dưới dạng chuỗi JSON `[{icon, label}]` trong bảng `Rooms`.

### Bảng `Bookings` (Đơn đặt phòng)
- `id`: UUID (PK)
- `user_id`: UUID (FK -> Users.id)
- `room_id`: UUID (FK -> Rooms.id)
- `check_in_date`: Date
- `check_out_date`: Date
- `night_count`: Int
- `guests_count`: Int
- `rooms_count`: Int
- `special_request`: Text (Nullable)
- `subtotal`: Decimal
- `tax`: Decimal
- `total_price`: Decimal
- `status`: Enum ('pending', 'confirmed', 'cancelled', 'completed')
- `payment_status`: Enum ('unpaid', 'paid', 'failed', 'refunded')
- `created_at`: Timestamp

### Bảng `Reviews` (Đánh giá)
- `id`: UUID (PK)
- `user_id`: UUID (FK -> Users.id)
- `room_id`: UUID (FK -> Rooms.id)
- `rating`: Int (1-5)
- `comment`: Text
- `created_at`: Timestamp

---

## 3. Kế Hoạch Xây Dựng Backend (API)

> [!IMPORTANT]
> Lựa chọn Tech Stack: **Node.js + Express.js + Prisma ORM** (TypeScript)
> Stack này cho phép tận dụng chung hệ sinh thái TypeScript với Frontend (React Native/Expo), mã nguồn dễ đọc bảo trì.

### 3.1. Các Endpoints API Cần Thiết

**Authentication (`/api/auth`)**
- `POST /login`: Xử lý đăng nhập, trả về JWT Token.
- `POST /register`: Tạo tài khoản mới.
- `GET /me`: Lấy thông tin user hiện tại (Dùng Token).

**Rooms (`/api/rooms`)**
- `GET /`: Lấy danh sách phòng (Có query param để filter: category, giá, vị trí).
- `GET /:id`: Lấy thông tin chi tiết của 1 phòng (kèm Images và Amenities).
- `POST /` *(Admin)*: Tạo phòng mới.
- `PUT /:id` *(Admin)*: Cập nhật phòng.
- `DELETE /:id` *(Admin)*: Xóa/ẩn phòng.

**Bookings (`/api/bookings`)**
- `POST /`: Tạo đặt phòng (truyền ID phòng, check-in, check-out, tính toán giá trị tại server để chống gian lận).
- `GET /my-bookings`: Lấy danh sách booking của user đang đăng nhập.
- `GET /` *(Admin)*: Lấy danh sách toàn bộ booking. Có filter theo status (`?status=pending`).
- `PUT /:id/status` *(Admin)*: Cập nhật status của booking (Duyệt/Từ chối).
- `PUT /:id/cancel`: User hủy booking.

**Reviews (`/api/reviews`)**
- `GET /:roomId`: Lấy các đánh giá của 1 phòng.
- `POST /`: Tạo đánh giá mới (Chỉ lấy những user đã booking và status='completed').

### 3.2. Cấu Trúc Thư Mục Backend
Một source code tham khảo nếu khởi tạo Backend Node.js:
```text
/backend
├── prisma/             # Schema CSDL (Prisma schema)
├── src/
│   ├── controllers/    # Xử lý logic API (Auth, Rooms, Bookings)
│   ├── middlewares/    # Middleware xác thực JWT, Phân quyền Admin
│   ├── routes/         # Khai báo đường dẫn API
│   ├── services/       # Các file xử lý logic nghiệp vụ, tính giá phòng
│   └── index.ts        # File entry khởi chạy Express server
├── .env                # Lưu cấu hình CSDL, JWT Secret
└── package.json
```

## User Review Required

Xin hãy xem xét các thiết kế trên:
1. **Lựa chọn Cơ sở dữ liệu:** Bạn có muốn dùng PostgreSQL + Prisma hay bạn thích dùng các giải pháp Cloud tự động như Supabase/Firebase Auth để tăng tốc độ phát triển không cần setup Server?
2. **Luồng thanh toán:** Hiện tại payment mới chỉ thiết kế lưu ở mức `payment_status`. Trong tương lai bạn có ý định tích hợp cổng thanh toán thật như Momo, VNPay hay Stripe không?

Vui lòng xác nhận kiến trúc này đi đúng hướng dự án của bạn để chúng ta có thể chuyển sang bước Code hoặc setup Hệ Server.
