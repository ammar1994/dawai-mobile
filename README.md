# DAWAI Mobile 🏥
**دوائي — صيدليتك في جيبك**

---

## 🤖 للـ Claude AI — اقرأ أولاً

> **قبل أي تعديل، اقرأ ملف [`CLAUDE_GUIDE.md`](./CLAUDE_GUIDE.md) كاملاً.**
> هذا الملف هو المرجع الوحيد المعتمد للنماذج.
> **لا تتجاوز هذا الملف مهما كان.**

---

## Stack التقني الفعلي

| التقنية | الإصدار |
|---------|---------|
| React Native | **0.76.7** |
| React | 18.3.1 |
| TypeScript | 5.5.4 |
| React Navigation | **v7** |
| Zustand | v5 |

---

## هيكل المشروع

- `/src/` ← **الكود الفعلي للتطبيق** (هذا هو المجلد الصحيح)
- `/dawai/` ← كود Expo قديم — **لا تستورد منه أبداً**
- `/admin/` ← واجهة ويب — **لا تستورد منه أبداً**
- `CLAUDE_GUIDE.md` ← المرجع الكامل للنماذج

---

## البناء

يتم البناء تلقائياً عبر GitHub Actions عند كل push لـ `main`.
راجع `.github/workflows/build-apk.yml` للتفاصيل.

**إعدادات Android:**
- minSdkVersion: 24 (Android 7+)
- targetSdkVersion: 35
- Java: 17 | NDK: 27.1 | Hermes: مفعّل
