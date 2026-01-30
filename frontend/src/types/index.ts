// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  phone?: string;
  is_active: boolean;
  created_at: string;
}

// Vehicle types
export interface Vehicle {
  id: number;
  bus_number: string;
  plate_number: string;
  plate_code?: string;
  chassis_number?: string;
  engine_number?: string;
  type: 'bus' | 'minibus' | 'coaster' | 'van' | 'other';
  make?: string;
  model?: string;
  year?: number;
  seating_capacity?: number;
  color?: string;
  owner_name?: string;
  owner_contact?: string;
  purchase_date?: string;
  purchase_price?: number;
  status: 'active' | 'inactive' | 'maintenance' | 'sold' | 'scrapped';
  current_km: number;
  notes?: string;
  created_at: string;
  mulkiya?: VehicleDocument;
  insurance?: VehicleDocument;
}

export interface VehicleDocument {
  id: number;
  vehicle_id: number;
  document_type: 'mulkiya' | 'registration' | 'insurance' | 'permit' | 'fitness' | 'other';
  document_number?: string;
  issue_date?: string;
  expiry_date: string;
  cost?: number;
  file_path?: string;
  notes?: string;
  is_active: boolean;
  vehicle?: Vehicle;
}

// Employee types
export interface Employee {
  id: number;
  employee_id?: string;
  name: string;
  name_arabic?: string;
  type: 'driver' | 'mechanic' | 'cleaner' | 'supervisor' | 'admin' | 'other';
  nationality?: string;
  passport_number?: string;
  passport_expiry?: string;
  emirates_id?: string;
  emirates_id_expiry?: string;
  license_number?: string;
  license_expiry?: string;
  phone?: string;
  phone_alternate?: string;
  address?: string;
  join_date?: string;
  basic_salary?: number;
  bank_name?: string;
  bank_account?: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  photo?: string;
  notes?: string;
  created_at: string;
  current_visa?: Visa;
}

// Visa types
export interface Visa {
  id: number;
  employee_id: number;
  visa_number?: string;
  uid_number?: string;
  visa_type: 'employment' | 'visit' | 'transit' | 'residence' | 'other';
  issue_date?: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal';
  sponsor_name?: string;
  visa_cost?: number;
  file_path?: string;
  notes?: string;
  employee?: Employee;
}

// Maintenance types
export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  type: string;
  service_date: string;
  km_at_service?: number;
  next_service_km?: number;
  next_service_date?: string;
  description?: string;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  vendor_id?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  vehicle?: Vehicle;
  vendor?: Vendor;
}

// Vendor types
export interface Vendor {
  id: number;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  type: 'parts' | 'service' | 'tyres' | 'fuel' | 'other';
  notes?: string;
  is_active: boolean;
}

// Spare Parts
export interface SparePart {
  id: number;
  name: string;
  part_number?: string;
  category?: string;
  description?: string;
  quantity: number;
  min_quantity: number;
  unit_price?: number;
  location?: string;
  vendor_id?: number;
  is_active: boolean;
  vendor?: Vendor;
}

// Fine types
export interface Fine {
  id: number;
  vehicle_id?: number;
  driver_id?: number;
  fine_number?: string;
  type: string;
  violation_description?: string;
  amount: number;
  black_points: number;
  fine_date: string;
  due_date?: string;
  location?: string;
  status: 'pending' | 'paid' | 'disputed' | 'waived';
  payment_date?: string;
  paid_by?: 'company' | 'driver';
  notes?: string;
  vehicle?: Vehicle;
  driver?: Employee;
}

// Salary types
export interface Salary {
  id: number;
  employee_id: number;
  year: number;
  month: number;
  basic_salary: number;
  allowances: number;
  overtime: number;
  deductions: number;
  advance_deduction: number;
  fine_deduction: number;
  net_salary: number;
  status: 'pending' | 'paid' | 'partial';
  payment_date?: string;
  payment_method?: string;
  notes?: string;
  employee?: Employee;
}

export interface SalaryAdvance {
  id: number;
  employee_id: number;
  amount: number;
  advance_date: string;
  reason?: string;
  status: 'pending' | 'deducted' | 'cancelled';
  employee?: Employee;
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  phone_alternate?: string;
  address?: string;
  trn_number?: string;
  type: 'corporate' | 'individual' | 'school' | 'tour_operator' | 'other';
  credit_limit?: number;
  payment_terms: number;
  is_active: boolean;
  notes?: string;
}

// Financial types
export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface Expense {
  id: number;
  category_id: number;
  vehicle_id?: number;
  employee_id?: number;
  vendor_id?: number;
  expense_date: string;
  description: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  receipt_path?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  notes?: string;
  category?: ExpenseCategory;
  vehicle?: Vehicle;
  vendor?: Vendor;
}

export interface IncomeCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface Income {
  id: number;
  category_id: number;
  customer_id?: number;
  vehicle_id?: number;
  income_date: string;
  description: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  invoice_number?: string;
  status: 'received' | 'pending' | 'partial';
  notes?: string;
  category?: IncomeCategory;
  customer?: Customer;
}

export interface Cheque {
  id: number;
  type: 'issued' | 'received';
  cheque_number: string;
  bank_name: string;
  account_number?: string;
  amount: number;
  cheque_date: string;
  deposit_date?: string;
  customer_id?: number;
  vendor_id?: number;
  payee_name?: string;
  purpose?: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled' | 'replaced';
  clearance_date?: string;
  notes?: string;
  customer?: Customer;
  vendor?: Vendor;
}

// Alert types
export interface Alert {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  alertable_type: string;
  alertable_id: number;
  due_date?: string;
  days_before: number;
  is_read: boolean;
  is_sent: boolean;
  created_at: string;
}

// Dashboard types
export interface DashboardData {
  fleet: {
    total_vehicles: number;
    active_vehicles: number;
    in_maintenance: number;
    inactive_vehicles: number;
  };
  employees: {
    total_employees: number;
    active_employees: number;
    drivers: number;
  };
  expiries: {
    mulkiya_expiring_30: number;
    visa_expiring_30: number;
    license_expiring_30: number;
  };
  fines: {
    pending_count: number;
    pending_amount: number;
    this_month: number;
  };
  maintenance: {
    scheduled: number;
    in_progress: number;
    this_month_cost: number;
  };
  alerts: {
    unread_count: number;
    urgent_count: number;
  };
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
