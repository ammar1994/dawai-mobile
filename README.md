# DAWAI — دوائي 📱

تطبيق موبايل للزبون مبني بـ **React Native CLI + TypeScript**

## الهوية البصرية
- الألوان: Deep Rose + Magenta (`#E91E8C`)
- الشعار: DAWAI / دوائي
- الشعار الفرعي: القلب والعلاج

## Backend
```
https://pharmacy-saas-backend.onrender.com/api
```

## هيكل المشروع
```
src/
├── screens/
│   ├── Auth/          ✅ Part 1
│   ├── Home/          ✅ Part 1
│   ├── Pharmacy/      🔜 Part 2 (GPS + خريطة)
│   ├── Orders/        🔜 Part 3 (طلبات + تتبع)
│   ├── Reminders/     🔜 Part 4 (تذكير + Notifications)
│   └── Profile/       🔜 Part 4
├── components/common/ ✅ Button + Input
├── navigation/        ✅ Root + Auth + Tabs
├── services/          ✅ axios + auth
├── store/             ✅ Zustand auth store
├── theme/             ✅ Colors + Typography + Spacing
└── types/             ✅ All types shared with backend
```

## الأجزاء

| الجزء | المحتوى | الحالة |
|-------|---------|--------|
| Part 1 | Splash + Login + Register + هيكل كامل | ✅ مكتمل |
| Part 2 | GPS + خريطة + البحث عن صيدلية | 🔜 |
| Part 3 | نظام الطلبات + تتبع الحالة | 🔜 |
| Part 4 | تذكير الدواء + Push Notifications + Profile | 🔜 |

## تشغيل المشروع
```bash
npm install
# Android
npx react-native run-android
# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## المكتبات الرئيسية
- `@react-navigation` — navigation
- `zustand` — state management
- `axios` — HTTP client
- `react-native-mmkv` — persistent storage (أسرع من AsyncStorage)
- `react-native-linear-gradient` — تدرجات الألوان
- `react-native-vector-icons` — أيقونات
