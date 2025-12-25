// src/types/index.ts
// ============================================
// YOSOLA SCHOOL MANAGEMENT SYSTEM - TYPE DEFINITIONS
// ============================================

// 1. IMPORT & RE-EXPORT PRISMA-GENERATED TYPES
// We import the types and enums directly from Prisma...
import type {
    User,
    // Admin, // 'Admin' model doesn't exist in your schema
    Level,
    Class,
    Course,
    Teacher,
    Student,
    Parent,
    Enrollment,
    ClassAssignment,
    ParentStudentLink,
    TimetableSlot,
    StudentAttendance,
    Exam,
    ExamSchedule,
    Result,
    FeeTemplate,
    FeeTemplateItem,
    Invoice,
    InvoiceItem,
    Payment,
    Event,
    Notification,
    // Enums
    UserRole,
    Department,
    DayOfWeek,
    AttendanceStatus, // This is the one causing the error
    InvoiceStatus
} from '@prisma/client';

// ...and then re-export them.
// Now, other files (like constant.ts) can import these from '@/types'
export type {
    User,
    // Admin, // Removed
    Level,
    Class,
    Course,
    Teacher,
    Student,
    Parent,
    Enrollment,
    ClassAssignment,
    ParentStudentLink,
    TimetableSlot,
    StudentAttendance,
    Exam,
    ExamSchedule,
    Result,
    FeeTemplate,
    FeeTemplateItem,
    Invoice,
    InvoiceItem,
    Payment,
    Event,
    Notification,
    // Enums
    UserRole,
    Department,
    DayOfWeek,
    AttendanceStatus, // This is now correctly exported
    InvoiceStatus
};

// ==================== CUSTOM HELPER TYPES ====================

// Takes Prisma's 'Class' type, removes the full 'level' relation,
// and adds back a new 'level' property that is just { name: string }.
export type ClassWithLevel = Omit<Class, 'level'> & {
  level: { name: string };
};

// Your custom interface for the /me route
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string | null;
    lastName?: string | null;
    passwordResetRequired: boolean;
}

// Your custom interface for the parent dashboard
export interface ChildProfile {
  id: string;
  fullName: string;
  level?: { name: string } | null;
  enrollments?: {
    class: { name: string };
  }[];
}

// Your custom helper types for AdminDashboard
export interface BasicStudent {
  id: string;
  fullName: string;
  level?: { name: string } | null;
}

export interface BasicTeacher {
  id: string;
  fullName: string;
  user?: { email: string } | null;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: unknown[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== FORM INPUT TYPES ====================
// (These use the imported enums like Department, AttendanceStatus)

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LevelInput {
  name: string;
}

export interface ClassInput {
  name: string;
  levelId: string;
  roomNumber?: string | null;
  department?: Department | null; // Use the imported Enum
}

export interface CourseInput {
  name: string;
  code?: string;
  levelId: string;
  department?: Department | null; // Use the imported Enum
}

export interface TeacherInput {
  fullName: string;
  email: string;
  password?: string;
  contactPhone?: string;
  subjectExpertise?: string;
}

export interface StudentInput {
  fullName: string;
  email: string;
  password?: string;
  levelId?: string;
  dateOfBirth?: string;
  contactPhone?: string;
}

export interface ParentInput {
  fullName: string;
  email: string;
  password?: string;
  contactPhone?: string;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus; // Use the imported Enum
  remarks?: string;
}

export interface AttendanceInput {
  classId: string;
  courseId: string;
  attendanceDate: string;
  records: AttendanceRecord[];
}

export interface ResultInput {
  studentId: string;
  examId: string;
  courseId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  comments?: string;
}

export interface InvoiceInput {
  studentId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: {
    description: string;
    amount: number;
  }[];
}

export interface PaymentInput {
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface EventInput {
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  targetAudience?: string;
}

// ... other custom types ...
