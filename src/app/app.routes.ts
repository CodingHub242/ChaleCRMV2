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
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
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
      // // Contacts
      // {
      //   path: 'contacts',
      //   component: ContactsListPage
      // },
      // {
      //   path: 'contacts/new',
      //   component: ContactFormPage
      // },
      // {
      //   path: 'contacts/:id',
      //   component: ContactFormPage
      // },
      // // Companies
      // {
      //   path: 'companies',
      //   component: CompaniesListPage
      // },
      // {
      //   path: 'companies/new',
      //   component: CompanyFormPage
      // },
      // {
      //   path: 'companies/:id',
      //   component: CompanyFormPage
      // },
      // // Deals
      // {
      //   path: 'deals',
      //   component: DealsListPage
      // },
      // {
      //   path: 'deals/new',
      //   component: DealFormPage
      // },
      // {
      //   path: 'deals/:id',
      //   component: DealFormPage
      // },
      // // Tasks
      // {
      //   path: 'tasks',
      //   component: TasksListPage
      // },
      // {
      //   path: 'tasks/new',
      //   component: TaskFormPage
      // },
      // {
      //   path: 'tasks/:id',
      //   component: TaskFormPage
      // },
      // // Activities
      // {
      //   path: 'activities',
      //   component: ActivitiesListPage
      // },
      // {
      //   path: 'activities/new',
      //   component: ActivityFormPage
      // },
      // {
      //   path: 'activities/:id',
      //   component: ActivityFormPage
      // },
      // // Products
      // {
      //   path: 'products',
      //   component: ProductsListPage
      // },
      // {
      //   path: 'products/new',
      //   component: ProductFormPage
      // },
      // {
      //   path: 'products/:id',
      //   component: ProductFormPage
      // },
      // // Quotes
      // {
      //   path: 'quotes',
      //   component: QuotesListPage
      // },
      // {
      //   path: 'quotes/new',
      //   component: QuoteFormPage
      // },
      // {
      //   path: 'quotes/:id',
      //   component: QuoteFormPage
      // },
      // // Invoices
      // {
      //   path: 'invoices',
      //   component: InvoicesListPage
      // },
      // {
      //   path: 'invoices/new',
      //   component: InvoiceFormPage
      // },
      // {
      //   path: 'invoices/:id',
      //   component: InvoiceFormPage
      // }
    ]
  },
  
  // Redirect unknown routes to login
  {
    path: '**',
    redirectTo: 'login'
  },
  {
    path: 'main-layout',
    loadComponent: () => import('./features/layout/main-layout/main-layout.page').then( m => m.MainLayoutPage)
  },
  
];
