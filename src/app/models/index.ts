// Custom Field Model
export interface CustomField {
  id: number;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[];
  default_value?: string;
  module: 'contact' | 'company' | 'deal' | 'task' | 'invoice' | 'quote' | 'product';
  display_order: number;
}

// Custom Field Value
export interface CustomFieldValue {
  id: number;
  entity_id: number;
  field_id: number;
  value: string;
}

// User Model
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'manager';
  created_at: string;
  updated_at: string;
}

// Contact Model
export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  mobile?: string;
  company_id?: number;
  company?: Company;
  owner_id: number;
  owner?: User;
  lead_status?: string;
  source?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: CustomFieldValue[];
}

// Company Model
export interface Company {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  logo?: string;
  owner_id: number;
  owner?: User;
  created_at: string;
  updated_at: string;
  custom_fields?: CustomFieldValue[];
}

// Deal/Pipeline Model
export interface Deal {
  id: number;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  expected_close_date: string;
  contact_id?: number;
  contact?: Contact;
  company_id?: number;
  company?: Company;
  owner_id: number;
  owner?: User;
  description?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: CustomFieldValue[];
}

// Pipeline Stage Model
export interface PipelineStage {
  id: string;
  name: string;
  display_order: number;
  probability: number;
  won: boolean;
  lost: boolean;
}

// Task Model
export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  related_to_type?: 'contact' | 'company' | 'deal';
  related_to_id?: number;
  assigned_to: number;
  assigned_to_user?: User;
  owner_id: number;
  reminder?: string;
  created_at: string;
  updated_at: string;
  custom_fields?: CustomFieldValue[];
}

// Activity Models
export interface Activity {
  id: number;
  type: 'call' | 'meeting' | 'note' | 'email';
  title: string;
  description?: string;
  due_date?: string;
  duration?: number;
  participants?: string[];
  related_to_type?: 'contact' | 'company' | 'deal';
  related_to_id?: number;
  owner_id: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

// Call Activity
export interface CallActivity extends Activity {
  type: 'call';
  call_type: 'outbound' | 'inbound';
  call_duration: number;
  call_result?: string;
}

// Meeting Activity
export interface MeetingActivity extends Activity {
  type: 'meeting';
  location?: string;
  meeting_link?: string;
}

// Note Activity
export interface NoteActivity extends Activity {
  type: 'note';
}

// Product Model
export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  unit_price: number;
  currency: string;
  unit?: string;
  quantity?: number;
  owner_id: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Quote Model
export interface Quote {
  id: number;
  quote_number: string;
  contact_id: number;
  contact?: Contact;
  company_id?: number;
  company?: Company;
  deal_id?: number;
  subject: string;
  status: 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
  expiration_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  terms?: string;
  owner_id: number;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: number;
  product_id?: number;
  product?: Product;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  amount: number;
}

// Invoice Model
export interface Invoice {
  id: number;
  invoice_number: string;
  quote_id?: number;
  quote?: Quote;
  contact_id: number;
  contact?: Contact;
  company_id?: number;
  company?: Company;
  subject: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  currency: string;
  paid_amount: number;
  balance_due: number;
  terms?: string;
  owner_id: number;
  items: InvoiceItem[];
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: number;
  product_id?: number;
  product?: Product;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  amount: number;
}

export interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_contacts: number;
  total_companies: number;
  total_deals: number;
  total_deals_value: number;
  won_deals: number;
  won_deals_value: number;
  open_tasks: number;
  overdue_tasks: number;
  activities_this_week: number;
  deals_by_stage: { stage: string; count: number; value: number }[];
  recent_activities: Activity[];
}

// API Response Interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
