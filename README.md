# Hệ Thống Quản Lý Rạp Chiếu Phim

## Cài đặt môi trường

1. Tạo môi trường ảo:
```bash
python -m venv venv
```

2. Kích hoạt môi trường ảo:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Cài đặt các dependencies:
```bash
pip install -r requirements.txt
```

## Cấu trúc dự án

```
cinema_project/
├── apps/
│   ├── accounts/          # Quản lý người dùng
│   ├── movies/           # Quản lý phim
│   ├── bookings/         # Quản lý đặt vé
│   └── core/             # Các chức năng chung
├── config/               # Cấu hình dự án
├── static/              # File tĩnh
├── templates/           # Templates HTML
└── media/              # File media
```

## Chạy dự án

1. Tạo database:
```bash
python manage.py migrate
```

2. Tạo superuser:
```bash
python manage.py createsuperuser
```

3. Chạy server:
```bash
python manage.py runserver
```

## Các chức năng chính

1. Quản lý phim
   - Thêm, sửa, xóa phim
   - Quản lý lịch chiếu
   - Quản lý thể loại

2. Quản lý đặt vé
   - Đặt vé online
   - Chọn ghế
   - Thanh toán

3. Quản lý người dùng
   - Đăng ký/Đăng nhập
   - Quản lý thông tin cá nhân
   - Lịch sử đặt vé

4. Admin Panel
   - Quản lý toàn bộ hệ thống
   - Thống kê doanh thu
   - Quản lý người dùng 