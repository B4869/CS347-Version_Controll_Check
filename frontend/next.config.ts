import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // บรรทัดนี้สำคัญมาก! ถ้าไม่มี มันจะไม่สร้างโฟลเดอร์ out
  output: 'export', 
  
  // Optional: ถ้า build แล้วติดเรื่อง Image Optimization ให้เปิดบรรทัดล่างนี้ด้วย
  // images: { unoptimized: true } 
};

export default nextConfig;