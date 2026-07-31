# DAWAI — دوائي 📱
**صيدليتك في جيبك**

تطبيق Expo (React Native) للزبون — مبني بالكامل وجاهز للتشغيل.

## البدء السريع

```bash
cd dawai
npm install
npx expo start
```

افتح Expo Go على هاتفك وامسح الـ QR.

## هيكل المشروع

```
src/
├── api/
│   ├── client.ts       ← axios + token interceptor + refresh
│   └── services.ts     ← auth / pharmacies / orders / reminders / prescriptions
├── components/ui/
│   ├── Button.tsx      ← 3 variants: primary / outline / ghost
│   ├── Input.tsx       ← مع icon + password toggle
│   ├── Card.tsx        ← مع glow effect
│   ├── Badge.tsx       ← status badges
│   ├── Screen.tsx      ← SafeAreaView + scroll + keyboard
│   └── Loader.tsx
├── constants/
│   └── config.ts       ← COLORS / FONTS / SPACING / API_URL
├── navigation/
│   ├── AppNavigator.tsx  ← Bottom tabs + stack
│   └── AuthNavigator.tsx ← Login / Register
├── screens/
│   ├── auth/           ← Login + Register
│   ├── home/           ← Home dashboard
│   ├── pharmacies/     ← GPS + nearby list
│   ├── orders/         ← List + Detail + New + Tracking
│   ├── reminders/      ← List + New reminder
│   ├── prescriptions/  ← Upload + archive
│   └── profile/        ← Edit profile + settings
└── store/
    └── auth.store.ts   ← Zustand + SecureStore
```

## Backend API

```
Base: https://pharmacy-saas-backend.onrender.com/api/v1/mobile

POST /auth/register    ← إنشاء حساب
POST /auth/login       ← تسجيل دخول
POST /auth/refresh     ← تجديد token
GET  /auth/me          ← بيانات المستخدم
PATCH /auth/profile    ← تعديل البيانات

GET  /pharmacies/nearby?lat=&lng=&radius=  ← صيدليات قريبة (بدون auth)

POST /orders           ← طلب جديد
GET  /orders           ← قائمة الطلبات
GET  /orders/:id       ← تفاصيل + تتبع
PATCH /orders/:id/cancel ← إلغاء

POST /reminders        ← تذكير جديد
GET  /reminders        ← قائمة التذكيرات
PATCH /reminders/:id   ← تعديل (isActive, times...)
DELETE /reminders/:id  ← حذف

POST /prescriptions    ← رفع وصفة
GET  /prescriptions    ← أرشيف الوصفات
DELETE /prescriptions/:id

POST /push-token       ← حفظ push notification token
```

## المكتبات الرئيسية
- **Expo SDK 51** — managed workflow
- **React Navigation 6** — stack + bottom tabs
- **Zustand** — state management
- **Expo SecureStore** — token storage
- **Expo Location** — GPS
- **Expo Image Picker** — camera / gallery
- **Expo Notifications** — push notifications
- **Axios** — HTTP مع token interceptor تلقائي

## Assets المطلوبة
ضع في مجلد `assets/`:
- `icon.png` (1024×1024)
- `splash.png` (1284×2778)
- `adaptive-icon.png` (1024×1024)

الألوان: Primary `#E91E8C` / Background `#0D0114`
