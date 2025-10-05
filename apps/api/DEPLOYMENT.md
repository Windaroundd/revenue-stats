# Restaurant Revenue API - Docker Deployment Guide

## 🚀 Quick Start

### 1. Build và Push Docker Image

```bash
# Di chuyển vào thư mục API
cd apps/api

# Chạy script build (thay your-dockerhub-username bằng username Docker Hub của bạn)
./build.sh your-dockerhub-username

# Hoặc build với tag cụ thể
./build.sh your-dockerhub-username v1.0.0
```

### 2. Deploy trên VPS (Ubuntu 22.04.2)

#### Trên VPS, chạy các lệnh sau:

```bash
# 1. Pull image từ Docker Hub
docker pull your-dockerhub-username/restaurant-revenue-api:latest

# 2. Tạo thư mục cho environment variables
mkdir -p /opt/restaurant-api
cd /opt/restaurant-api

# 3. Tạo file environment (thay thế bằng thông tin thực tế của bạn)
cat > .env << EOF
NODE_ENV=production
PORT=3214
MONGODB_URI=uri
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
EOF

# 4. Chạy container với MongoDB Atlas
docker run -d \
  --name restaurant-api \
  --restart unless-stopped \
  -p 3214:3214 \
  --env-file .env \
  your-dockerhub-username/restaurant-revenue-api:latest

# 5. Kiểm tra logs
docker logs -f restaurant-api
```

## 🔧 Advanced Deployment với Docker Compose

### 1. Tạo file docker-compose.prod.yml trên VPS:

```yaml
version: "3.8"

services:
  api:
    image: your-dockerhub-username/restaurant-revenue-api:latest
    container_name: restaurant-api
    restart: unless-stopped
    ports:
      - "3214:3214"
    environment:
      - NODE_ENV=production
      - PORT=3214
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    healthcheck:
      test:
        [
          "CMD",
          "node",
          "-e",
          "require('http').get('http://localhost:3214/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx reverse proxy (optional)
  nginx:
    image: nginx:alpine
    container_name: restaurant-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
```

### 2. Tạo file .env trên VPS:

```bash
# Thay thế bằng thông tin MongoDB Atlas thực tế của bạn
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourCluster
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Deploy với Docker Compose:

```bash
# Deploy
docker-compose -f docker-compose.prod.yml up -d

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Update image
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Monitoring và Maintenance

### Kiểm tra trạng thái:

```bash
# Kiểm tra container
docker ps

# Kiểm tra logs
docker logs restaurant-api

# Kiểm tra health
curl http://localhost:3214/health

# Xem API documentation
curl http://localhost:3214/api-docs
```

### Update application:

```bash
# Pull image mới
docker pull your-dockerhub-username/restaurant-revenue-api:latest

# Stop container cũ
docker stop restaurant-api
docker rm restaurant-api

# Chạy container mới
docker run -d \
  --name restaurant-api \
  --restart unless-stopped \
  -p 3214:3214 \
  --env-file .env \
  your-dockerhub-username/restaurant-revenue-api:latest
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Sử dụng file `.env` và không commit vào Git
2. **JWT Secret**: Sử dụng secret key mạnh và unique
3. **Database**: Sử dụng MongoDB Atlas với connection string có authentication
4. **Firewall**: Chỉ mở port cần thiết (3214 hoặc 80/443)
5. **SSL/TLS**: Sử dụng reverse proxy với SSL certificate
6. **MongoDB Atlas**: Đã cấu hình với IP whitelist và authentication
7. **Never Hard Code**: Không bao giờ hard code credentials trong source code

## 📊 Health Check

API có endpoint health check tại: `GET /health`

Response:

```json
{
  "status": "ok"
}
```

## 🔗 API Documentation

Sau khi deploy, bạn có thể truy cập API documentation tại:

- `http://your-vps-ip:3214/api-docs`
- `http://your-vps-ip:3214/api-docs.json`

## 🆘 Troubleshooting

### Container không start:

```bash
# Kiểm tra logs
docker logs restaurant-api

# Kiểm tra environment variables
docker exec restaurant-api env
```

### Database connection issues:

```bash
# Test MongoDB connection
docker exec restaurant-api node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
"
```

### Port conflicts:

```bash
# Kiểm tra port đang sử dụng
sudo netstat -tlnp | grep :3214

# Thay đổi port trong docker run
docker run -d --name restaurant-api -p 8080:3214 ...
```
