import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse, 
  Contact, 
  Company, 
  Deal, 
  Task, 
  Activity, 
  Product, 
  Quote, 
  Invoice, 
  DashboardStats,
  User,
  CustomField,
  CustomFieldValue,
  Campaign,
  SalesOrder,
  PurchaseOrder,
  Contract,
  Workflow,
  EmailTemplate,
  Segment,
  Tag,
  Label
} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(email: string, password: string): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.baseUrl}/auth/login`, {
      email,
      password
    });
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }): Observable<ApiResponse<{ user: User; token: string }>> {
    return this.http.post<ApiResponse<{ user: User; token: string }>>(`${this.baseUrl}/auth/register`, data);
  }

  logout(): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/logout`, {});
  }

  getCurrentUser(): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/auth/user`);
  }

  // Dashboard
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard`);
  }

  // Contacts
  getContacts(params?: { page?: number; per_page?: number; search?: string }): Observable<PaginatedResponse<Contact>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedResponse<Contact>>(`${this.baseUrl}/contacts`, { params: httpParams });
  }

  getContact(id: number): Observable<ApiResponse<Contact>> {
    return this.http.get<ApiResponse<Contact>>(`${this.baseUrl}/contacts/${id}`);
  }

  createContact(data: Partial<Contact>): Observable<ApiResponse<Contact>> {
    return this.http.post<ApiResponse<Contact>>(`${this.baseUrl}/contacts`, data);
  }

  updateContact(id: number, data: Partial<Contact>): Observable<ApiResponse<Contact>> {
    return this.http.put<ApiResponse<Contact>>(`${this.baseUrl}/contacts/${id}`, data);
  }

  deleteContact(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/contacts/${id}`);
  }

  // Companies
  getCompanies(params?: { page?: number; per_page?: number; search?: string }): Observable<PaginatedResponse<Company>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedResponse<Company>>(`${this.baseUrl}/companies`, { params: httpParams });
  }

  getCompany(id: number): Observable<ApiResponse<Company>> {
    return this.http.get<ApiResponse<Company>>(`${this.baseUrl}/companies/${id}`);
  }

  createCompany(data: Partial<Company>): Observable<ApiResponse<Company>> {
    return this.http.post<ApiResponse<Company>>(`${this.baseUrl}/companies`, data);
  }

  updateCompany(id: number, data: Partial<Company>): Observable<ApiResponse<Company>> {
    return this.http.put<ApiResponse<Company>>(`${this.baseUrl}/companies/${id}`, data);
  }

  deleteCompany(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/companies/${id}`);
  }

  // Deals
  getDeals(params?: { page?: number; per_page?: number; search?: string; stage?: string }): Observable<PaginatedResponse<Deal>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.stage) httpParams = httpParams.set('stage', params.stage);
    }
    return this.http.get<PaginatedResponse<Deal>>(`${this.baseUrl}/deals`, { params: httpParams });
  }

  getDeal(id: number): Observable<ApiResponse<Deal>> {
    return this.http.get<ApiResponse<Deal>>(`${this.baseUrl}/deals/${id}`);
  }

  createDeal(data: Partial<Deal>): Observable<ApiResponse<Deal>> {
    return this.http.post<ApiResponse<Deal>>(`${this.baseUrl}/deals`, data);
  }

  updateDeal(id: number, data: Partial<Deal>): Observable<ApiResponse<Deal>> {
    return this.http.put<ApiResponse<Deal>>(`${this.baseUrl}/deals/${id}`, data);
  }

  deleteDeal(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/deals/${id}`);
  }

  updateDealStage(id: number, stage: string): Observable<ApiResponse<Deal>> {
    return this.http.put<ApiResponse<Deal>>(`${this.baseUrl}/deals/${id}/stage`, { stage });
  }

  // Tasks
  getTasks(params?: { page?: number; per_page?: number; status?: string; assigned_to?: number }): Observable<PaginatedResponse<Task>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.assigned_to) httpParams = httpParams.set('assigned_to', params.assigned_to.toString());
    }
    return this.http.get<PaginatedResponse<Task>>(`${this.baseUrl}/tasks`, { params: httpParams });
  }

  getTask(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(data: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.baseUrl}/tasks`, data);
  }

  updateTask(id: number, data: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}`, data);
  }

  deleteTask(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/tasks/${id}`);
  }

  completeTask(id: number): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}/complete`, {});
  }

  // Activities
  getActivities(params?: { page?: number; per_page?: number; type?: string; related_to_type?: string; related_to_id?: number }): Observable<PaginatedResponse<Activity>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.related_to_type) httpParams = httpParams.set('related_to_type', params.related_to_type);
      if (params.related_to_id) httpParams = httpParams.set('related_to_id', params.related_to_id.toString());
    }
    return this.http.get<PaginatedResponse<Activity>>(`${this.baseUrl}/activities`, { params: httpParams });
  }

  createActivity(data: Partial<Activity>): Observable<ApiResponse<Activity>> {
    return this.http.post<ApiResponse<Activity>>(`${this.baseUrl}/activities`, data);
  }

  getActivity(id: number): Observable<ApiResponse<Activity>> {
    return this.http.get<ApiResponse<Activity>>(`${this.baseUrl}/activities/${id}`);
  }

  updateActivity(id: number, data: Partial<Activity>): Observable<ApiResponse<Activity>> {
    return this.http.put<ApiResponse<Activity>>(`${this.baseUrl}/activities/${id}`, data);
  }

  deleteActivity(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/activities/${id}`);
  }

  // Products
  getProducts(params?: { page?: number; per_page?: number; search?: string }): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedResponse<Product>>(`${this.baseUrl}/products`, { params: httpParams });
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/products`, data);
  }

  updateProduct(id: number, data: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/products/${id}`);
  }

  // Quotes
  getQuotes(params?: { page?: number; per_page?: number; status?: string }): Observable<PaginatedResponse<Quote>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedResponse<Quote>>(`${this.baseUrl}/quotes`, { params: httpParams });
  }

  getQuote(id: number): Observable<ApiResponse<Quote>> {
    return this.http.get<ApiResponse<Quote>>(`${this.baseUrl}/quotes/${id}`);
  }

  createQuote(data: Partial<Quote>): Observable<ApiResponse<Quote>> {
    return this.http.post<ApiResponse<Quote>>(`${this.baseUrl}/quotes`, data);
  }

  updateQuote(id: number, data: Partial<Quote>): Observable<ApiResponse<Quote>> {
    return this.http.put<ApiResponse<Quote>>(`${this.baseUrl}/quotes/${id}`, data);
  }

  deleteQuote(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/quotes/${id}`);
  }

  // Invoices
  getInvoices(params?: { page?: number; per_page?: number; status?: string }): Observable<PaginatedResponse<Invoice>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<PaginatedResponse<Invoice>>(`${this.baseUrl}/invoices`, { params: httpParams });
  }

  getInvoice(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.baseUrl}/invoices/${id}`);
  }

  createInvoice(data: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/invoices`, data);
  }

  updateInvoice(id: number, data: Partial<Invoice>): Observable<ApiResponse<Invoice>> {
    return this.http.put<ApiResponse<Invoice>>(`${this.baseUrl}/invoices/${id}`, data);
  }

  deleteInvoice(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/invoices/${id}`);
  }

  // Users (for assignment)
  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`);
  }

  // Custom Fields
  getCustomFields(module: string): Observable<ApiResponse<CustomField[]>> {
    return this.http.get<ApiResponse<CustomField[]>>(`${this.baseUrl}/custom-fields`, {
      params: { module }
    });
  }

  createCustomField(data: Partial<CustomField>): Observable<ApiResponse<CustomField>> {
    return this.http.post<ApiResponse<CustomField>>(`${this.baseUrl}/custom-fields`, data);
  }

  updateCustomField(id: number, data: Partial<CustomField>): Observable<ApiResponse<CustomField>> {
    return this.http.put<ApiResponse<CustomField>>(`${this.baseUrl}/custom-fields/${id}`, data);
  }

  deleteCustomField(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/custom-fields/${id}`);
  }

  // File Upload
  uploadPhoto(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // ==================== CAMPAIGNS ====================
  getCampaigns(params?: { page?: number; per_page?: number; status?: string; type?: string; search?: string }): Observable<PaginatedResponse<Campaign>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedResponse<Campaign>>(`${this.baseUrl}/campaigns`, { params: httpParams });
  }

  getCampaign(id: number): Observable<ApiResponse<Campaign>> {
    return this.http.get<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}`);
  }

  createCampaign(data: Partial<Campaign>): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns`, data);
  }

  updateCampaign(id: number, data: Partial<Campaign>): Observable<ApiResponse<Campaign>> {
    return this.http.put<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}`, data);
  }

  deleteCampaign(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/campaigns/${id}`);
  }

  duplicateCampaign(id: number): Observable<ApiResponse<Campaign>> {
    return this.http.post<ApiResponse<Campaign>>(`${this.baseUrl}/campaigns/${id}/duplicate`, {});
  }

  getCampaignStatistics(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/campaigns/${id}/statistics`);
  }

  // ==================== SALES ORDERS ====================
  getSalesOrders(params?: { page?: number; per_page?: number; status?: string; customer_id?: number; search?: string }): Observable<PaginatedResponse<SalesOrder>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.customer_id) httpParams = httpParams.set('customer_id', params.customer_id.toString());
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<PaginatedResponse<SalesOrder>>(`${this.baseUrl}/sales-orders`, { params: httpParams });
  }

  getSalesOrder(id: number): Observable<ApiResponse<SalesOrder>> {
    return this.http.get<ApiResponse<SalesOrder>>(`${this.baseUrl}/sales-orders/${id}`);
  }

  createSalesOrder(data: Partial<SalesOrder>): Observable<ApiResponse<SalesOrder>> {
    return this.http.post<ApiResponse<SalesOrder>>(`${this.baseUrl}/sales-orders`, data);
  }

  updateSalesOrder(id: number, data: Partial<SalesOrder>): Observable<ApiResponse<SalesOrder>> {
    return this.http.put<ApiResponse<SalesOrder>>(`${this.baseUrl}/sales-orders/${id}`, data);
  }

  deleteSalesOrder(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/sales-orders/${id}`);
  }

  convertSalesOrderToInvoice(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.post<ApiResponse<Invoice>>(`${this.baseUrl}/sales-orders/${id}/convert-to-invoice`, {});
  }

  // ==================== PURCHASE ORDERS ====================
  getPurchaseOrders(params?: { page?: number; per_page?: number; status?: string; vendor_id?: number }): Observable<PaginatedResponse<PurchaseOrder>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.vendor_id) httpParams = httpParams.set('vendor_id', params.vendor_id.toString());
    }
    return this.http.get<PaginatedResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders`, { params: httpParams });
  }

  getPurchaseOrder(id: number): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  createPurchaseOrder(data: Partial<PurchaseOrder>): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders`, data);
  }

  updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.put<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders/${id}`, data);
  }

  deletePurchaseOrder(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  // ==================== CONTRACTS ====================
  getContracts(params?: { page?: number; per_page?: number; status?: string; type?: string }): Observable<PaginatedResponse<Contract>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.status) httpParams = httpParams.set('status', params.status);
      if (params.type) httpParams = httpParams.set('type', params.type);
    }
    return this.http.get<PaginatedResponse<Contract>>(`${this.baseUrl}/contracts`, { params: httpParams });
  }

  getContract(id: number): Observable<ApiResponse<Contract>> {
    return this.http.get<ApiResponse<Contract>>(`${this.baseUrl}/contracts/${id}`);
  }

  createContract(data: Partial<Contract>): Observable<ApiResponse<Contract>> {
    return this.http.post<ApiResponse<Contract>>(`${this.baseUrl}/contracts`, data);
  }

  updateContract(id: number, data: Partial<Contract>): Observable<ApiResponse<Contract>> {
    return this.http.put<ApiResponse<Contract>>(`${this.baseUrl}/contracts/${id}`, data);
  }

  deleteContract(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/contracts/${id}`);
  }

  sendContractForSignature(id: number, data: { subject: string; message?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/contracts/${id}/send-for-signature`, data);
  }

  signContract(id: number, data: { signer_id: number; signature: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/contracts/${id}/sign`, data);
  }

  // ==================== WORKFLOWS ====================
  getWorkflows(params?: { is_active?: boolean; trigger_type?: string }): Observable<ApiResponse<Workflow[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.is_active !== undefined) httpParams = httpParams.set('is_active', params.is_active.toString());
      if (params.trigger_type) httpParams = httpParams.set('trigger_type', params.trigger_type);
    }
    return this.http.get<ApiResponse<Workflow[]>>(`${this.baseUrl}/workflows`, { params: httpParams });
  }

  getWorkflow(id: number): Observable<ApiResponse<Workflow>> {
    return this.http.get<ApiResponse<Workflow>>(`${this.baseUrl}/workflows/${id}`);
  }

  createWorkflow(data: Partial<Workflow>): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(`${this.baseUrl}/workflows`, data);
  }

  updateWorkflow(id: number, data: Partial<Workflow>): Observable<ApiResponse<Workflow>> {
    return this.http.put<ApiResponse<Workflow>>(`${this.baseUrl}/workflows/${id}`, data);
  }

  deleteWorkflow(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/workflows/${id}`);
  }

  activateWorkflow(id: number): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(`${this.baseUrl}/workflows/${id}/activate`, {});
  }

  deactivateWorkflow(id: number): Observable<ApiResponse<Workflow>> {
    return this.http.post<ApiResponse<Workflow>>(`${this.baseUrl}/workflows/${id}/deactivate`, {});
  }

  // ==================== EMAIL TEMPLATES ====================
  getEmailTemplates(params?: { category?: string; search?: string }): Observable<ApiResponse<EmailTemplate[]>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }
    return this.http.get<ApiResponse<EmailTemplate[]>>(`${this.baseUrl}/email-templates`, { params: httpParams });
  }

  getEmailTemplate(id: number): Observable<ApiResponse<EmailTemplate>> {
    return this.http.get<ApiResponse<EmailTemplate>>(`${this.baseUrl}/email-templates/${id}`);
  }

  createEmailTemplate(data: Partial<EmailTemplate>): Observable<ApiResponse<EmailTemplate>> {
    return this.http.post<ApiResponse<EmailTemplate>>(`${this.baseUrl}/email-templates`, data);
  }

  updateEmailTemplate(id: number, data: Partial<EmailTemplate>): Observable<ApiResponse<EmailTemplate>> {
    return this.http.put<ApiResponse<EmailTemplate>>(`${this.baseUrl}/email-templates/${id}`, data);
  }

  deleteEmailTemplate(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/email-templates/${id}`);
  }

  previewEmailTemplate(id: number, variables?: Record<string, any>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/email-templates/${id}/preview`, { variables });
  }

  // ==================== SEND EMAIL ====================
  sendEmail(data: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    template_id?: number;
    variables?: Record<string, any>;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/email/send`, data);
  }

  sendEmailToContact(contactId: number, data: {
    subject: string;
    body: string;
    template_id?: number;
    variables?: Record<string, any>;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/contacts/${contactId}/send-email`, data);
  }

  getEmailHistory(params?: { page?: number; per_page?: number; contact_id?: number }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.contact_id) httpParams = httpParams.set('contact_id', params.contact_id.toString());
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/email/history`, { params: httpParams });
  }

  // ==================== TAGS ====================
  getTags(params?: { entity_type?: string }): Observable<ApiResponse<Tag[]>> {
    let httpParams = new HttpParams();
    if (params?.entity_type) httpParams = httpParams.set('entity_type', params.entity_type);
    return this.http.get<ApiResponse<Tag[]>>(`${this.baseUrl}/tags`, { params: httpParams });
  }

  createTag(data: Partial<Tag>): Observable<ApiResponse<Tag>> {
    return this.http.post<ApiResponse<Tag>>(`${this.baseUrl}/tags`, data);
  }

  updateTag(id: number, data: Partial<Tag>): Observable<ApiResponse<Tag>> {
    return this.http.put<ApiResponse<Tag>>(`${this.baseUrl}/tags/${id}`, data);
  }

  deleteTag(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/tags/${id}`);
  }

  assignTag(tagId: number, entityType: string, entityIds: number[]): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/tags/${tagId}/assign`, { entity_type: entityType, entity_ids: entityIds });
  }

  // ==================== LABELS ====================
  getLabels(params?: { entity_type?: string }): Observable<ApiResponse<Label[]>> {
    let httpParams = new HttpParams();
    if (params?.entity_type) httpParams = httpParams.set('entity_type', params.entity_type);
    return this.http.get<ApiResponse<Label[]>>(`${this.baseUrl}/labels`, { params: httpParams });
  }

  createLabel(data: Partial<Label>): Observable<ApiResponse<Label>> {
    return this.http.post<ApiResponse<Label>>(`${this.baseUrl}/labels`, data);
  }

  updateLabel(id: number, data: Partial<Label>): Observable<ApiResponse<Label>> {
    return this.http.put<ApiResponse<Label>>(`${this.baseUrl}/labels/${id}`, data);
  }

  deleteLabel(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/labels/${id}`);
  }

  // ==================== SEGMENTS ====================
  getSegments(params?: { type?: string }): Observable<ApiResponse<Segment[]>> {
    let httpParams = new HttpParams();
    if (params?.type) httpParams = httpParams.set('type', params.type);
    return this.http.get<ApiResponse<Segment[]>>(`${this.baseUrl}/segments`, { params: httpParams });
  }

  getSegment(id: number): Observable<ApiResponse<Segment>> {
    return this.http.get<ApiResponse<Segment>>(`${this.baseUrl}/segments/${id}`);
  }

  createSegment(data: Partial<Segment>): Observable<ApiResponse<Segment>> {
    return this.http.post<ApiResponse<Segment>>(`${this.baseUrl}/segments`, data);
  }

  updateSegment(id: number, data: Partial<Segment>): Observable<ApiResponse<Segment>> {
    return this.http.put<ApiResponse<Segment>>(`${this.baseUrl}/segments/${id}`, data);
  }

  deleteSegment(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/segments/${id}`);
  }

  analyzeSegment(id: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/segments/${id}/analyze`, {});
  }

  // ==================== ANALYTICS ====================
  getAnalyticsOverview(params?: { from_date?: string; to_date?: string }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params?.from_date) httpParams = httpParams.set('from_date', params.from_date);
    if (params?.to_date) httpParams = httpParams.set('to_date', params.to_date);
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/overview`, { params: httpParams });
  }

  getAnalyticsSales(params?: { from_date?: string; to_date?: string }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params?.from_date) httpParams = httpParams.set('from_date', params.from_date);
    if (params?.to_date) httpParams = httpParams.set('to_date', params.to_date);
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/sales`, { params: httpParams });
  }

  getAnalyticsPipeline(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics/pipeline`);
  }

  // ==================== FORECASTING ====================
  getForecastPredictions(params?: { period?: number; from_date?: string }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params?.period) httpParams = httpParams.set('period', params.period.toString());
    if (params?.from_date) httpParams = httpParams.set('from_date', params.from_date);
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/forecasting/predictions`, { params: httpParams });
  }

  analyzeForecast(data: { deal_stage?: string; time_period?: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/forecasting/analyze`, data);
  }

  // ==================== DUPLICATES ====================
  checkDuplicates(entityType: string, entityId?: number): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams().set('entity_type', entityType);
    if (entityId) httpParams = httpParams.set('entity_id', entityId.toString());
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/duplicates/check`, { params: httpParams });
  }

  mergeDuplicates(data: { entity_type: string; primary_id: number; secondary_ids: number[]; merge_strategy?: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/duplicates/merge`, data);
  }

  // ==================== DATA ENRICHMENT ====================
  enrichEntity(entityType: string, entityId: number, provider?: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/enrichment/enrich`, {
      entity_type: entityType,
      entity_id: entityId,
      provider
    });
  }

  getEnrichmentProviders(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/enrichment/providers`);
  }

  // ==================== CALLS (TELEPHONY) ====================
  getCalls(params?: { page?: number; per_page?: number; call_type?: string; status?: string }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.call_type) httpParams = httpParams.set('call_type', params.call_type);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/calls`, { params: httpParams });
  }

  getCall(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/calls/${id}`);
  }

  createCall(data: Partial<any>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/calls`, data);
  }

  updateCall(id: number, data: Partial<any>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/calls/${id}`, data);
  }

  deleteCall(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/calls/${id}`);
  }

  // ==================== SOCIAL POSTS ====================
  getSocialPosts(params?: { page?: number; per_page?: number; platform?: string; status?: string }): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
      if (params.platform) httpParams = httpParams.set('platform', params.platform);
      if (params.status) httpParams = httpParams.set('status', params.status);
    }
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/social-posts`, { params: httpParams });
  }

  getSocialPost(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/social-posts/${id}`);
  }

  createSocialPost(data: Partial<any>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/social-posts`, data);
  }

  updateSocialPost(id: number, data: Partial<any>): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/social-posts/${id}`, data);
  }

  deleteSocialPost(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/social-posts/${id}`);
  }
}
