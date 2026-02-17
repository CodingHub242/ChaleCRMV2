import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../../models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'bigin_token';
  private userKey = 'bigin_user';

  constructor(
    private api: ApiService,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    if (storedUser && token) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(email: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.api.login(email, password).subscribe({
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

  logout(): void {
    if (this.isLoggedIn) {
      this.api.logout().subscribe({
        next: () => {},
        error: () => {}
      });
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
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
