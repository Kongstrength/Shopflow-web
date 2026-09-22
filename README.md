# ShopFlow Web

Frontend สำหรับระบบจัดการร้านค้า ShopFlow สร้างด้วย Next.js, TypeScript, Tailwind CSS และ shadcn/ui

## เริ่มต้นใช้งาน

```bash
npm install
copy .env.example .env.local
npm run dev
```

เปิด `http://localhost:3000` และตรวจสอบว่า ShopFlow API ทำงานที่ `http://localhost:4000/api`

## Environment variables

- `NEXT_PUBLIC_API_URL` — URL ของ NestJS API
- `NEXT_PUBLIC_COMPANY_ID` — Company UUID ที่ใช้ส่งผ่าน `x-company-id`

## Build

```bash
npm run build
```
