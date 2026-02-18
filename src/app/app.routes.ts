import { Routes } from '@angular/router';
// Auth
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';
import { HomePage } from './home/home.page';
import { AuthGuard } from './core/guards/auth.guard';

// export const routes: Routes = [
//   {
//     path: 'home',
//     loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
//   },
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full',
//   },
//   {
//     path: 'login',
//     loadComponent: () => import('./features/auth/login/login.page').then( m => m.LoginPage)
//   },
//   {
//     path: 'register',
//     loadComponent: () => import('./features/auth/register/register.page').then( m => m.RegisterPage)
//   },
// ];
export const routes: Routes = [
  // Auth routes (no layout)
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  
  // Home/Dashboard route
  {
    path: 'home',
    component: HomePage,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  
  // Root path - redirect to home or login based on auth
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  
  // Redirect unknown routes to login
  {
    path: '**',
    redirectTo: 'login'
  }
];
