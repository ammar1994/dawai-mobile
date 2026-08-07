// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthState {
  customer: Customer | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Pharmacy ─────────────────────────────────────────────────────────────────

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance?: number;       // meters, filled by backend
  isOpen: boolean;
  rating?: number;
  logo?: string;
  workingHours?: WorkingHours;
}

export interface WorkingHours {
  open: string;   // "08:00"
  close: string;  // "23:00"
  days: string[]; // ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  requiresPrescription: boolean;
}

export interface Order {
  id: string;
  pharmacyId: string;
  /** اسم الصيدلية — يأتي من الـ API كـ branch.name */
  pharmacyName: string;
  branch?: {
    id: string;
    name: string;       // المصدر الأصلي من الباك إند
    address?: string;
  };
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  notes?: string;
  prescriptionImageUrl?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyAt?: string;
}

export interface CreateOrderRequest {
  pharmacyId: string;
  items: Omit<OrderItem, 'medicineName' | 'price'>[];
  notes?: string;
  deliveryAddress?: string;
  prescriptionImageUrl?: string;
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export type ReminderFrequency = 'DAILY' | 'TWICE_DAILY' | 'WEEKLY' | 'CUSTOM';

export interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: ReminderFrequency;
  times: string[];    // ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export interface CreateReminderRequest {
  medicineName: string;
  dosage: string;
  frequency: ReminderFrequency;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Pharmacies: undefined;
  Orders: undefined;
  Reminders: undefined;
  Profile: undefined;
};

export type PharmacyStackParamList = {
  PharmacyMap: undefined;
  PharmacyDetail: { pharmacyId: string };
  NewOrder: { pharmacyId: string; pharmacyName: string };
};

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  OrderTracking: { orderId: string };
};
