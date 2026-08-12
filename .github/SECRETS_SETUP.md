# إعداد GitHub Secrets للبناء التلقائي

## الخطوات (من الجوال)

### 1. ارفع المشروع على GitHub
- أنشئ Repo جديد على github.com
- ارفع محتوى مجلد `dawai_complete` كاملاً

### 2. أضف الـ Secrets
اذهب لـ: **Settings → Secrets and variables → Actions → New repository secret**

#### Secret 1: GOOGLE_SERVICES_JSON
- الاسم: `GOOGLE_SERVICES_JSON`
- القيمة: افتح ملف `google-services.json` من Firebase وانسخ محتواه كاملاً

#### Secret 2: MAPS_API_KEY  
- الاسم: `MAPS_API_KEY`
- القيمة: مفتاح Google Maps API (AIzaSy...)

### 3. شغّل البناء
- اذهب لـ: **Actions → Build DAWAI APK → Run workflow**
- انتظر 10-15 دقيقة
- حمّل الـ APK من **Artifacts**

## بدون Secrets
- التطبيق سيُبنى لكن **Firebase لن يعمل** و**الخريطة لن تظهر**
- يمكنك اختبار باقي الميزات بدونهم
