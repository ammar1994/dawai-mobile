# 🧭 DAWAI Mobile — المرجع الرئيسي الموحد للنماذج
**تاريخ الإصدار:** 2026-08-07 | **الريبو:** `ammar1994/dawai-mobile`
**Token:** `GITHUB_TOKEN_HERE`
> ⚠️ هذا الملف هو **المرجع الوحيد المعتمد**. قبل أي تعديل، اقرأه كاملاً.
> لا تبدأ أي عمل قبل استيعاب هذا التقرير. التضارب بين النماذج يكلف وقتاً ومالاً.

---

## 📦 Stack التقني المعتمد (لا يُغيَّر بدون موافقة)

| التقنية | الإصدار المعتمد |
|---------|----------------|
| React Native | `0.76.7` |
| React | `18.3.1` |
| TypeScript | `5.5.4` |
| Zustand | `^5.0.3` |
| React Navigation | `v7.x` |
| Axios | `^1.7.2` |
| Notifee | `^7.8.2` |
| BootSplash | `^6.2.4` (بديل splash-screen) |
| Image Picker | `react-native-image-picker ^7.1.2` |
| Fast Image | `@d11/react-native-fast-image ^8.6.3` |

### ❌ مكتبات محظورة نهائياً
- `react-native-splash-screen` ← استخدم `react-native-bootsplash`
- `react-native-fast-image` ← استخدم `@d11/react-native-fast-image`
- `@types/react-native` ← محذوف (مدمج في RN)
- `ignoreDeprecations: "5.0"` في tsconfig ← محذوف

---

## 🗂 هيكل المشروع الكامل

```
dawai-mobile/
├── index.js                          ← RTL forceRTL(true) هنا
├── App.tsx                           ← getStorageReady() + BootSplash
├── android/app/src/main/
│   └── AndroidManifest.xml          ← صلاحيات نظيفة (مراجعة أدناه)
└── src/
    ├── navigation/index.tsx          ← كل الـ navigators هنا
    ├── screens/
    │   ├── Auth/
    │   │   ├── SplashScreen.tsx      ✅ Race condition مُصلح
    │   │   ├── LoginScreen.tsx       ✅
    │   │   ├── RegisterScreen.tsx    ✅
    │   │   └── ForgotPasswordScreen.tsx ✅ endpoint صحيح
    │   ├── Home/
    │   │   └── HomeScreen.tsx        ⚠️ عيب في quickActions (أدناه)
    │   ├── Pharmacy/
    │   │   ├── PharmacyMapScreen.tsx
    │   │   └── PharmacyDetailScreen.tsx
    │   ├── Orders/
    │   │   ├── OrdersListScreen.tsx
    │   │   ├── OrderTrackingScreen.tsx ✅ RTL مُصلح
    │   │   └── NewOrderScreen.tsx    ✅ RTL + Image Picker
    │   ├── Reminders/
    │   │   ├── RemindersScreen.tsx   ✅
    │   │   └── AddReminderModal.tsx  ✅
    │   └── Profile/
    │       └── ProfileScreen.tsx     ✅ RTL + Image Picker
    ├── services/
    │   ├── api.ts                    ✅ Singleton storage + interceptors
    │   ├── auth.service.ts           ✅
    │   ├── notifications.service.ts  ✅ RepeatFrequency.DAILY مُصلح
    │   ├── orders.service.ts         ✅
    │   ├── reminders.service.ts      ✅
    │   └── prescriptions.service.ts  ⚠️ لا يدعم multipart upload بعد
    ├── store/
    │   ├── auth.store.ts             ✅
    │   ├── orders.store.ts           ✅
    │   └── reminders.store.ts        ✅
    ├── components/
    │   └── common/
    │       ├── Button.tsx            ✅
    │       └── Input.tsx             ✅
    ├── types/index.ts                ✅ branch.name مُصلح
    └── theme/index.ts                ✅
```

---

## ✅ ما تم إنجازه (بالترتيب التاريخي)

