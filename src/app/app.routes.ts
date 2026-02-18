import { Routes } from '@angular/router';
// Auth
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';
import { HomePage } from './home/home.page';
import { AuthGuard } from './core/guards/auth.guard';

// Layout
import { MainLayoutPage } from './features/layout/main-layout/main-layout.page';

// Dashboard
import { DashboardPage } from './features/dashboard/dashboard.page';

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
    loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then(m => m.RegisterPage)
  },
  
  // Main app routes with sidebar layout
  {
    path: '',
    component: MainLayoutPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardPage
      },
    ],
    },
  
  
  // Redirect unknown routes to login
  {
    path: '**',
    redirectTo: 'login'
  }
];
