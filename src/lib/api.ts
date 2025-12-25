// src/lib/api.ts
import { API_BASE_URL } from './constant'; // Corrected import path

import { buildQueryString } from './utils';
// Import necessary types used in specific api functions below
import type { ChildProfile, BasicStudent, BasicTeacher, AuthUser, ClassWithLevel,Class, ClassInput, Course, CourseInput, CourseWithLevel /* ... */ } from '@/types';
import type { Level /* ... */ } from '@prisma/client';

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
    const method = options.method || 'GET'; // Keep track of method for logging

    const config: RequestInit = {
      ...options,
      headers: {
        // Only set Content-Type if there's a body
        ...(options.body && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      credentials: 'include',
    };

    let response: Response;
    try {
      console.log(`[API Client] Requesting: ${method} ${url}`); // Log request start
      response = await fetch(url, config);
      console.log(`[API Client] Response Status: ${response.status} for ${method} ${url}`); // Log status

      // --- Handle No Content ---
      if (response.status === 204) {
        return undefined as T;
      }

      // --- Try Parsing JSON ---
      // Clone response to read body multiple times if needed (for errors)
      const responseClone = response.clone();
      try {
        const data = await response.json();

        // --- Handle Application-Level Errors (e.g., validation) ---
        if (!response.ok) {
           // Try to get specific error message from JSON body
           const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
           console.error(`[API Client] Error Response Data for ${method} ${url}:`, data);
           throw new Error(errorMessage);
        }

        // --- Success ---
        return data as T;

      } catch (jsonError) {
        // --- Handle JSON Parsing Failure or Non-JSON Responses ---
        console.error(`[API Client] Failed to parse JSON for ${method} ${url}. Status: ${response.status}`, jsonError);
        // Read response as text for debugging
        const errorText = await responseClone.text();
        console.error(`[API Client] Non-JSON Response Text (first 500 chars):`, errorText.substring(0, 500));

        // Throw an error indicating unexpected response type
        // Include status code for better context
         if (!response.ok) {
             throw new Error(`Request failed with status ${response.status}. Server returned non-JSON response.`);
         } else {
            // This case is weird: Status OK, but not JSON as expected?
             throw new Error(`Expected JSON response but received non-JSON content. Status: ${response.status}`);
         }
      }

    } catch (error) { // Catches network errors, CORS errors, and errors thrown above
      console.error('[API Client] Network or Thrown Error:', { endpoint, method, error });
      // Re-throw the error for the calling function (e.g., useAuth) to handle
      throw error instanceof Error ? error : new Error('An unexpected API error occurred');
    }
  }

  // ==================== HTTP METHODS ====================
  // (These remain largely the same, relying on the robust 'request' method)
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

// ==================== Specific API Function Exports ====================
// (Define authApi, levelApi, etc. below, ensuring correct return types)

export const authApi = {
  login: (email: string, password: string): Promise<{ message: string }> =>
    api.post('/auth/login', { email, password }),

  logout: (): Promise<void> => api.post('/auth/logout'),

  // FIX: align with { user: AuthUser | null } response
  getMe: async (): Promise<AuthUser | null> => {
    const res = await api.get<{ user: AuthUser | null }>('/auth/me');
    return res.user ?? null;
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// ==================== AUTH API ====================

// export const authApi = {
//   login: (email: string, password: string) =>
//     api.post('/auth/login', { email, password }),

//   logout: () => api.post('/auth/logout'),

//   getMe: () => api.get('/auth/me'),

//  

// ==================== ADMIN API ====================

export const adminApi = {
  create: (data: { email: string; password: string }) =>
    api.post('/admins', data),
};

// ==================== LEVEL API ====================

export const levelApi = {
  getAll: () => api.get<Level[]>('/levels'),
  
  getById: (id: string) => api.get(`/levels/${id}`),
  
  create: (data: { name: string }) => api.post('/levels', data),
  
  update: (id: string, data: { name?: string }) =>
    api.put(`/levels/${id}`, data),
  
  delete: (id: string) => api.delete(`/levels/${id}`),

};

export const setupApi = {
  getConfig: () => api.get<{ config: any }>('/setup/school'),
};

// ==================== DEPARTMENT API (NEW) ====================
// Essential for Tertiary Schools
export const departmentApi = {
  getAll: () => api.get<{ id: string; name: string }[]>('/departments'),
};

// ==================== CLASS API ====================

export const classApi = {
  // --- This is what you need ---

  // For GET /api/classes
  getAll: () => api.get<ClassWithLevel[]>('/classes'),
  
  // For GET /api/classes/[id]
  getById: (id: string) => api.get<ClassWithLevel>(`/classes/${id}`),
  
  // For POST /api/classes
  create: (data: ClassInput) => api.post<Class>('/classes', data),
  
  // For PUT /api/classes/[id]
  update: (id: string, data: Partial<ClassInput>) => api.put<Class>(`/classes/${id}`, data),
  
  // For DELETE /api/classes/[id]
  delete: (id: string) => api.delete<void>(`/classes/${id}`),
  
  // For POST /api/classes/[id]/enroll
  enrollStudent: (classId: string, data: { studentId: string; academicYear: string }) =>
    api.post(`/classes/${classId}/enroll`, data),
  
  // For POST /api/classes/[id]/assign-teacher
  assignTeacher: (classId: string, data: { teacherId: string; courseId: string }) =>
    api.post(`/classes/${classId}/assign-teacher`, data),
  
  // For GET /api/classes/[id]/students
  getStudents: (classId: string) => api.get(`/classes/${classId}/students`), // TODO: Add return type
};

// ==================== COURSE API ====================

export const courseApi = {
  // Returns courses with level name included
  getAll: () => api.get<CourseWithLevel[]>('/courses'),

  // Returns a single course (we'll use this later)
  getById: (id: string) => api.get<CourseWithLevel>(`/courses/${id}`),

  // Creates a new course
  create: (data: CourseInput) => api.post<Course>('/courses', data),

  // Updates a course (for later)
  update: (id: string, data: Partial<CourseInput>) => api.put<Course>(`/courses/${id}`, data),

  // Deletes a course (for later)
  delete: (id: string) => api.delete<void>(`/courses/${id}`),
};

// ==================== TEACHER API ====================

export const teacherApi = {
  getAll: () => api.get<BasicTeacher[]>('/teachers'),
  
  getById: (id: string) => api.get(`/teachers/${id}`),
  
  create: (data: {
    fullName: string;
    email: string;
    password: string;
    subjectExpertise?: string;
  }) => api.post('/teachers', data),
  
  update: (id: string, data: unknown) => api.put(`/teachers/${id}`, data),
  
  delete: (id: string) => api.delete(`/teachers/${id}`),
  
  getMyClasses: () => api.get('/teachers/me/classes'),
  
  getExamSchedules: () => api.get('/teachers/me/exam-schedules'),
};

// ==================== STUDENT API ====================

export const studentApi = {
  getAll: (query?: string) => api.get<BasicStudent[]>(`/students${query ? `?search=${query}` : ''}`),
  
  getById: (id: string) => api.get(`/students/${id}`),
  
  create: (data: {
    firstName: string;
    lastName: string;
    levelId: string;
    departmentId?: string; // New
    email?: string;
    dateOfBirth?: string;
    contactPhone?: string;
    gender?: 'MALE' | 'FEMALE';
  }) => api.post('/students', data),
  
  update: (id: string, data: unknown) => api.patch(`/students/${id}`, data), // Changed PUT to PATCH
  
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
  
  create: (data: {
    fullName: string;
    email: string;
    password: string;
    contactPhone?: string;
  }) => api.post('/parents', data),
  
  update: (id: string, data: unknown) => api.put(`/parents/${id}`, data),
  
  delete: (id: string) => api.delete(`/parents/${id}`),
  
  linkStudent: (parentId: string, studentId: string) =>
    api.post(`/parents/${parentId}/link-student`, { studentId }),
};

// ==================== ATTENDANCE API ====================

export const attendanceApi = {
  mark: (data: {
    classId: string;
    courseId: string;
    attendanceDate: string;
    records: Array<{
      studentId: string;
      status: string;
      remarks?: string;
    }>;
  }) => api.post('/attendance', data),
  
  getMissingReport: (date?: string) =>
    api.get('/attendance/missing-report', date ? { date } : undefined),
};

// ==================== EXAM API ====================

export const examApi = {
  getAll: () => api.get('/exams'),
  
  getById: (id: string) => api.get(`/exams/${id}`),
  
  create: (data: {
    name: string;
    academicYear: string;
    term?: string;
  }) => api.post('/exams', data),
  
  update: (id: string, data: unknown) => api.put(`/exams/${id}`, data),
  
  delete: (id: string) => api.delete(`/exams/${id}`),
};

// ==================== RESULT API ====================

export const resultApi = {
  create: (data: {
    studentId: string;
    examId: string;
    courseId: string;
    marksObtained: number;
    maxMarks: number;
    grade?: string;
    comments?: string;
  }) => api.post('/results', data),
  
  update: (id: string, data: unknown) => api.put(`/results/${id}`, data),
};

// ==================== INVOICE API ====================

export const invoiceApi = {
  getAll: () => api.get('/invoices'),
  
  getById: (id: string) => api.get(`/invoices/${id}`),
  
  create: (data: {
    studentId: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    items: Array<{
      description: string;
      amount: number;
    }>;
  }) => api.post('/invoices', data),
  
  generateBulk: (data: {
    templateId: string;
    levelId: string;
    issueDate: string;
    dueDate: string;
  }) => api.post('/invoices/generate-bulk', data),
};

// ==================== PAYMENT API ====================

export const paymentApi = {
  record: (data: {
    invoiceId: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod?: string;
  }) => api.post('/payments', data),
};

// ==================== TIMETABLE API ====================

export const timetableApi = {
  getAll: () => api.get('/timetable'),
  
  getByClass: (classId: string) => api.get(`/timetable/class/${classId}`),
  
  create: (data: {
    classId: string;
    courseId: string;
    teacherId?: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    academicYear?: string;
  }) => api.post('/timetable', data),
  
  update: (id: string, data: unknown) => api.put(`/timetable/${id}`, data),
  
  delete: (id: string) => api.delete(`/timetable/${id}`),
};

// ==================== EVENT API ====================

export const eventApi = {
  getAll: () => api.get('/events'),
  
  getById: (id: string) => api.get(`/events/${id}`),
  
  create: (data: {
    title: string;
    description?: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    targetAudience?: string;
  }) => api.post('/events', data),
  
  update: (id: string, data: unknown) => api.put(`/events/${id}`, data),
  
  delete: (id: string) => api.delete(`/events/${id}`),
};

// ==================== NOTIFICATION API ====================

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.patch('/notifications/read-all'),
};
