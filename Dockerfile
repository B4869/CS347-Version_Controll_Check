# Stage 1: Build Next.js (Static Export)
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Copy package files จากโฟลเดอร์ frontend
COPY frontend/package*.json ./

# 2. Install dependencies
RUN npm ci --legacy-peer-deps

# 3. Copy Source code ทั้งหมดจาก frontend
COPY frontend/ .

# 4. Build (จะสร้างโฟลเดอร์ 'out' เพราะเราตั้งค่า output: 'export' แล้ว)
RUN npm run build

FROM nginx:1.27-alpine

# (Optional) Copy custom nginx config ถ้าคุณสร้างไว้
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files ที่ build แล้วจาก Stage 1 ไปที่ Nginx
# Next.js export จะอยู่ที่ folder 'out' ไม่ใช่ 'dist/spa'
COPY --from=builder /app/out /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]