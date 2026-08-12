// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface MobileCustomer {
  id        : string;
  firstName : string;
  lastName  : string;
  email     : string;
  phone?    : string;
  isActive  : boolean;
  createdAt : string;
}

export interface AuthTokens {
  accessToken  : string;
  refreshToken : string;
  customer     : MobileCustomer;
}

export interface LoginPayload {
  email    : string;
  password : string;
}

export interface RegisterPayload {
  firstName : string;
  lastName  : string;
  email     : string;
  password  : string;
  phone?    : string;
}

// ─── Pharmacy (Branch) ────────────────────────────────────────────────────────
// ⚠️ لا يوجد isOpen أو rating في الـ Backend
export interface Pharmacy {
  id          : string;
  tenantId    : string;
  name        : string;
  address?    : string;
  phone?      : string;
  latitude    : number;
  longitude   : number;
  isActive    : boolean;
  distanceKm? : number;           // الحقل الصحيح من الـ API
  tenant      : { id: string; name: string };
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id                   : string;
  medicineName         : string;
  quantity             : number;
  price                : number;
  requiresPrescription : boolean;
}

export interface Order {
  id                   : string;
  status               : OrderStatus;
  notes?               : string;
  deliveryAddress?     : string;
  prescriptionImageUrl?: string;
  totalAmount          : number;
  estimatedReadyAt?    : string;
  paymentStatus        : 'UNPAID' | 'PAID';
  paymentIntentId?     : string;
  createdAt            : string;
  updatedAt            : string;
  items                : OrderItem[];
  branch               : { id: string; name: string; address?: string; phone?: string };
  customer?            : { id: string; firstName: string; lastName: string; phone?: string };
}

export interface CreateOrderPayload {
  branchId             : string;
  items                : { medicineName: string; quantity: number }[];
  notes?               : string;
  deliveryAddress?     : string;
  prescriptionImageUrl?: string;
}

// Cart — frontend only
export interface CartItem {
  medicineName : string;
  quantity     : number;
}

// ─── Prescription ─────────────────────────────────────────────────────────────
// ⚠️ لا يوجد حقل status — الحقول: id, imageUrl, notes, uploadedAt
export interface Prescription {
  id         : string;
  imageUrl   : string;
  notes?     : string;
  uploadedAt : string;   // الحقل الصحيح (وليس createdAt)
}

// ─── Reminder ─────────────────────────────────────────────────────────────────
// ⚠️ times هو String[] (مصفوفة) — dosage مطلوب
export type ReminderFrequency = 'DAILY' | 'TWICE_DAILY' | 'WEEKLY' | 'CUSTOM';

export interface Reminder {
  id           : string;
  medicineName : string;
  dosage       : string;          // مطلوب (required)
  frequency    : ReminderFrequency;
  times        : string[];        // ["08:00"] أو ["08:00", "20:00"]
  startDate    : string;
  endDate?     : string;
  isActive     : boolean;
  notes?       : string;
  createdAt    : string;
}

export interface CreateReminderPayload {
  medicineName : string;
  dosage       : string;
  frequency    : ReminderFrequency;
  times        : string[];
  startDate    : string;
  endDate?     : string;
  notes?       : string;
}

// ─── Saved Address — frontend only (MMKV) ────────────────────────────────────
export interface SavedAddress {
  id    : string;
  label : 'home' | 'work' | 'other';
  text  : string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?    : T;
  message? : string;
  success  : boolean;
}

// ─── Navigation Params ────────────────────────────────────────────────────────
export type RootStackParamList = {
  Splash : undefined;
  Auth   : undefined;
  Main   : undefined;
};

export type AuthStackParamList = {
  Login          : undefined;
  Register       : undefined;
  ForgotPassword : undefined;
};

export type MainTabParamList = {
  Home          : undefined;
  Pharmacies    : undefined;
  Orders        : undefined;
  Prescriptions : undefined;
  More          : undefined;
};

export type PharmaciesStackParamList = {
  PharmacyList   : undefined;
  PharmacyMap    : undefined;
  PharmacyDetail : { pharmacyId: string };
  Cart           : { pharmacyId: string };
  NewOrder       : { pharmacyId: string };
};

export type OrdersStackParamList = {
  OrdersList  : undefined;
  OrderDetail : { orderId: string };
  Payment     : { orderId: string };
};

export type MoreStackParamList = {
  MoreMenu       : undefined;
  Reminders      : undefined;
  MedicineSearch : undefined;
  Favorites      : undefined;
  SavedAddresses : undefined;
  Profile        : undefined;
};
