import { UserRole, AttendanceStatus, InvoiceStatus } from '@prisma/client';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/auth/login',
  CHANGE_PASSWORD: '/auth/change-password',
  
  // Dashboard Home
  DASHBOARD: '/dashboard',
  
  // --- CORE MANAGEMENT (Admin) ---
  STUDENTS: '/dashboard/students',
  TEACHERS: '/dashboard/teachers',
  PARENTS: '/dashboard/parents',
  EVENTS: '/dashboard/events',
  
  // --- ACADEMIC CONFIG (Admin) ---
  LEVELS: '/dashboard/admin/levels',
  CLASSES: '/dashboard/admin/classes',
  COURSES: '/dashboard/admin/courses',
  EXAMS: '/dashboard/admin/exams',

  // --- RESULTS (The Fix) ---
  // 1. Where Teachers Enter Scores
  RESULT_ENTRY: '/dashboard/results/entry',
  // 2. Where Admins View Class Lists (Broadsheet)
  ADMIN_RESULTS: '/dashboard/admin/results',
  // 3. Where Parents View Their Child's Report
  MY_RESULTS: '/dashboard/results', 

  // --- OPERATIONS ---
  ATTENDANCE: '/dashboard/attendance',
  TIMETABLE: '/dashboard/timetable',
  FINANCE: '/dashboard/finance',
  BILLING: '/dashboard/billing',
  
  // --- USER SPECIFIC ---
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
} as const;

// ... (Keep the rest of your file exactly as is: USER_ROLES, CONFIG_DEFAULTS, etc.)
export const USER_ROLES = [
  { value: UserRole.ADMIN, label: 'Administrator' },
  { value: UserRole.TEACHER, label: 'Academic Staff' },
  { value: UserRole.STUDENT, label: 'Student' },
  { value: UserRole.PARENT, label: 'Guardian/Parent' },
] as const;

export const CONFIG_DEFAULTS = {
  CURRENCY: { code: 'NGN', symbol: '₦', name: 'Naira' },
  PAGE_SIZE: 20,
  DATE_FORMAT: 'MMM DD, YYYY',
} as const;

export const CURRENCY = '₦';

export const DEPARTMENTS = [
  "Science", "Arts", "Commercial", "General", "Vocational"
];

export const ATTENDANCE_STATUSES = [
  { value: AttendanceStatus.PRESENT, label: 'Present', color: 'bg-emerald-100 text-emerald-700' },
  { value: AttendanceStatus.ABSENT, label: 'Absent', color: 'bg-red-100 text-red-700' },
  { value: AttendanceStatus.LATE, label: 'Late', color: 'bg-amber-100 text-amber-700' },
  { value: AttendanceStatus.EXCUSED, label: 'Excused', color: 'bg-blue-100 text-blue-700' },
] as const;

export const INVOICE_STATUSES = [
  { value: InvoiceStatus.PENDING, label: 'Pending', color: 'text-amber-600 bg-amber-50' },
  { value: InvoiceStatus.PAID, label: 'Paid', color: 'text-emerald-600 bg-emerald-50' },
  { value: InvoiceStatus.PARTIALLY_PAID, label: 'Partial', color: 'text-blue-600 bg-blue-50' },
  { value: InvoiceStatus.OVERDUE, label: 'Overdue', color: 'text-red-600 bg-red-50' },
  { value: InvoiceStatus.CANCELLED, label: 'Void', color: 'text-slate-500 bg-slate-100' },
] as const;

export const VALIDATION = {
  PASSWORD_MIN_LEN: 6,
  MAX_FILE_SIZE_MB: 5,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

export const DEFAULT_GRADE_SCALE = [
  { min: 70, max: 100, grade: 'A', remark: 'Excellent' },
  { min: 60, max: 69, grade: 'B', remark: 'Very Good' },
  { min: 50, max: 59, grade: 'C', remark: 'Good' },
  { min: 45, max: 49, grade: 'D', remark: 'Pass' },
  { min: 40, max: 44, grade: 'E', remark: 'Fair' },
  { min: 0, max: 39, grade: 'F', remark: 'Fail' },
] as const;
