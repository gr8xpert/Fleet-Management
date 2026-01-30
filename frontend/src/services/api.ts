import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 422) {
      // Validation errors - handled by the form
    } else if (error.response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/login', data),
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post('/register', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  updateProfile: (data: { name: string; email: string; phone?: string }) =>
    api.put('/user/profile', data),
  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }) =>
    api.put('/user/password', data),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => api.get('/dashboard'),
  getUpcomingExpiries: (days = 30) => api.get(`/dashboard/expiries?days=${days}`),
  getFinancialSummary: () => api.get('/dashboard/summary'),
  getAlerts: () => api.get('/dashboard/alerts'),
};

// Vehicles API
export const vehiclesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/vehicles', { params }),
  getById: (id: number) => api.get(`/vehicles/${id}`),
  create: (data: unknown) => api.post('/vehicles', data),
  update: (id: number, data: unknown) => api.put(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  getHistory: (id: number) => api.get(`/vehicles/${id}/history`),
  transfer: (id: number, data: unknown) => api.post(`/vehicles/${id}/transfer`, data),
};

// Vehicle Documents API
export const vehicleDocumentsApi = {
  getByVehicle: (vehicleId: number) => api.get(`/vehicles/${vehicleId}/documents`),
  create: (vehicleId: number, data: FormData) =>
    api.post(`/vehicles/${vehicleId}/documents`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/documents/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/documents/${id}`),
  getExpiring: (days = 30, type?: string) =>
    api.get('/documents/expiring', { params: { days, type } }),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/maintenance', { params }),
  getById: (id: number) => api.get(`/maintenance/${id}`),
  create: (data: unknown) => api.post('/maintenance', data),
  update: (id: number, data: unknown) => api.put(`/maintenance/${id}`, data),
  delete: (id: number) => api.delete(`/maintenance/${id}`),
  getByVehicle: (vehicleId: number) => api.get(`/maintenance/vehicle/${vehicleId}`),
  getScheduled: () => api.get('/maintenance/scheduled'),
  complete: (id: number, data: unknown) => api.post(`/maintenance/${id}/complete`, data),
};

// Spare Parts API
export const sparePartsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/spare-parts', { params }),
  getById: (id: number) => api.get(`/spare-parts/${id}`),
  create: (data: unknown) => api.post('/spare-parts', data),
  update: (id: number, data: unknown) => api.put(`/spare-parts/${id}`, data),
  delete: (id: number) => api.delete(`/spare-parts/${id}`),
  getLowStock: () => api.get('/spare-parts/low-stock'),
  adjustStock: (id: number, data: unknown) => api.post(`/spare-parts/${id}/adjust`, data),
};

// Vendors API
export const vendorsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/vendors', { params }),
  getById: (id: number) => api.get(`/vendors/${id}`),
  create: (data: unknown) => api.post('/vendors', data),
  update: (id: number, data: unknown) => api.put(`/vendors/${id}`, data),
  delete: (id: number) => api.delete(`/vendors/${id}`),
};

// Employees API
export const employeesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/employees', { params }),
  getById: (id: number) => api.get(`/employees/${id}`),
  create: (data: FormData) =>
    api.post('/employees', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/employees/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/employees/${id}`),
  getDrivers: () => api.get('/employees/drivers'),
  getFines: (id: number) => api.get(`/employees/${id}/fines`),
  getAttendance: (id: number, month?: number, year?: number) =>
    api.get(`/employees/${id}/attendance`, { params: { month, year } }),
};

// Salaries API
export const salariesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/salaries', { params }),
  getById: (id: number) => api.get(`/salaries/${id}`),
  create: (data: unknown) => api.post('/salaries', data),
  update: (id: number, data: unknown) => api.put(`/salaries/${id}`, data),
  delete: (id: number) => api.delete(`/salaries/${id}`),
  getByEmployee: (employeeId: number) => api.get(`/salaries/employee/${employeeId}`),
  generateMonthly: (year: number, month: number) =>
    api.post('/salaries/generate-monthly', { year, month }),
  markAsPaid: (id: number, data?: unknown) => api.post(`/salaries/${id}/pay`, data),
  // Advances
  getAdvances: (params?: Record<string, unknown>) => api.get('/salary-advances', { params }),
  createAdvance: (data: unknown) => api.post('/salary-advances', data),
  updateAdvance: (id: number, data: unknown) => api.put(`/salary-advances/${id}`, data),
  deleteAdvance: (id: number) => api.delete(`/salary-advances/${id}`),
};

