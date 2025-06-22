# 🌾 Farm Expense Management API

ระบบจัดการค่าใช้จ่ายในการทำการเกษตร พร้อมฟีเจอร์สแกนใบเสร็จด้วย OCR และระบบจัดการฟาร์ม

## ✨ Features

- 🔐 **Authentication & Authorization** - ระบบล็อกอิน/สมัครสมาชิก พร้อม JWT token
- 👥 **User Management** - จัดการผู้ใช้และสิทธิ์ admin
- 🚜 **Farm Management** - สร้างและจัดการข้อมูลฟาร์ม
- 📄 **Receipt OCR** - สแกนใบเสร็จด้วย Google Cloud Vision API
- 💰 **Expense Tracking** - ติดตามค่าใช้จ่ายแบบแบ่งหมวดหมู่
- 📊 **Expense Analytics** - วิเคราะห์ค่าใช้จ่ายการจัดการและการผลิต
- 🔒 **Admin Panel** - ระบบแบน/ปลดแบนผู้ใช้

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **OCR**: Google Cloud Vision API
- **Image Processing**: Receipt scanning and text extraction

## 📋 Prerequisites

- Node.js (v14 หรือสูงกว่า)
- MySQL database
- Google Cloud Vision API credentials
- npm หรือ yarn

## 🚀 Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd farm-expense-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   แก้ไขไฟล์ `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/farm_expense_db"
   JWT_SECRET="your-super-secret-jwt-key"
   NODE_ENV="development"
   ```

4. **Setup Google Cloud Vision API**
   - สร้าง service account ใน Google Cloud Console
   - ดาวน์โหลด JSON key file
   - วางไฟล์ที่ `./config/google-cloud-key.json`

5. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed expense categories
   node seeds/seed_expense_categories.js
   
   # Create admin user
   node seeds/seed_admin.js
   ```

6. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

## 🎯 API Endpoints

### 🔐 Authentication
```http
POST /auth/register          # สมัครสมาชิก
POST /auth/login            # เข้าสู่ระบบ
GET  /auth/user/profile     # ดูข้อมูลโปรไฟล์
PUT  /auth/user/profile     # แก้ไขโปรไฟล์
GET  /auth/user/            # ดูข้อมูลผู้ใช้ทั้งหมด
```

### 🚜 Farm Management
```http
GET    /farms/              # ดูฟาร์มทั้งหมดของผู้ใช้
POST   /farm/               # สร้างฟาร์มใหม่
DELETE /farm/:id            # ลบฟาร์ม
PUT    /farm/budget         # อัพเดทงบประมาณฟาร์ม
```

### 📄 Receipt Management
```http
POST   /receipts/scan       # สแกนใบเสร็จด้วย OCR
POST   /receipts            # สร้างใบเสร็จใหม่
GET    /receipts            # ดูใบเสร็จตามช่วงเวลา
DELETE /receipts/:id        # ลบใบเสร็จ
```

### 💰 Expense Analytics
```http
GET /farms/:farmId/management-expenses   # ค่าใช้จ่ายการจัดการ
GET /farms/:farmId/production-expenses   # ค่าใช้จ่ายการผลิต
GET /farms/:farmId/expenses             # ค่าใช้จ่ายรวมทั้งหมด
```

### 👑 Admin Routes
```http
GET  /admin/users           # ดูผู้ใช้ทั้งหมด (Admin only)
POST /admin/users/ban       # แบนผู้ใช้ (Admin only)
POST /admin/users/unban     # ปลดแบนผู้ใช้ (Admin only)
```

## 📊 Expense Categories

ระบบแบ่งหมวดหมู่ค่าใช้จ่ายออกเป็น 8 ประเภท:

### 🔧 Management Expenses (1-3)
1. **ค่าอุปกรณ์** - เครื่องมือและอุปกรณ์การเกษตร
2. **ค่าแรง** - ค่าจ้างแรงงาน
3. **ค่าขนส่ง** - ค่าขนส่งสินค้าและวัสดุ

### 🌱 Production Expenses (4-8)
4. **ค่าเมล็ดพันธุ์พืช** - เมล็ดพันธุ์และต้นกล้า
5. **ค่าสารเคมี** - ยาฆ่าแมลงและสารกำจัดศัตรูพืช
6. **ค่าปุ๋ย** - ปุ๋ยทุกชนิด
7. **ค่าน้ำ** - ค่าน้ำสำหรับการเกษตร
8. **ค่าไฟ** - ค่าไฟฟ้า

## 🔒 Authentication

API ใช้ JWT token สำหรับการยืนยันตัวตน:

```javascript
// Header format
Authorization: Bearer <JWT_TOKEN>
```

## 📤 Request Examples

### สมัครสมาชิก
```http
POST /auth/register
Content-Type: application/json

{
  "username": "farmer01",
  "email": "farmer@example.com",
  "password": "Secure123!",
  "age": 35,
  "address": "123 หมู่ 1 ตำบลนาใหญ่ อำเภอเมือง จังหวัดชลบุรี"
}
```

### สร้างฟาร์ม
```http
POST /farm/
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "ไร่ข้าวโพดหวาน",
  "startMonth": "มีนาคม",
  "endMonth": "สิงหาคม"
}
```

### สแกนใบเสร็จ
```http
POST /receipts/scan
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

farmId: 1
receipt: <image-file>
```

## 🛡 Security Features

- ✅ Password hashing ด้วย bcryptjs
- ✅ JWT token authentication
- ✅ Input validation และ sanitization
- ✅ File upload validation (รูปภาพเท่านั้น, ขนาดไม่เกิน 5MB)
- ✅ Admin authorization middleware
- ✅ User ownership validation

## 🚦 Error Handling

API ส่งคืน HTTP status codes ตามมาตรฐาน:

- `200` - สำเร็จ
- `201` - สร้างข้อมูลสำเร็จ
- `400` - ข้อมูลไม่ถูกต้อง
- `401` - ไม่ได้รับการยืนยันตัวตน
- `403` - ไม่มีสิทธิ์เข้าถึง
- `404` - ไม่พบข้อมูล
- `500` - เกิดข้อผิดพลาดที่เซิร์ฟเวอร์

## 🧪 Development

### Run development server
```bash
npm run dev
```

### Database operations
```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Generate new migration
npx prisma migrate dev --name migration-name
```

## 📁 Project Structure

```
├── controllers/          # Business logic
│   ├── admincontroller.js
│   ├── authcontroller.js
│   ├── expensecontroller.js
│   ├── farmcontroller.js
│   └── receiptcontroller.js
├── middleware/           # Authentication & validation
│   ├── admin.js
│   ├── auth.js
│   └── receipt.js
├── routes/              # API routes
│   ├── admin.js
│   ├── auth.js
│   ├── expense.js
│   ├── farm.js
│   └── receipt.js
├── service/             # External services
│   └── ocr.service.js
├── seeds/               # Database seeders
├── uploads/             # File uploads
└── config/              # Configuration files
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Default Admin Account

เมื่อรัน seed แล้ว จะมี admin account ดังนี้:
- **Email**: admin@gmail.com
- **Password**: Az-123456

## 🔮 Future Enhancements

- [ ] Dashboard analytics
- [ ] Export ข้อมูลเป็น Excel/PDF
- [ ] Push notifications
- [ ] Mobile app support
- [ ] ระบบแจ้งเตือนงบประมาณ
- [ ] Multi-language support
- [ ] API rate limiting
