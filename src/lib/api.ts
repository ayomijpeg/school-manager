// src/lib/api.ts
import { API_BASE_URL } from './constant';
import { buildQueryString } from './utils';
// Removed CourseWithLevel from import if it does not exist
import type { ChildProfile, BasicTeacher, AuthUser, ClassWithLevel, Class, ClassInput, Course, CourseInput } from '@/types';
import type { Level } from '@prisma/client';

// 🟢 Interfaces for specific API payloads (Fixes 'any' errors)
export interface SearchStudent {
  id: string;
  fullName: string;
  matricNumber: string;
  level?: { name: string };
  department?: { name: string };
}

interface AdminCreateData { email: string; password: string }
interface LevelCreateData { name: string }
interface LevelUpdateData { name?: string }
interface TeacherCreateData { fullName: string; email: string; password: string; subjectExpertise?: string }
interface ParentCreateData { fullName: string; email: string; password: string; contactPhone?: string }
interface ExamCreateData { name: string; academicYear: string; term?: string }
interface ResultCreateData { studentId: string; examId: string; courseId: string; marksObtained: number; maxMarks: number; grade?: string; comments?: string }
interface InvoiceCreateData { studentId: string; invoiceNumber: string; issueDate: string; dueDate: string; items: Array<{ description: string; amount: number }> }
interface InvoiceBulkData { templateId: string; levelId: string; issueDate: string; dueDate: string }
interface PaymentRecordData { invoiceId: string; amountPaid: number; paymentDate: string; paymentMethod?: string }
interface TimetableCreateData { classId: string; courseId: string; teacherId?: string; dayOfWeek: string; startTime: string; endTime: string; academicYear?: string }
interface EventCreateData { title: string; description?: string; eventDate: string; startTime?: string; endTime?: string; location?: string; targetAudience?: string }
interface AttendanceData { classId: string; courseId: string; attendanceDate: string; records: Array<{ studentId: string; status: string; remarks?: string }> }

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL || '/api') {
    this.baseURL = baseURL;
  }

  // --- Core Request Method ---
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';

    const config: RequestInit = {
      ...options,
      headers: {
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data as T;

    } catch (error) {
      console.error('[API Client] Error:', { endpoint, method, error });
      throw error instanceof Error ? error : new Error('An unexpected API error occurred');
    }
  }

  // ==================== HTTP METHODS ====================
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    const queryString = params ? buildQueryString(params) : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  }
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data ? JSON.stringify(data) : undefined });
  }
  async delete<T = void>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined });
  }
}

// Export singleton instance
export const api = new ApiClient();

// ==================== AUTH API ====================

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ message: string }>('/auth/login', { email, password }),

  logout: () => api.post<void>('/auth/logout'),

  getMe: async () => {
    const res = await api.get<{ user: AuthUser | null }>('/auth/me');
    return res.user ?? null;
  },

  changePassword: (c: string, n: string) =>
    api.put('/auth/change-password', { currentPassword: c, newPassword: n }),
};

// ==================== ADMIN API ====================

export const adminApi = {
  create: (data: AdminCreateData) => api.post('/admins', data),
};

// ==================== LEVEL API ====================

export const levelApi = {
  getAll: () => api.get<Level[]>('/levels'),
  getById: (id: string) => api.get(`/levels/${id}`),
  create: (data: LevelCreateData) => api.post('/levels', data),
  update: (id: string, data: LevelUpdateData) => api.put(`/levels/${id}`, data),
  delete: (id: string) => api.delete(`/levels/${id}`),
};

export const setupApi = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConfig: () => api.get<{ config: any }>('/setup/school'),
};

export const departmentApi = {
  getAll: () => api.get<{ id: string; name: string }[]>('/departments'),
};

// ==================== CLASS API ====================

export const classApi = {
  getAll: () => api.get<ClassWithLevel[]>('/classes'),
  getById: (id: string) => api.get<ClassWithLevel>(`/classes/${id}`),
  create: (data: ClassInput) => api.post<Class>('/classes', data),
  update: (id: string, data: Partial<ClassInput>) => api.put<Class>(`/classes/${id}`, data),
  delete: (id: string) => api.delete<void>(`/classes/${id}`),
  enrollStudent: (classId: string, data: { studentId: string; academicYear: string }) =>
    api.post(`/classes/${classId}/enroll`, data),
  assignTeacher: (classId: string, data: { teacherId: string; courseId: string }) =>
    api.post(`/classes/${classId}/assign-teacher`, data),
  getStudents: (classId: string) => api.get(`/classes/${classId}/students`),
};