// Visas API
export const visasApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/visas', { params }),
  getById: (id: number) => api.get(`/visas/${id}`),
  create: (data: FormData) =>
    api.post('/visas', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/visas/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/visas/${id}`),
  getExpiring: (days = 30) => api.get('/visas/expiring', { params: { days } }),
  getByEmployee: (employeeId: number) => api.get(`/visas/employee/${employeeId}`),
  renew: (id: number, data: FormData) =>
    api.post(`/visas/${id}/renew`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Applications
  getApplications: (params?: Record<string, unknown>) => api.get('/visa-applications', { params }),
  createApplication: (data: unknown) => api.post('/visa-applications', data),
  updateApplication: (id: number, data: unknown) => api.put(`/visa-applications/${id}`, data),
  updateApplicationStatus: (id: number, data: unknown) =>
    api.post(`/visa-applications/${id}/status`, data),
};

// Fines API
export const finesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/fines', { params }),
  getById: (id: number) => api.get(`/fines/${id}`),
  create: (data: unknown) => api.post('/fines', data),
  update: (id: number, data: unknown) => api.put(`/fines/${id}`, data),
  delete: (id: number) => api.delete(`/fines/${id}`),
  getByVehicle: (vehicleId: number) => api.get(`/fines/vehicle/${vehicleId}`),
  getByDriver: (employeeId: number) => api.get(`/fines/driver/${employeeId}`),
  getPending: () => api.get('/fines/pending'),
  markAsPaid: (id: number, data?: unknown) => api.post(`/fines/${id}/pay`, data),
  assignToDriver: (id: number, driverId: number) =>
    api.post(`/fines/${id}/assign`, { driver_id: driverId }),
};

// Expenses API
export const expensesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/expenses', { params }),
  getById: (id: number) => api.get(`/expenses/${id}`),
  create: (data: FormData) =>
    api.post('/expenses', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.post(`/expenses/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/expenses/${id}`),
  getByCategory: (categoryId: number) => api.get(`/expenses/category/${categoryId}`),
  getByVehicle: (vehicleId: number) => api.get(`/expenses/vehicle/${vehicleId}`),
  getCategories: () => api.get('/expense-categories'),
};

// Income API
export const incomeApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/income', { params }),
  getById: (id: number) => api.get(`/income/${id}`),
  create: (data: unknown) => api.post('/income', data),
  update: (id: number, data: unknown) => api.put(`/income/${id}`, data),
  delete: (id: number) => api.delete(`/income/${id}`),
  getByCustomer: (customerId: number) => api.get(`/income/customer/${customerId}`),
  getCategories: () => api.get('/income-categories'),
};

// Cheques API
export const chequesApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/cheques', { params }),
  getById: (id: number) => api.get(`/cheques/${id}`),
  create: (data: unknown) => api.post('/cheques', data),
  update: (id: number, data: unknown) => api.put(`/cheques/${id}`, data),
  delete: (id: number) => api.delete(`/cheques/${id}`),
  getPending: () => api.get('/cheques/pending'),
  clear: (id: number, data?: unknown) => api.post(`/cheques/${id}/clear`, data),
  bounce: (id: number, data?: unknown) => api.post(`/cheques/${id}/bounce`, data),
};

// Customers API
export const customersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/customers', { params }),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: unknown) => api.post('/customers', data),
  update: (id: number, data: unknown) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  getInvoices: (id: number) => api.get(`/customers/${id}/invoices`),
  getPayments: (id: number) => api.get(`/customers/${id}/payments`),
};

// Alerts API
export const alertsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/alerts', { params }),
  getUnread: () => api.get('/alerts/unread'),
  markAsRead: (id: number) => api.post(`/alerts/${id}/read`),
  markAllAsRead: () => api.post('/alerts/read-all'),
  delete: (id: number) => api.delete(`/alerts/${id}`),
};

// Reports API
export const reportsApi = {
  getFinancial: (params?: Record<string, unknown>) => api.get('/reports/financial', { params }),
  getFleet: (params?: Record<string, unknown>) => api.get('/reports/fleet', { params }),
  getHR: (params?: Record<string, unknown>) => api.get('/reports/hr', { params }),
  getExpiries: (params?: Record<string, unknown>) => api.get('/reports/expiries', { params }),
  getFines: (params?: Record<string, unknown>) => api.get('/reports/fines', { params }),
  exportReport: (type: string, params?: Record<string, unknown>) =>
    api.get(`/reports/export/${type}`, { params }),
};

// Users API (Admin only)
export const usersApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: number, data: unknown) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  resetPassword: (id: number) => api.post(`/users/${id}/reset-password`),
  getAuditLogs: (params?: Record<string, unknown>) => api.get('/audit-logs', { params }),
};