### المرحلة 1 — الإصلاحات الحرجة ✅
- **SplashScreen.tsx:** حل race condition — `Promise.all([animation, loadSession()])`
- **api.ts:** `storage.init()` تعمل كـ Singleton (`_storageReady`) ينتظر قبل أي طلب
- **notifications.service.ts:** `RepeatFrequency.DAILY` بدل الرقم الثابت `1`
- **ForgotPasswordScreen.tsx:** endpoint صحيح `/mobile/auth/forgot-password`
- **api.ts:** Refresh Token interceptor + طرد تلقائي عند فشله

### المرحلة 2 — الإصلاحات الوظيفية ✅
- **AndroidManifest.xml:** حذف `ACCESS_BACKGROUND_LOCATION`، إضافة `READ_MEDIA_IMAGES` لـ API 33+
- **types/index.ts:** `Order.pharmacyName` + `Order.branch.name` معاً بلا `as any`
- **Endpoints:** كل الـ endpoints تحت `/mobile/` بشكل موحد

### المرحلة 3 — تحديث المكتبات ✅
- `react-native-bootsplash ^6.2.4` بدل `react-native-splash-screen`
- `@d11/react-native-fast-image ^8.6.3` بدل `react-native-fast-image`
- `react-native-image-picker ^7.1.2` مثبتة
- `@types/react-native` محذوف، `typescript: 5.5.4` مضبوط

### المرحلة 4 — React Native 0.76.7 ✅
- `react-native: 0.76.7`، `react: 18.3.1`
- Hermes مفعّل، `targetSdkVersion` محدّث

### المرحلة 5 — RTL + Image Picker ✅
- **index.js:** `I18nManager.forceRTL(true)` قبل أي render
- **ProfileScreen.tsx:** RTL-safe + Image Picker كامل (كاميرا/معرض/URL fallback)
- **NewOrderScreen.tsx:** RTL-safe + Image Picker للوصفة عند وجود Rx item
- **OrderTrackingScreen.tsx:** إصلاح 3 مخالفات RTL

---

## 🔴 العيوب القائمة (يجب إصلاحها بالترتيب)

### عيب #1 — CRITICAL: وصفاتي في HomeScreen تذهب للطلبات بدلاً من الملف الشخصي
**الملف:** `src/screens/Home/HomeScreen.tsx` السطر ~21
```typescript
// ❌ الحالي — خاطئ
{ icon: '📄', label: 'وصفاتي', color: '#8B0A5A', screen: 'Orders' as const },

// ✅ الصحيح
{ icon: '📄', label: 'وصفاتي', color: '#8B0A5A', screen: 'Profile' as const },
```
**التأثير:** المستخدم الذي يضغط "وصفاتي" يذهب لقائمة الطلبات بدلاً من وصفاته الطبية.

---

### عيب #2 — HIGH: prescriptions.service.ts لا يدعم رفع الملفات الفعلي
**الملف:** `src/services/prescriptions.service.ts`
```typescript
// ❌ الحالي — يقبل URL فقط
async upload(imageUrl: string, notes?: string)

// ✅ المطلوب — يدعم URI من الجهاز (multipart/form-data)
async upload(imageUriOrUrl: string, notes?: string)
// إذا كان URI محلي (file:// أو content://) → FormData
// إذا كان URL → JSON عادي
```
**التأثير:** صور الكاميرا/المعرض لا ترفع فعلياً للسيرفر، فقط روابط http.

---

### عيب #3 — HIGH: auth.store.ts لا يحدّث customer في الـ storage بعد تعديل الملف الشخصي
**الملف:** `src/screens/Profile/ProfileScreen.tsx` دالة `handleSaveProfile`
```typescript
// ❌ الحالي — يُحفظ في الباك إند لكن لا يُحدَّث في المتجر المحلي
await api.patch('/mobile/auth/profile', { firstName, lastName, phone });

// ✅ المطلوب — إعادة جلب البيانات وتحديث المتجر
const { data } = await api.patch<ApiResponse<Customer>>('/mobile/auth/profile', {...});
// ثم: useAuthStore.setState({ customer: data.data })
// ثم: storage.set('customer', JSON.stringify(data.data))
```
**التأثير:** تظهر البيانات القديمة بعد التعديل حتى يعيد المستخدم تسجيل الدخول.

