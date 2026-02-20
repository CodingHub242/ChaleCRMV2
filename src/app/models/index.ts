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
  name?: string; // Computed full name
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
  sku?: string;
  category?: string;
  description?: string;
  unit_price: number;
  quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
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

// ==================== NEW MODELS ====================

// Campaign Model
export interface Campaign {
  id: number;
  name: string;
  type: 'email' | 'social' | 'event' | 'advertising' | 'other';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget?: number;
  start_date?: string;
  end_date?: string;
  target_audience?: any[];
  description?: string;
  goals?: string;
  emails_sent?: number;
  emails_opened?: number;
  emails_clicked?: number;
  created_at: string;
  updated_at: string;
}

// Sales Order Model
export interface SalesOrder {
  id: number;
  order_number: string;
  customer_id: number;
  customer?: Contact;
  deal_id?: number;
  deal?: Deal;
  order_date: string;
  due_date?: string;
  status: 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  notes?: string;
  terms?: string;
  shipping_address?: string;
  billing_address?: string;
  items: SalesOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: number;
  product_id: number;
  product?: Product;
  description?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  amount: number;
}

// Purchase Order Model
export interface PurchaseOrder {
  id: number;
  order_number: string;
  vendor_id: number;
  vendor?: Company;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'submitted' | 'approved' | 'ordered' | 'received' | 'partial' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  notes?: string;
  shipping_address?: string;
  billing_address?: string;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: number;
  product_id: number;
  product?: Product;
  description?: string;
  quantity: number;
  quantity_received?: number;
  unit_price: number;
  discount: number;
  amount: number;
}

// Contract Model
export interface Contract {
  id: number;
  title: string;
  type: 'sales' | 'service' | 'nda' | 'employment' | 'partnership' | 'other';
  customer_id?: number;
  customer?: Contact;
  company_id?: number;
  company?: Company;
  deal_id?: number;
  deal?: Deal;
  start_date: string;
  end_date?: string;
  value?: number;
  status: 'draft' | 'pending' | 'active' | 'expired' | 'terminated' | 'cancelled';
  content?: string;
  signers?: ContractSigner[];
  created_at: string;
  updated_at: string;
}

export interface ContractSigner {
  id: number;
  name: string;
  email: string;
  signed_at?: string;
  signature?: string;
  ip_address?: string;
}

// Workflow Model
export interface Workflow {
  id: number;
  name: string;
  description?: string;
  trigger_type: 'record_created' | 'record_updated' | 'record_deleted' | 'field_changed' | 'scheduled';
  trigger_conditions?: any[];
  actions: WorkflowAction[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  type: 'send_email' | 'update_field' | 'create_task' | 'add_to_list' | 'remove_from_list' | 'webhook' | 'notification';
  config: any;
}

// Email Template Model
export interface EmailTemplate {
  id: number;
  name: string;
  category: 'lead' | 'deal' | 'invoice' | 'quote' | 'contact' | 'company' | 'custom';
  subject: string;
  body: string;
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Document Template Model
export interface DocumentTemplate {
  id: number;
  name: string;
  type: 'proposal' | 'contract' | 'invoice' | 'quote' | 'report' | 'other';
  content: string;
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Segment Model
export interface Segment {
  id: number;
  name: string;
  type: 'contact' | 'company' | 'lead' | 'deal';
  description?: string;
  conditions: SegmentCondition[];
  logic: 'and' | 'or';
  contacts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SegmentCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'is_null' | 'is_not_null';
  value: any;
}

// Tag Model
export interface Tag {
  id: number;
  name: string;
  entity_type: 'contact' | 'company' | 'deal' | 'lead' | 'invoice' | 'quote';
  color?: string;
  contacts_count?: number;
  companies_count?: number;
  deals_count?: number;
  created_at: string;
  updated_at: string;
}

// Label Model
export interface Label {
  id: number;
  name: string;
  entity_type: 'contact' | 'company' | 'deal' | 'lead' | 'invoice' | 'quote' | 'task';
  color?: string;
  created_at: string;
  updated_at: string;
}

// Call Model (Telephony)
export interface Call {
  id: number;
  call_type: 'inbound' | 'outbound';
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'voicemail' | 'failed';
  subject?: string;
  phone_number: string;
  duration?: number;
  notes?: string;
  recording_url?: string;
  contact_id?: number;
  contact?: Contact;
  company_id?: number;
  company?: Company;
  deal_id?: number;
  deal?: Deal;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

// Social Post Model
export interface SocialPost {
  id: number;
  platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'youtube';
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  media_urls?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  owner_id: number;
  created_at: string;
  updated_at: string;
}
