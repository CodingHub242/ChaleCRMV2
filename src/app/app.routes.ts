import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// Auth
import { LoginPage } from './features/auth/login/login.page';
import { RegisterPage } from './features/auth/register/register.page';

// Layout
import { MainLayoutPage } from './features/layout/main-layout/main-layout.page';

// Dashboard
import { DashboardPage } from './features/dashboard/dashboard.page';

// // Contacts
// import { ContactsListPage } from './features/contacts/contacts-list/contacts-list.page';
// import { ContactFormPage } from './features/contacts/contact-form/contact-form.page';

// // Companies
// import { CompaniesListPage } from './features/companies/companies-list/companies-list.page';
// import { CompanyFormPage } from './features/companies/company-form/company-form.page';

// // Deals
// import { DealsListPage } from './features/deals/deals-list/deals-list.page';
// import { DealFormPage } from './features/deals/deal-form/deal-form.page';

// // Tasks
// import { TasksListPage } from './features/tasks/tasks-list/tasks-list.page';
// import { TaskFormPage } from './features/tasks/task-form/task-form.page';

// // Activities
// import { ActivitiesListPage } from './features/activities/activities-list/activities-list.page';
// import { ActivityFormPage } from './features/activities/activity-form/activity-form.page';

// // Products
// import { ProductsListPage } from './features/products/products-list/products-list.page';
// import { ProductFormPage } from './features/products/product-form/product-form.page';

// // Quotes
// import { QuotesListPage } from './features/quotes/quotes-list/quotes-list.page';
// import { QuoteFormPage } from './features/quotes/quote-form/quote-form.page';

// // Invoices
// import { InvoicesListPage } from './features/invoices/invoices-list/invoices-list.page';
// import { InvoiceFormPage } from './features/invoices/invoice-form/invoice-form.page';

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
  // Auth routes
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
  }
];
