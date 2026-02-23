import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, Organization } from '../../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentOrganizationSubject = new BehaviorSubject<Organization | null>(null);
  public currentOrganization$ = this.currentOrganizationSubject.asObservable();

  private tokenKey = 'bigin_token';
  private userKey = 'bigin_user';
  private organizationKey = 'bigin_organization';

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    const storedOrg = localStorage.getItem(this.organizationKey);
    
    if (storedUser && token) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
    
    if (storedOrg) {
      this.currentOrganizationSubject.next(JSON.parse(storedOrg));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get currentOrganization(): Organization | null {
    return this.currentOrganizationSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get hasOrganization(): boolean {
    return !!this.currentOrganization;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isManager(): boolean {
    return this.currentUser?.role === 'manager';
  }

  get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.api.login(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
            
            // Check if user has organization
            if (response.data.has_organization) {
              this.fetchCurrentOrganization();
            }
            
            observer.next(response);
            observer.complete();
          } else {
            observer.error(response.message);
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return new Observable(observer => {
      this.api.register(data).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
            this.currentUserSubject.next(response.data.user);
            observer.next(response);
            observer.complete();
          } else {
            observer.error(response.message);
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Create a new organization for the current user
   */
  createOrganization(data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zip_code?: string;
    website?: string;
  }): Observable<any> {
    return new Observable(observer => {
      this.api.createOrganization(data).subscribe({
        next: (response) => {
          if (response.success) {
            localStorage.setItem(this.organizationKey, JSON.stringify(response.data));
            this.currentOrganizationSubject.next(response.data);
            
            // Update user in local storage
            if (this.currentUser) {
              const updatedUser = { ...this.currentUser, organization_id: response.data.id };
              localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
              this.currentUserSubject.next(updatedUser);
            }
            
            observer.next(response);
            observer.complete();
          } else {
            observer.error(response.message);
          }
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Fetch the current user's organization
   */
  fetchCurrentOrganization(): void {
    this.api.getCurrentOrganization().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          localStorage.setItem(this.organizationKey, JSON.stringify(response.data));
          this.currentOrganizationSubject.next(response.data);
        }
      },
      error: () => {
        // Handle error silently
      }
    });
  }

  /**
   * Get all users in the current organization
   */
  getOrganizationUsers(): Observable<any> {
    return this.api.getOrganizationUsers();
  }

  /**
   * Invite a new user to the organization
   */
  inviteUser(data: { name: string; email: string; phone?: string; role?: string }): Observable<any> {
    return this.api.inviteUser(data);
  }

  /**
   * Update user's role in the organization
   */
  updateUserRole(userId: number, role: string): Observable<any> {
    return this.api.updateUserRole(userId, role);
  }

  /**
   * Remove a user from the organization
   */
  removeUser(userId: number): Observable<any> {
    return this.api.removeUser(userId);
  }

  updateProfile(data: { name?: string; phone?: string; avatar?: string }): Observable<any> {
    return this.api.updateProfile(data);
  }

  logout(): void {
    if (this.isLoggedIn) {
      this.api.logout().subscribe({
        next: () => {},
        error: () => {}
      });
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.organizationKey);
    this.currentUserSubject.next(null);
    this.currentOrganizationSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshUser(): void {
    this.api.getCurrentUser().subscribe({
      next: (response) => {
        if (response.success) {
          this.currentUserSubject.next(response.data);
          localStorage.setItem(this.userKey, JSON.stringify(response.data));
        }
      },
      error: () => {
        this.logout();
      }
    });
  }
}