---

### عيب #4 — MEDIUM: ForgotPasswordScreen يستخدم ← (LTR) بدلاً من → (RTL)
**الملف:** `src/screens/Auth/ForgotPasswordScreen.tsx`
```typescript
// ❌
<Text style={styles.backIcon}>←</Text>
// ✅
<Text style={styles.backIcon}>→</Text>
```

---

### عيب #5 — MEDIUM: HomeScreen لا تملك pharmacy store
التنقل إلى `Pharmacy` يعمل، لكن لا يوجد `pharmacy.store.ts` — PharmacyMapScreen تجلب مباشرة من api مما يعني لا caching ولا إدارة حالة موحدة.
**المطلوب:** إنشاء `src/store/pharmacy.store.ts` على نمط `orders.store.ts`

---

### عيب #6 — MEDIUM: لا يوجد error boundary
عند crash أي شاشة، يسقط التطبيق بالكامل بلا رسالة للمستخدم.
**المطلوب:** `src/components/common/ErrorBoundary.tsx` يُلفّ `RootNavigator` في `App.tsx`

---

### عيب #7 — LOW: Typography لا يستخدم خطاً عربياً
```typescript
fontRegular: 'System'  // ← يختلف على كل جهاز
// ✅ المطلوب: ربط خط Cairo أو Tajawal
```

---

## 📐 قواعد الكود الصارمة (لكل النماذج)

### RTL — إجباري في كل ملف
```typescript
// ❌ ممنوع
marginLeft, marginRight, paddingLeft, paddingRight
left: X,  right: X  (في position)
borderTopLeftRadius, borderTopRightRadius

// ✅ مطلوب
marginStart, marginEnd, paddingStart, paddingEnd
start: X,  end: X
borderTopStartRadius, borderTopEndRadius
```

### API Endpoints — جميعها تحت `/mobile/`
```typescript
// ✅ Auth
POST   /mobile/auth/login
POST   /mobile/auth/register
POST   /mobile/auth/logout
GET    /mobile/auth/me
PATCH  /mobile/auth/profile
POST   /mobile/auth/forgot-password

// ✅ Orders
POST   /mobile/orders
GET    /mobile/orders
GET    /mobile/orders/:id
PATCH  /mobile/orders/:id/cancel

// ✅ Reminders
GET    /mobile/reminders
POST   /mobile/reminders
PATCH  /mobile/reminders/:id
DELETE /mobile/reminders/:id
POST   /mobile/push-token

// ✅ Prescriptions
GET    /mobile/prescriptions
POST   /mobile/prescriptions
DELETE /mobile/prescriptions/:id
```

### Image Picker — النمط الموحد
```typescript
// استخدم دائماً هذا النمط
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// iOS → ActionSheetIOS
// Android → Alert.alert بخيارين
// دائماً quality: 0.85, maxWidth: 1280
```

### Types — قواعد صارمة
```typescript
// ❌ ممنوع
as any

// ✅ pharmacyName يأتي من API كـ branch.name
// Order type يحتوي على كليهما (مُصلح في types/index.ts)
```

### State Management — Zustand فقط
```typescript
// كل store يتبع هذا النمط:
interface XStore {
  data: Type[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  clearError: () => void;
}
// لا useState للبيانات المشتركة — فقط للـ UI المحلي
```

---

## 🧪 قائمة التحقق قبل commit أي ملف

```
☐ كل الـ margins/paddings تستخدم Start/End بدل Left/Right
☐ لا يوجد `as any` في TypeScript
☐ كل API calls تحت /mobile/ prefix
☐ Image Picker يتبع النمط الموحد
☐ لا import من مجلد `dawai/` أو `admin/`
☐ كل store يملك isLoading + error + clearError
☐ الـ RTL arrow في headers هو → وليس ←
☐ لا استخدام لـ borderTopLeftRadius (استخدم borderTopStartRadius)
```

