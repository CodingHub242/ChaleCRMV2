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
  CustomFieldValue
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
}
