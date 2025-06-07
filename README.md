# Sharre! - Mạng Xã Hội Đơn Giản

Sharre! là một mạng xã hội đơn giản được xây dựng với cảm hứng từ Threads, cho phép người dùng kết nối, chia sẻ bài viết và tương tác với nhau. Dự án được phát triển bằng MERN Stack (MongoDB, Express, React, Node.js).

## Thông Tin Dự Án
- **Tên Dự Án**: Sharre!
- **Người Thực Hiện**: Lê Tùng Dương - Sinh viên Kỹ thuật Phần mềm trường Đại học Thủy Lợi
- **Vị Trí**: Fullstack Developer
- **Repo GitHub**: [Sharre! - GitHub](https://github.com/letungduong24/sharring)

## Mô Tả
Sharre! cho phép người dùng tạo tài khoản, đăng nhập, đăng bài, bình luận, thích bài viết, và kết nối với bạn bè. Dự án này hướng đến việc tạo ra một trải nghiệm người dùng đơn giản, nhưng đầy đủ các tính năng cơ bản của một mạng xã hội.

## Các Tính Năng Chính
- Đăng ký, đăng nhập người dùng
- Tạo và chia sẻ bài viết
- Bình luận và thích bài viết
- Theo dõi người dùng khác
- Xem bài viết trên feed

## Cài Đặt và Chạy Ứng Dụng

### 1. Clone repository:
```bash
git clone https://github.com/letungduong24/sharring.git
```

### 2. Cài đặt dependencies:
```bash
# Cài đặt dependencies cho backend
cd backend
npm install

# Cài đặt dependencies cho frontend
cd frontend
npm install
```

### 3. Cấu hình môi trường:
```bash
# Tạo .env cho backend
cd backend
cp .env.example .env

# Tạo .env cho frontend
cd frontend
cp .env.example .env
```
Sau đó thay thế các giá trị cần thiết trong các file .env

### 4. Chạy ứng dụng:
```bash
# Chạy backend
cd backend
npm run dev

# Chạy frontend
cd frontend
npm run dev
```

## Chạy ứng dụng bằng Docker

### 1. Clone repository:
```bash
git clone https://github.com/letungduong24/sharring.git
```

### 2. Cấu hình môi trường:
```bash
# Tạo .env cho backend
cd backend
cp .env.example .env

# Tạo .env cho frontend
cd frontend
cp .env.example .env
```
Sau đó thay thế các giá trị cần thiết trong các file .env

### 3. Chạy ứng dụng:
Yêu cầu máy đã cài đặt Docker và Docker Compose
```bash
# Build Image
docker-compose build

#Chạy
docker-compose up -d
```

## Công Nghệ Sử Dụng
- **Frontend**: React, Zustand, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