---

## 🔄 ترتيب العمل المقترح للنماذج القادمة

```
[أولوية 1] إصلاح العيوب #1 و #2 و #3 (أعلاه) — حرجة للمستخدم
[أولوية 2] pharmacy.store.ts + ErrorBoundary
[أولوية 3] multipart upload في prescriptions.service.ts
[أولوية 4] خط عربي (Cairo/Tajawal)
[أولوية 5] Tests — Jest + React Native Testing Library
```

---

## ⚙️ معلومات البيئة

| العنصر | القيمة |
|--------|--------|
| Backend URL | `https://pharmacy-saas-backend.onrender.com/api` |
| GitHub Token | `GITHUB_TOKEN_HERE` |
| الريبو | `ammar1994/dawai-mobile` |
| الفرع | `main` |
| Node.js | `>=18` |
| RTL | مفعّل (`forceRTL: true` في `index.js`) |
| Hermes | مفعّل |

---

**آخر تحديث:** 2026-08-07 | **كتبه:** Claude (بعد قراءة كاملة للمشروع)


---

## ⚠️ تحذيرات حرجة يجب حفظها

### مجلد `dawai/` — كود ميت خطير
```
dawai/         ← Expo 51 + Navigation v6 + Zustand v4 + endpoints مختلفة
               ← /api/v1/mobile (خاطئ)
src/           ← React Native CLI 0.76.7 (الصحيح)
               ← /api/mobile (صحيح)
```
**لا تستورد أي شيء من `dawai/` أو `admin/` أبداً.**
**لا تقرأ package.json الموجود في `dawai/` — له إصدارات مختلفة تماماً.**

---

## 🏗 إعدادات Android (لا تغيّرها)

| الإعداد | القيمة |
|---------|--------|
| minSdkVersion | 24 (Android 7+) |
| targetSdkVersion | 35 |
| compileSdkVersion | 35 |
| buildToolsVersion | 35.0.0 |
| NDK | 27.1.12297006 |
| Kotlin | 2.0.21 |
| Gradle Plugin | 8.7.3 |
| Java | 17 |
| New Architecture | ❌ مُعطَّل (newArchEnabled=false) |
| Hermes | ✅ مفعّل |
| ABI | arm64-v8a, armeabi-v7a, x86, x86_64 |

---

## 🔄 CI/CD — GitHub Actions

**يُشغَّل تلقائياً عند كل push لـ `main`.**
- كل commit يمكن أن يكسر البناء
- افحص `.github/workflows/build-apk.yml` قبل أي تغيير في `android/`
- Vector Icons تُنسخ يدوياً في CI: `node_modules/react-native-vector-icons/Fonts/*.ttf`

**قواعد قبل الـ push:**
```bash
# تحقق من TypeScript
npx tsc --noEmit

# تحقق من Lint
npx eslint . --ext .ts,.tsx
```

---

## 📁 Alias Paths المتاحة (babel + tsconfig)

```typescript
@screens/*    → src/screens/*
@components/* → src/components/*
@navigation/* → src/navigation/*
@services/*   → src/services/*
@store/*      → src/store/*
@theme/*      → src/theme/*
@types/*      → src/types/*
@assets/*     → src/assets/*
// لاحظ: @hooks/* مُعرَّف لكن مجلد src/hooks/ غير موجود بعد
```

---

## 🔗 Backend — معلومات الاتصال

```
Base URL: https://pharmacy-saas-backend.onrender.com/api
Prefix:   /mobile  (كل endpoints تبدأ بـ /mobile/)

مثال كامل: https://pharmacy-saas-backend.onrender.com/api/mobile/auth/login
```

**ملاحظة:** السيرفر على Render.com — قد يكون بطيئاً أول طلب (cold start ~30 ثانية).
الـ timeout في `api.ts` مضبوط على 15000ms.
