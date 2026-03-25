import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController, ModalController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Sqr } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb, person, trashOutline, documents, time, checkmarkCircle, arrowUpCircle, cloudUploadOutline, swapHorizontal, flag, chatbubblesOutline, checkmarkDoneCircle, close } from 'ionicons/icons';

interface TabCount {
  key: string;
  label: string;
  icon: string;
  count: number;
  status: string;
}

@Component({
  selector: 'app-sqrs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './sqrs-list.page.html',
  styleUrls: ['./sqrs-list.page.scss']
})
export class SqrsListPage implements OnInit {
  @ViewChild('tabsContainer') tabsContainer!: ElementRef;

  sqrs: Sqr[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  totalItems = 0;
  lastPage = 1;
  statusFilter = '';
  activeTab = 'all';
  
  // Scroll state
  tabsScrollable = false;
  kanbanScrollable = false;

  // Selection tracking
  selectedIds = new Set<number>();

  // Tab configuration with counts
  tabs: TabCount[] = [
    { key: 'all', label: 'All Tickets', icon: 'documents', count: 0, status: '' },
    { key: 'new', label: 'New', icon: 'alert-circle', count: 0, status: 'Open' },
    { key: 'in_progress', label: 'In Progress', icon: 'time', count: 0, status: 'In Progress' },
    { key: 'escalated', label: 'Escalated', icon: 'arrow-up-circle', count: 0, status: 'Escalated' },
    { key: 'closed', label: 'Closed', icon: 'checkmark-circle', count: 0, status: 'Closed' }
  ];

  // Filter options for dropdown
  filterOptions = [
    { value: '', label: 'All SQR Tickets' },
    { value: 'Open', label: 'All New Tickets' },
    { value: 'In Progress', label: 'All In Progress' },
    { value: 'Escalated', label: 'All Escalated' },
    { value: 'Resolved', label: 'All Resolved' },
    { value: 'Closed', label: 'All Closed' }
  ];

  selectedFilter = '';

  // Status options for bulk update
  statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Escalated', label: 'Escalated' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  private priorityColors: { [key: string]: string } = {
    'Low': '#4caf50',
    'Medium': '#ff9800',
    'High': '#f44336',
    'Critical': '#9c27b0'
  };

