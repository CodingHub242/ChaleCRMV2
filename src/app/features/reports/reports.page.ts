import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonMenuButton, IonButton, IonIcon, IonSelect, IonSelectOption, IonInput, IonPopover, IonList, IonItem, IonLabel, IonSpinner, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { downloadOutline, filterOutline, refreshOutline, documentTextOutline, trendingUpOutline, peopleOutline, cashOutline, calendarOutline, closeOutline, chevronDownOutline, chevronUpOutline, gridOutline, documentOutline } from 'ionicons/icons';
import { ApiService } from '../../core/services/api.service';

export interface ReportData {
  id: number;
  [key: string]: any;
}

export interface ReportConfig {
  id: string;
  title: string;
  icon: string;
  endpoint: string;
  columns: { key: string; label: string; sortable?: boolean; type?: 'text' | 'number' | 'currency' | 'date' | 'status' }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss']
})
export class ReportsPage implements OnInit {
  // Report configurations
  reportConfigs: ReportConfig[] = [
    {
      id: 'sales',
      title: 'Sales Report',
      icon: 'trending-up-outline',
      endpoint: 'reports/sales',
      columns: [
        { key: 'deal_name', label: 'Deal Name', sortable: true, type: 'text' },
        { key: 'customer', label: 'Customer', sortable: true, type: 'text' },
        { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
        { key: 'stage', label: 'Stage', sortable: true, type: 'status' },
        { key: 'closing_date', label: 'Closing Date', sortable: true, type: 'date' },
        { key: 'owner', label: 'Owner', sortable: true, type: 'text' }
      ]
    },
    {
      id: 'contacts',
      title: 'Contacts Report',
      icon: 'people-outline',
      endpoint: 'reports/contacts',
      columns: [
        { key: 'first_name', label: 'First Name', sortable: true, type: 'text' },
        { key: 'last_name', label: 'Last Name', sortable: true, type: 'text' },
        { key: 'email', label: 'Email', sortable: true, type: 'text' },
        { key: 'phone', label: 'Phone', sortable: true, type: 'text' },
        { key: 'company', label: 'Company', sortable: true, type: 'text' },
        { key: 'created_at', label: 'Created', sortable: true, type: 'date' }
      ]
    },
    {
      id: 'deals',
      title: 'Deals Report',
      icon: 'cash-outline',
      endpoint: 'reports/deals',
      columns: [
        { key: 'title', label: 'Deal Title', sortable: true, type: 'text' },
        { key: 'company', label: 'Company', sortable: true, type: 'text' },
        { key: 'contact', label: 'Contact', sortable: true, type: 'text' },
        { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
        { key: 'probability', label: 'Probability', sortable: true, type: 'number' },
        { key: 'stage', label: 'Stage', sortable: true, type: 'status' },
        { key: 'expected_close', label: 'Expected Close', sortable: true, type: 'date' }
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks Report',
      icon: 'checkbox-outline',
      endpoint: 'reports/tasks',
      columns: [
        { key: 'subject', label: 'Subject', sortable: true, type: 'text' },
        { key: 'related_to', label: 'Related To', sortable: true, type: 'text' },
        { key: 'due_date', label: 'Due Date', sortable: true, type: 'date' },
        { key: 'status', label: 'Status', sortable: true, type: 'status' },
        { key: 'priority', label: 'Priority', sortable: true, type: 'status' },
        { key: 'assigned_to', label: 'Assigned To', sortable: true, type: 'text' }
      ]
    },
    {
      id: 'invoices',
      title: 'Invoices Report',
      icon: 'document-text-outline',
      endpoint: 'reports/invoices',
      columns: [
        { key: 'invoice_number', label: 'Invoice #', sortable: true, type: 'text' },
        { key: 'customer', label: 'Customer', sortable: true, type: 'text' },
        { key: 'amount', label: 'Amount', sortable: true, type: 'currency' },
        { key: 'status', label: 'Status', sortable: true, type: 'status' },
        { key: 'issue_date', label: 'Issue Date', sortable: true, type: 'date' },
        { key: 'due_date', label: 'Due Date', sortable: true, type: 'date' }
      ]
    },
    {
      id: 'activity',
      title: 'Activity Report',
      icon: 'calendar-outline',
      endpoint: 'reports/activities',
      columns: [
        { key: 'activity_type', label: 'Type', sortable: true, type: 'text' },
        { key: 'subject', label: 'Subject', sortable: true, type: 'text' },
        { key: 'related_to', label: 'Related To', sortable: true, type: 'text' },
        { key: 'due_date', label: 'Due Date', sortable: true, type: 'date' },
        { key: 'status', label: 'Status', sortable: true, type: 'status' },
        { key: 'assigned_to', label: 'Assigned To', sortable: true, type: 'text' }
      ]
    }
  ];

  // State
  selectedReport: ReportConfig = this.reportConfigs[0];
  reportData: ReportData[] = [];
  isLoading = false;
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Filters
  showFilters = false;
  dateRange = 'this_month';
  filterStatus = '';
  searchQuery = '';

  // Date range options
  dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_quarter', label: 'This Quarter' },
    { value: 'this_year', label: 'This Year' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_quarter', label: 'Last Quarter' },
    { value: 'last_year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Summary stats
  summaryStats: { label: string; value: string | number; icon: string }[] = [];

  constructor(private api: ApiService) {
    addIcons({
      downloadOutline,
      filterOutline,
      refreshOutline,
      documentTextOutline,
      trendingUpOutline,
      peopleOutline,
      cashOutline,
      calendarOutline,
      closeOutline,
      chevronDownOutline,
      chevronUpOutline,
      gridOutline,
      documentOutline
    });
  }

  ngOnInit() {
    this.loadReport();
  }

  async loadReport(event?: any) {
    this.isLoading = true;
    
    try {
      // Map report types to actual API endpoints
      const endpointMap: Record<string, string> = {
        'sales': 'deals',
        'deals': 'deals',
        'contacts': 'contacts',
        'tasks': 'tasks',
        'invoices': 'invoices',
        'activity': 'activities'
      };
      
      const endpoint = endpointMap[this.selectedReport.id] || this.selectedReport.id;
      
      // Use the appropriate API method based on endpoint
      switch (endpoint) {
        case 'deals':
          this.api.getDeals({ per_page: 100 }).subscribe({
            next: (data: any) => {
              this.reportData = this.transformData(data.data || [], 'deals');
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            },
            error: () => {
              this.reportData = this.getMockData();
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            }
          });
          break;
          
        case 'contacts':
          this.api.getContacts({ per_page: 100 }).subscribe({
            next: (data: any) => {
              this.reportData = this.transformData(data.data || [], 'contacts');
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            },
            error: () => {
              this.reportData = this.getMockData();
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            }
          });
          break;
          
        case 'tasks':
          this.api.getTasks({ per_page: 100 }).subscribe({
            next: (data: any) => {
              this.reportData = this.transformData(data.data || [], 'tasks');
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            },
            error: () => {
              this.reportData = this.getMockData();
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            }
          });
          break;
          
        case 'invoices':
          this.api.getInvoices({ per_page: 100 }).subscribe({
            next: (data: any) => {
              this.reportData = this.transformData(data.data || [], 'invoices');
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            },
            error: () => {
              this.reportData = this.getMockData();
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            }
          });
          break;
          
        case 'activities':
          this.api.getActivities({ per_page: 100 }).subscribe({
            next: (data: any) => {
              this.reportData = this.transformData(data.data || [], 'activities');
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            },
            error: () => {
              this.reportData = this.getMockData();
              this.calculateSummary();
              this.isLoading = false;
              if (event) event.target.complete();
            }
          });
          break;
          
        default:
          this.reportData = this.getMockData();
          this.calculateSummary();
          this.isLoading = false;
          if (event) event.target.complete();
      }
    } catch (error) {
      this.reportData = this.getMockData();
      this.calculateSummary();
      this.isLoading = false;
      if (event) event.target.complete();
    }
  }

  // Transform API data to match report columns
  private transformData(data: any[], reportType: string): ReportData[] {
    switch (reportType) {
      case 'deals':
        return data.map((item: any) => ({
          id: item.id,
          deal_name: item.title || item.name,
          customer: item.contact?.first_name + ' ' + item.contact?.last_name || item.company?.name || '-',
          amount: item.amount || 0,
          stage: item.stage_name || item.stage || 'New',
          closing_date: item.closing_date || item.expected_close_date,
          owner: item.owner?.name || '-'
        }));
        
      case 'contacts':
        return data.map((item: any) => ({
          id: item.id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          phone: item.phone,
          company: item.company?.name || '-',
          created_at: item.created_at
        }));
        
      case 'tasks':
        return data.map((item: any) => ({
          id: item.id,
          subject: item.title || item.subject,
          related_to: item.deal?.title || item.contact?.first_name || '-',
          due_date: item.due_date,
          status: item.status,
          priority: item.priority || 'Normal',
          assigned_to: item.assigned_to?.name || '-'
        }));
        
      case 'invoices':
        return data.map((item: any) => ({
          id: item.id,
          invoice_number: item.invoice_number || 'INV-' + item.id,
          customer: item.customer?.name || item.contact?.first_name || '-',
          amount: item.total || item.amount || 0,
          status: item.status,
          issue_date: item.issue_date || item.created_at,
          due_date: item.due_date
        }));
        
      case 'activities':
        return data.map((item: any) => ({
          id: item.id,
          activity_type: item.type,
          subject: item.title || item.subject,
          related_to: item.deal?.title || item.contact?.first_name || '-',
          due_date: item.due_date || item.scheduled_date,
          status: item.status,
          assigned_to: item.assigned_to?.name || '-'
        }));
        
      default:
        return data;
    }
  }

  getMockData(): ReportData[] {
    const mockData: Record<string, ReportData[]> = {
      'sales': [
        { id: 1, deal_name: 'Enterprise License', customer: 'Acme Corp', amount: 45000, stage: 'Closed Won', closing_date: '2026-02-15', owner: 'John Doe' },
        { id: 2, deal_name: 'Startup Package', customer: 'Tech Start', amount: 12000, stage: 'Negotiation', closing_date: '2026-03-10', owner: 'Jane Smith' },
        { id: 3, deal_name: 'Consulting Services', customer: 'Global Inc', amount: 25000, stage: 'Proposal', closing_date: '2026-03-20', owner: 'John Doe' },
        { id: 4, deal_name: 'Annual Support', customer: 'SmallBiz LLC', amount: 8000, stage: 'Qualification', closing_date: '2026-04-01', owner: 'Jane Smith' },
        { id: 5, deal_name: 'Custom Development', customer: 'Innovation Co', amount: 75000, stage: 'Closed Won', closing_date: '2026-01-20', owner: 'Mike Johnson' },
      ],
      'contacts': [
        { id: 1, first_name: 'John', last_name: 'Smith', email: 'john.smith@acme.com', phone: '+233 20 123 4567', company: 'Acme Corp', created_at: '2026-01-15' },
        { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@techstart.com', phone: '+233 30 987 6543', company: 'Tech Start', created_at: '2026-02-01' },
        { id: 3, first_name: 'Michael', last_name: 'Brown', email: 'mbrown@global.com', phone: '+233 24 456 7890', company: 'Global Inc', created_at: '2026-02-10' },
        { id: 4, first_name: 'Emily', last_name: 'Davis', email: 'emily@smallbiz.com', phone: '+233 50 234 5678', company: 'SmallBiz LLC', created_at: '2026-02-20' },
        { id: 5, first_name: 'David', last_name: 'Wilson', email: 'david@innovation.co', phone: '+233 60 345 6789', company: 'Innovation Co', created_at: '2026-03-01' },
      ],
      'deals': [
        { id: 1, title: 'Enterprise License', company: 'Acme Corp', contact: 'John Smith', amount: 45000, probability: 100, stage: 'Closed Won', expected_close: '2026-02-15' },
        { id: 2, title: 'Startup Package', company: 'Tech Start', contact: 'Sarah Johnson', amount: 12000, probability: 60, stage: 'Negotiation', expected_close: '2026-03-10' },
        { id: 3, title: 'Consulting Services', company: 'Global Inc', contact: 'Michael Brown', amount: 25000, probability: 40, stage: 'Proposal', expected_close: '2026-03-20' },
        { id: 4, title: 'Annual Support', company: 'SmallBiz LLC', contact: 'Emily Davis', amount: 8000, probability: 20, stage: 'Qualification', expected_close: '2026-04-01' },
        { id: 5, title: 'Custom Development', company: 'Innovation Co', contact: 'David Wilson', amount: 75000, probability: 100, stage: 'Closed Won', expected_close: '2026-01-20' },
      ],
      'tasks': [
        { id: 1, subject: 'Follow up with Acme Corp', related_to: 'Enterprise License', due_date: '2026-03-05', status: 'Completed', priority: 'High', assigned_to: 'John Doe' },
        { id: 2, subject: 'Prepare proposal for Tech Start', related_to: 'Startup Package', due_date: '2026-03-08', status: 'In Progress', priority: 'High', assigned_to: 'Jane Smith' },
        { id: 3, subject: 'Demo presentation for Global Inc', related_to: 'Consulting Services', due_date: '2026-03-12', status: 'Pending', priority: 'Medium', assigned_to: 'John Doe' },
        { id: 4, subject: 'Contract review for Innovation Co', related_to: 'Custom Development', due_date: '2026-03-15', status: 'Pending', priority: 'High', assigned_to: 'Mike Johnson' },
        { id: 5, subject: 'Send quote to SmallBiz LLC', related_to: 'Annual Support', due_date: '2026-03-20', status: 'Not Started', priority: 'Low', assigned_to: 'Jane Smith' },
      ],
      'invoices': [
        { id: 1, invoice_number: 'INV-001', customer: 'Acme Corp', amount: 45000, status: 'Paid', issue_date: '2026-01-20', due_date: '2026-02-20' },
        { id: 2, invoice_number: 'INV-002', customer: 'Tech Start', amount: 12000, status: 'Sent', issue_date: '2026-02-25', due_date: '2026-03-25' },
        { id: 3, invoice_number: 'INV-003', customer: 'Global Inc', amount: 25000, status: 'Draft', issue_date: '2026-03-01', due_date: '2026-03-31' },
        { id: 4, invoice_number: 'INV-004', customer: 'Innovation Co', amount: 75000, status: 'Paid', issue_date: '2026-01-25', due_date: '2026-02-25' },
        { id: 5, invoice_number: 'INV-005', customer: 'SmallBiz LLC', amount: 8000, status: 'Overdue', issue_date: '2026-02-01', due_date: '2026-03-01' },
      ],
      'activity': [
        { id: 1, activity_type: 'Call', subject: 'Discovery Call with Acme', related_to: 'Enterprise License', due_date: '2026-03-03', status: 'Completed', assigned_to: 'John Doe' },
        { id: 2, activity_type: 'Meeting', subject: 'Product Demo for Tech Start', related_to: 'Startup Package', due_date: '2026-03-05', status: 'Scheduled', assigned_to: 'Jane Smith' },
        { id: 3, activity_type: 'Email', subject: 'Proposal sent to Global Inc', related_to: 'Consulting Services', due_date: '2026-03-02', status: 'Completed', assigned_to: 'John Doe' },
        { id: 4, activity_type: 'Task', subject: 'Contract Review', related_to: 'Custom Development', due_date: '2026-03-08', status: 'In Progress', assigned_to: 'Mike Johnson' },
        { id: 5, activity_type: 'Call', subject: 'Follow up call', related_to: 'Annual Support', due_date: '2026-03-10', status: 'Not Started', assigned_to: 'Jane Smith' },
      ]
    };

    return mockData[this.selectedReport.id] || [];
  }

  calculateSummary() {
    const amountKey = this.selectedReport.columns.find(c => c.type === 'currency')?.key || 'amount';
    
    if (this.selectedReport.id === 'sales' || this.selectedReport.id === 'deals' || this.selectedReport.id === 'invoices') {
      const total = this.reportData.reduce((sum, item) => sum + (Number(item[amountKey]) || 0), 0);
      const count = this.reportData.length;
      const avg = count > 0 ? total / count : 0;
      
      this.summaryStats = [
        { label: 'Total Records', value: count, icon: 'document-text-outline' },
        { label: 'Total Value', value: this.formatCurrency(total), icon: 'cash-outline' },
        { label: 'Average Value', value: this.formatCurrency(avg), icon: 'trending-up-outline' },
      ];
    } else {
      const count = this.reportData.length;
      this.summaryStats = [
        { label: 'Total Records', value: count, icon: 'document-text-outline' },
      ];
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);
  }

  selectReport(report: ReportConfig) {
    this.selectedReport = report;
    this.loadReport();
  }

  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.reportData.sort((a, b) => {
      const valA = a[column];
      const valB = b[column];
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      
      if (this.sortDirection === 'asc') {
        return strA.localeCompare(strB);
      }
      return strB.localeCompare(strA);
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'chevron-down-outline';
    return this.sortDirection === 'asc' ? 'chevron-up-outline' : 'chevron-down-outline';
  }

  formatValue(value: any, type: string): string {
    if (value === null || value === undefined) return '-';
    
    switch (type) {
      case 'currency':
        return this.formatCurrency(Number(value));
      case 'number':
        return Number(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      case 'status':
        return value;
      default:
        return String(value);
    }
  }

  getStatusClass(status: string): string {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('won') || statusLower.includes('paid') || statusLower.includes('completed') || statusLower.includes('sent')) {
      return 'status-success';
    }
    if (statusLower.includes('lost') || statusLower.includes('overdue') || statusLower.includes('cancelled')) {
      return 'status-danger';
    }
    if (statusLower.includes('progress') || statusLower.includes('negotiation') || statusLower.includes('sent')) {
      return 'status-warning';
    }
    if (statusLower.includes('draft') || statusLower.includes('pending') || statusLower.includes('not started')) {
      return 'status-neutral';
    }
    if (statusLower.includes('qualified') || statusLower.includes('proposal')) {
      return 'status-info';
    }
    return '';
  }

  getPriorityClass(priority: string): string {
    if (!priority) return '';
    const priorityLower = priority.toLowerCase();
    
    if (priorityLower.includes('high')) return 'priority-high';
    if (priorityLower.includes('medium')) return 'priority-medium';
    if (priorityLower.includes('low')) return 'priority-low';
    return '';
  }

  // Export functions
  exportToCSV() {
    const headers = this.selectedReport.columns.map(col => col.label);
    const rows = this.reportData.map(row => 
      this.selectedReport.columns.map(col => {
        const val = row[col.key];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${this.selectedReport.id}_report.csv`, 'text/csv');
  }

  exportToExcel() {
    // For Excel, we'll create a simple HTML table that Excel can open
    const headers = this.selectedReport.columns.map(col => `<th>${col.label}</th>`).join('');
    const rows = this.reportData.map(row => {
      const cells = this.selectedReport.columns.map(col => {
        const val = this.formatValue(row[col.key], col.type || 'text');
        return `<td>${val}</td>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #073336; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>${this.selectedReport.title}</h2>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    this.downloadFile(htmlContent, `${this.selectedReport.id}_report.xls`, 'application/vnd.ms-excel');
  }

  exportToPDF() {
    // Simple PDF export - in production, use a proper library
    const headers = this.selectedReport.columns.map(col => col.label);
    const rows = this.reportData.map(row => 
      this.selectedReport.columns.map(col => this.formatValue(row[col.key], col.type || 'text'))
    );

    let content = `${this.selectedReport.title}\n\n`;
    content += headers.join('\t') + '\n';
    rows.forEach(row => {
      content += row.join('\t') + '\n';
    });

    this.downloadFile(content, `${this.selectedReport.id}_report.txt`, 'text/plain');
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilters() {
    this.showFilters = false;
    this.loadReport();
  }

  clearFilters() {
    this.dateRange = 'this_month';
    this.filterStatus = '';
    this.searchQuery = '';
    this.loadReport();
  }

  refresh(event: any) {
    this.loadReport(event);
  }
}