// ==================== COURSE API ====================

export const courseApi = {
  getAll: () => api.get<Course[]>('/courses'), // Changed CourseWithLevel to Course if strictly needed
  getById: (id: string) => api.get<Course>(`/courses/${id}`),
  create: (data: CourseInput) => api.post<Course>('/courses', data),
  update: (id: string, data: Partial<CourseInput>) => api.put<Course>(`/courses/${id}`, data),
  delete: (id: string) => api.delete<void>(`/courses/${id}`),
};

// ==================== TEACHER API ====================

export const teacherApi = {
  getAll: () => api.get<BasicTeacher[]>('/teachers'),
  getById: (id: string) => api.get(`/teachers/${id}`),
  create: (data: TeacherCreateData) => api.post('/teachers', data),
  update: (id: string, data: Partial<TeacherCreateData>) => api.put(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
  getMyClasses: () => api.get('/teachers/me/classes'),
  getExamSchedules: () => api.get('/teachers/me/exam-schedules'),
};

// ==================== STUDENT API ====================

export const studentApi = {
  getAll: (query?: string) => api.get<SearchStudent[]>(`/students${query ? `?search=${query}` : ''}`),
  getById: (id: string) => api.get(`/students/${id}`),
  create: (data: unknown) => api.post('/students', data), // Using unknown for complex nested forms is acceptable
  update: (id: string, data: unknown) => api.patch(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  getMe: () => api.get<ChildProfile | ChildProfile[] | null>('/students/me'),
  getMyResults: () => api.get('/students/me/results'),
  getMyInvoices: () => api.get('/students/me/invoices'),
  getMyTimetable: () => api.get('/students/me/timetable'),
  getMyExamSchedules: () => api.get('/students/me/exam-schedules'),
  getMyClassmates: () => api.get('/students/me/classmates'),
};

// ==================== PARENT API ====================

export const parentApi = {
  getAll: () => api.get('/parents'),
  getById: (id: string) => api.get(`/parents/${id}`),
  create: (data: ParentCreateData) => api.post('/parents', data),
  update: (id: string, data: Partial<ParentCreateData>) => api.put(`/parents/${id}`, data),
  delete: (id: string) => api.delete(`/parents/${id}`),
  linkStudent: (parentId: string, studentId: string) =>
    api.post(`/parents/${parentId}/link-student`, { studentId }),
};

// ==================== ATTENDANCE API ====================

export const attendanceApi = {
  mark: (data: AttendanceData) => api.post('/attendance', data),
  getMissingReport: (date?: string) =>
    api.get('/attendance/missing-report', date ? { date } : undefined),
};

// ==================== EXAM API ====================

export const examApi = {
  getAll: () => api.get('/exams'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: ExamCreateData) => api.post('/exams', data),
  update: (id: string, data: unknown) => api.put(`/exams/${id}`, data),
  delete: (id: string) => api.delete(`/exams/${id}`),
};

// ==================== RESULT API ====================

export const resultApi = {
  create: (data: ResultCreateData) => api.post('/results', data),
  update: (id: string, data: Partial<ResultCreateData>) => api.put(`/results/${id}`, data),
};

// ==================== INVOICE API ====================

export const invoiceApi = {
  getAll: () => api.get('/invoices'),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: InvoiceCreateData) => api.post('/invoices', data),
  generateBulk: (data: InvoiceBulkData) => api.post('/invoices/generate-bulk', data),
};

// ==================== PAYMENT API ====================

export const paymentApi = {
  record: (data: PaymentRecordData) => api.post('/payments', data),
};

// ==================== TIMETABLE API ====================

export const timetableApi = {
  getAll: () => api.get('/timetable'),
  getByClass: (classId: string) => api.get(`/timetable/class/${classId}`),
  create: (data: TimetableCreateData) => api.post('/timetable', data),
  update: (id: string, data: unknown) => api.put(`/timetable/${id}`, data),
  delete: (id: string) => api.delete(`/timetable/${id}`),
};

// ==================== EVENT API ====================

export const eventApi = {
  getAll: () => api.get('/events'),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: EventCreateData) => api.post('/events', data),
  update: (id: string, data: unknown) => api.put(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// ==================== NOTIFICATION API ====================

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