  private typeIcons: { [key: string]: string } = {
    'Complaint': 'warning',
    'Feedback': 'chatbubbles',
    'Suggestion': 'lightbulb',
    'Inquiry': 'helpCircle'
  };

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private modalController: ModalController,
    private router: Router
  ) {
    addIcons({ trashOutline, warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb: alertCircle, person, documents, time, checkmarkCircle, arrowUpCircle, cloudUploadOutline, swapHorizontal, flag, chatbubblesOutline, checkmarkDoneCircle, close });
  }

  ngOnInit(): void {
    this.loadSqrCounts();
    this.loadSqrs();
    // Check for scrollability after view is initialized
    setTimeout(() => this.checkScrollability(), 500);
  }

  // Check if tabs and kanban are scrollable
  checkScrollability(): void {
    if (this.tabsContainer) {
      const el = this.tabsContainer.nativeElement;
      this.tabsScrollable = el.scrollWidth > el.clientWidth;
    }
    
    // Check kanban scrollability
    const kanbanBoard = document.querySelector('.kanban-board') as HTMLElement;
    const kanbanContainer = document.querySelector('.kanban-container') as HTMLElement;
    if (kanbanBoard && kanbanContainer) {
      this.kanbanScrollable = kanbanBoard.scrollWidth > kanbanContainer.clientWidth;
    }
  }

  // Scroll tabs horizontally
  scrollTabs(direction: 'left' | 'right'): void {
    if (this.tabsContainer) {
      const el = this.tabsContainer.nativeElement;
      const scrollAmount = 150;
      if (direction === 'left') {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }

  // Scroll kanban board horizontally
  scrollKanban(direction: 'left' | 'right'): void {
    const kanbanContainer = window.document.querySelector('.kanban-container') as HTMLElement;
    if (kanbanContainer) {
      // Use scrollLeft instead of scrollBy for better control
      const scrollAmount = 300;
      if (direction === 'left') {
        kanbanContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        kanbanContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      // Fallback: try scrolling the content element
      const content = window.document.querySelector('ion-content') as HTMLElement;
      if (content) {
        const scrollAmount = 300;
        if (direction === 'left') {
          content.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          content.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  }

  // Selection methods
  get allSelected(): boolean {
    return this.sqrs.length > 0 && this.selectedIds.size === this.sqrs.length;
  }

  get someSelected(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.sqrs.length;
  }

  toggleSelection(id: number, event: any): void {
    if (event.detail && event.detail.checked !== undefined) {
      if (event.detail.checked) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    } else {
      // Toggle from click
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    }
  }

  // Handle SQR card click - navigate to detail or toggle selection
  onSqrClick(sqr: Sqr, event: any): void {
    // If Shift is held or items are selected, toggle selection
    if (event.shiftKey || this.selectedIds.size > 0) {
      // Toggle selection
      this.toggleSelection(sqr.id, event);
    } else {
      // Navigate to SQR detail page
      this.router.navigate(['/sqrs/view', sqr.id]);
    }
  }

  // Per-column select all methods
  isAllSelectedForStatus(status: string): boolean {
    const sqrsInStatus = this.getSqrsByStatus(status);
    if (sqrsInStatus.length === 0) return false;
    return sqrsInStatus.every(sqr => this.selectedIds.has(sqr.id));
  }

  isSomeSelectedForStatus(status: string): boolean {
    const sqrsInStatus = this.getSqrsByStatus(status);
    if (sqrsInStatus.length === 0) return false;
    const selectedCount = sqrsInStatus.filter(sqr => this.selectedIds.has(sqr.id)).length;
    return selectedCount > 0 && selectedCount < sqrsInStatus.length;
  }

  toggleSelectAllForStatus(status: string, event: any): void {
    const sqrsInStatus = this.getSqrsByStatus(status);
    const isChecked = event.detail.checked;
    
    if (isChecked) {
      // Select all in this status
      sqrsInStatus.forEach(sqr => this.selectedIds.add(sqr.id));
    } else {
      // Deselect all in this status
      sqrsInStatus.forEach(sqr => this.selectedIds.delete(sqr.id));
    }
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.clearSelection();
    } else {
      this.sqrs.forEach(sqr => this.selectedIds.add(sqr.id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  // Get SQRs filtered by status
  getSqrsByStatus(status: string): Sqr[] {
    return this.sqrs.filter(sqr => sqr.status === status);
  }

  loadSqrCounts(): void {
    this.api.getSqrCounts().subscribe({
      next: (response) => {
        const counts = response.data;
        // Update tab counts
        this.tabs[0].count = counts.total || 0;
        this.tabs[1].count = counts.new || 0;
        this.tabs[2].count = counts.in_progress || 0;
        this.tabs[3].count = counts.escalated || 0;
        this.tabs[4].count = counts.closed || 0;
      },
      error: () => {
        // Keep default counts on error
      }
    });
  }

  loadSqrs(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      // Clear selection when loading new data
      this.clearSelection();
    }

    // Determine status filter based on active tab or dropdown
    let statusParam = this.statusFilter;
    if (!statusParam && this.activeTab !== 'all') {
      const activeTabObj = this.tabs.find(t => t.key === this.activeTab);
      if (activeTabObj) {
        statusParam = activeTabObj.status;
      }
    }

    // First, get total count to know how many pages to fetch
    this.api.getSqrs({ 
      page: 1, 
      per_page: 1,
      search: this.searchQuery,
      status: statusParam
    }).subscribe({
      next: (response) => {
        // Get total count from response - check meta first, then root-level
        let total = 0;
        if (response.meta && response.meta.total !== undefined) {
          total = response.meta.total;
        } else if (response.total !== undefined) {
          total = response.total;
        } else if (response.data && Array.isArray(response.data)) {
          total = response.data.length;
        }
        
        if (total === 0) {
          this.sqrs = [];
          this.isLoading = false;
          this.hasMore = false;
          this.totalItems = 0;
          this.lastPage = 1;
          return;
        }
        
        // Calculate how many pages we need
        const perPage = 100;
        const totalPages = Math.ceil(total / perPage);
        
        // Fetch all pages
        const promises: Promise<any>[] = [];
        for (let page = 1; page <= totalPages; page++) {
          promises.push(
            new Promise((resolve) => {
              this.api.getSqrs({ 
                page: page, 
                per_page: perPage,
                search: this.searchQuery,
                status: statusParam
              }).subscribe({
                next: (res) => resolve(res.data),
                error: () => resolve([])
              });
            })
          );
        }
        
        Promise.all(promises).then((results) => {
          // Flatten all results
          const allSqrs: Sqr[] = [];
          results.forEach((pageData: Sqr[]) => {
            if (pageData && pageData.length > 0) {
              allSqrs.push(...pageData);
            }
          });
          
          this.sqrs = allSqrs;
          this.totalItems = total;
          this.lastPage = totalPages;
          this.hasMore = false; // No more since we loaded all
          this.isLoading = false;
        });
      },
      error: () => {
        this.isLoading = false;
        this.sqrs = [];
      }
    });
  }

  onTabClick(tabKey: string): void {
    this.activeTab = tabKey;
    // Clear status filter when switching tabs
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadSqrs();
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.currentPage = 1;
    this.loadSqrs();
  }

  onStatusFilterChange(event: any): void {
    this.statusFilter = event.detail.value;
    this.currentPage = 1;
    // Update active tab based on filter
    if (this.statusFilter === 'Open') {
      this.activeTab = 'new';
    } else if (this.statusFilter === 'In Progress') {
      this.activeTab = 'in_progress';
    } else if (this.statusFilter === 'Escalated') {
      this.activeTab = 'escalated';
    } else if (this.statusFilter === 'Closed' || this.statusFilter === 'Resolved') {
      this.activeTab = 'closed';
    } else {
      this.activeTab = 'all';
    }
    this.loadSqrs();
  }

  onFilterChange(event: any): void {
    this.selectedFilter = event.detail.value;
    this.currentPage = 1;
    // Map filter to status
    if (this.selectedFilter === '') {
      this.statusFilter = '';
      this.activeTab = 'all';
    } else if (this.selectedFilter === 'Open') {
      this.statusFilter = 'Open';
      this.activeTab = 'new';
    } else if (this.selectedFilter === 'In Progress') {
      this.statusFilter = 'In Progress';
      this.activeTab = 'in_progress';
    } else if (this.selectedFilter === 'Escalated') {
      this.statusFilter = 'Escalated';
      this.activeTab = 'escalated';
    } else if (this.selectedFilter === 'Resolved') {
      this.statusFilter = 'Resolved';
      this.activeTab = 'closed';
    } else if (this.selectedFilter === 'Closed') {
      this.statusFilter = 'Closed';
      this.activeTab = 'closed';
    } else {
      this.statusFilter = '';
      this.activeTab = 'all';
    }
    this.loadSqrs();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      
      let statusParam = this.statusFilter;
      if (!statusParam && this.activeTab !== 'all') {
        const activeTabObj = this.tabs.find(t => t.key === this.activeTab);
        if (activeTabObj) {
          statusParam = activeTabObj.status;
        }
      }

      this.api.getSqrs({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery,
        status: statusParam
      }).subscribe({
        next: (response) => {
          this.sqrs = [...this.sqrs, ...response.data];
          // Use meta if available, otherwise use root-level properties
          const meta = response.meta;
          this.hasMore = meta ? meta.current_page < meta.last_page : response.current_page < response.last_page;
          this.totalItems = meta ? meta.total : response.total;
          this.lastPage = meta ? meta.last_page : response.last_page;
          event.target.complete();
        },
        error: () => {
          event.target.complete();
        }
      });
    } else {
      event.target.complete();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSqrs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.lastPage) {
      this.currentPage++;
      this.loadSqrs();
    }
  }

  get startItem(): number {
    return (this.currentPage - 1) * 20 + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * 20, this.totalItems);
  }

  getTypeIcon(type: string): string {
    return this.typeIcons[type] || 'helpCircle';
  }

  getPriorityColor(priority: string): string {
    return this.priorityColors[priority] || '#999';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Open': 'status-open',
      'In Progress': 'status-progress',
      'Escalated': 'status-escalated',
      'Resolved': 'status-resolved',
      'Closed': 'status-closed'
    };
    return statusMap[status] || 'status-open';
  }

  isTabActive(tabKey: string): boolean {
    return this.activeTab === tabKey;
  }

  // Bulk status update
  async openBulkStatusUpdate(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Update Status',
      message: `Update status for ${this.selectedIds.size} selected SQR(s)`,
      inputs: [
        {
          name: 'status',
          type: 'radio',
          label: 'Open',
          value: 'Open',
          checked: false
        },
        {
          name: 'status',
          type: 'radio',
          label: 'In Progress',
          value: 'In Progress',
          checked: false
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Escalated',
          value: 'Escalated',
          checked: false
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Resolved',
          value: 'Resolved',
          checked: false
        },
        {
          name: 'status',
          type: 'radio',
          label: 'Closed',
          value: 'Closed',
          checked: false
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data) => {
            if (data.status) {
              this.bulkUpdateStatus(data.status);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  bulkUpdateStatus(status: string): void {
    const ids = Array.from(this.selectedIds);
    this.api.bulkUpdateSqrStatus(ids, status).subscribe({
      next: () => {
        this.loadSqrs();
        this.loadSqrCounts();
        this.clearSelection();
      },
      error: () => {
        this.showError('Failed to update status');
      }
    });
  }

  // Bulk delete
  async bulkDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete SQRs',
      message: `Are you sure you want to delete ${this.selectedIds.size} selected SQR(s)? This action cannot be undone.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performBulkDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  performBulkDelete(): void {
    const ids = Array.from(this.selectedIds);
    this.api.bulkDeleteSqrs(ids).subscribe({
      next: () => {
        this.loadSqrs();
        this.loadSqrCounts();
        this.clearSelection();
      },
      error: () => {
        this.showError('Failed to delete SQRs');
      }
    });
  }

  async deleteSqr(sqr: Sqr): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete SQR',
      message: `Are you sure you want to delete "${sqr.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteSqr(sqr.id).subscribe({
              next: () => {
                this.loadSqrs();
                this.loadSqrCounts();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async openImportModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: DataImportComponent,
      componentProps: {
        entityType: 'sqr'
      },
      cssClass: 'import-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Reload data after import
        this.loadSqrs();
        this.loadSqrCounts();
      }
    });

    return await modal.present();
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
