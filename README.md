# Linh Triều Bình Ca

**Một trò chơi thẻ bài hiện đại được xây dựng với Nuxt 3 và MongoDB**

## Tổng Quan Dự Án

Linh Triều Bình Ca là một game thẻ bài full-stack hiện đại, được xây dựng lại từ đầu với công nghệ web mới nhất. Game sử dụng kiến trúc reactive, không reload trang, mang lại trải nghiệm mượt mà và nhanh chóng.

## Công Nghệ Sử Dụng

- **Framework:** Nuxt 3 (v3.14.0)
- **Database:** MongoDB với Mongoose ODM
- **Database Module:** `nuxt-mongoose`
- **Authentication:** `nuxt-auth-utils`
- **Language:** TypeScript
- **Runtime:** Node.js 20.x

## Tính Năng Chính

### ✅ Đã Hoàn Thành

- **Hệ Thống Database**
  - 3 Mongoose schemas: User, CardTemplate, UserCard
  - Indexes được tối ưu hóa cho performance
  - Virtual fields và methods tiện ích

- **Hệ Thống Thẻ Bài**
  - 11 thẻ bài ban đầu (Common → Legendary)
  - 5 cấp độ hiếm (Common, Uncommon, Rare, Epic, Legendary)
  - 7 hệ nguyên tố (Fire, Water, Earth, Wind, Light, Dark, Neutral)
  - Hệ thống fusion/enhancement

- **Hệ Thống Năng Lượng**
  - Năng lượng tự động hồi (1 điểm/5 phút)
  - Methods tính toán và quản lý năng lượng
  - Không cần background jobs

- **API Endpoints**
  - Authentication: `/api/auth/*` (register, login, logout, session)
  - Card Templates: `/api/cards/templates` (get all cards)
  - User Cards: `/api/user/cards/*` (collection, fuse, deck, lock)
  - Battle System: `/api/battle/*` (start, history)
  - Admin: `/api/admin/seed` (seed database)

### ✅ Mới Hoàn Thành (v2.0)

**Hệ Thống Xác Thực:**
- Đăng ký tài khoản với email/username
- Đăng nhập/đăng xuất
- Quản lý session tự động
- Mã hóa mật khẩu với bcrypt

**Quản Lý Thẻ Bài:**
- Xem bộ sưu tập thẻ bài cá nhân
- Nâng cấp thẻ thông qua fusion
- Quản lý bộ bài (deck builder)
- Khóa/mở khóa thẻ quan trọng

**Hệ Thống Chiến Đấu:**
- PvE: Chiến đấu với AI
- PvP: Chiến đấu với người chơi khác
- Tính toán chiến đấu tự động
- Hệ thống phần thưởng (vàng, kinh nghiệm)
- Lịch sử chiến đấu

**Giao Diện Người Dùng:**
- Form đăng nhập/đăng ký
- Dashboard hiển thị thống kê
- Trình xem bộ sưu tập thẻ
- Công cụ xây dựng bộ bài
- Giao diện chiến đấu

## Cài Đặt và Khởi Chạy

### Yêu Cầu

- Node.js 20.x hoặc cao hơn
- MongoDB (local hoặc cloud)
- npm hoặc yarn

### Bước 1: Clone Repository

```bash
git clone https://github.com/pin705/linh-trieu-binh-ca.git
cd linh-trieu-binh-ca
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

### Bước 3: Cấu Hình Environment

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin MongoDB của bạn:

```env
MONGODB_URI=mongodb://localhost:27017/linh-trieu-binh-ca
AUTH_SECRET=your-secret-key-here
```

### Bước 4: Khởi Động Development Server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000`

### Bước 5: Seed Database (Lần Đầu)

```bash
# Seed database với 11 thẻ bài ban đầu
curl -X POST http://localhost:3000/api/admin/seed

# Hoặc dùng force để reset và seed lại
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

## Cấu Trúc Dự Án

```
linh-trieu-binh-ca/
├── server/
│   ├── models/          # Mongoose schemas
│   │   ├── User.model.ts
│   │   ├── CardTemplate.model.ts
│   │   └── UserCard.model.ts
│   ├── api/             # API endpoints
│   │   ├── admin/
│   │   └── cards/
│   └── utils/           # Server utilities
├── components/          # Vue components (future)
├── pages/              # Nuxt pages (future)
├── app.vue             # Main app component
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies
```

## API Documentation

Xem chi tiết đầy đủ tại [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Quick Examples

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "player1",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "player1",
    "password": "password123"
  }'
```

**Get card templates:**
```bash
curl http://localhost:3000/api/cards/templates
```

**Start a PvE battle:**
```bash
curl -X POST http://localhost:3000/api/battle/start \
  -H "Content-Type: application/json" \
  -d '{"battleType": "pve"}'
```

**Seed database (first time only):**
```bash
curl -X POST http://localhost:3000/api/admin/seed
```

## Thẻ Bài Ban Đầu

Game có 11 thẻ bài với đủ các cấp độ:

| Tên | Độ Hiếm | Nguyên Tố | Tấn Công | Phòng Thủ |
|-----|---------|-----------|----------|-----------|
| Chiến Binh Tân Binh | Common | Neutral | 10 | 8 |
| Cung Thủ Rừng Xanh | Common | Wind | 12 | 6 |
| Phù Thủy Lửa | Common | Fire | 15 | 5 |
| Kiếm Sĩ Thép | Uncommon | Earth | 18 | 15 |
| Đạo Sĩ Băng Giá | Uncommon | Water | 20 | 12 |
| Hiệp Sĩ Rồng | Rare | Fire | 28 | 22 |
| Pháp Sư Giông Bão | Rare | Wind | 32 | 18 |
| Tướng Quân Thần Thánh | Epic | Light | 40 | 35 |
| Ám Sát Bóng Đêm | Epic | Dark | 45 | 25 |
| Thần Rồng Lửa | Legendary | Fire | 60 | 50 |
| Đế Vương Ánh Sáng | Legendary | Light | 55 | 55 |

## Build Production

```bash
# Build ứng dụng
npm run build

# Preview production build
npm run preview
```

## Tài Liệu Chi Tiết

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Kiến trúc chi tiết, game mechanics, và hướng dẫn phát triển
- **[server/models/README.md](./server/models/README.md)** - Documentation về các Mongoose schemas

## Kiến Trúc

### Nguyên Tắc Thiết Kế

1. **API-First:** Toàn bộ game logic ở server-side (`server/api/`)
2. **Reactive UI:** Vue 3 components tự động cập nhật không cần reload
3. **Security:** Tất cả API routes được bảo vệ bằng authentication

### Game Mechanics

**Hệ Thống Năng Lượng:**
- Mỗi người chơi có 50 năng lượng (mặc định)
- Tự động hồi 1 điểm mỗi 5 phút
- Các hành động tiêu tốn năng lượng

**Hệ Thống Fusion:**
- Nâng cấp thẻ bằng cách fusion với thẻ khác
- Thẻ gốc nhận 10% stats của thẻ sacrifice
- Level tăng lên sau mỗi lần fusion

**Hệ Thống Rarity:**
- Common: 1.0x multiplier
- Uncommon: 1.2x multiplier
- Rare: 1.5x multiplier
- Epic: 2.0x multiplier
- Legendary: 3.0x multiplier

## Contributing

Dự án đang trong giai đoạn phát triển. Contributions are welcome!

## License

Xem file [LICENSE](./LICENSE) để biết thêm chi tiết.

## Support

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub.
