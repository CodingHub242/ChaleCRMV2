import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Sqr } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb, person, trashOutline, documents, time, checkmarkCircle, arrowUpCircle, cloudUploadOutline } from 'ionicons/icons';

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
  sqrs: Sqr[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  totalItems = 0;
  lastPage = 1;
  statusFilter = '';
  activeTab = 'all';

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
    private modalController: ModalController
  ) {
    addIcons({ trashOutline, warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb: alertCircle, person, documents, time, checkmarkCircle, arrowUpCircle, cloudUploadOutline });
  }

  ngOnInit(): void {
    this.loadSqrCounts();
    this.loadSqrs();
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
    }

    // Determine status filter based on active tab or dropdown
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
        if (loadMore) {
          this.sqrs = [...this.sqrs, ...response.data];
        } else {
          this.sqrs = response.data;
        }
        // Use meta if available, otherwise use root-level properties
        const meta = response.meta;
        this.hasMore = meta ? meta.current_page < meta.last_page : response.current_page < response.last_page;
        this.totalItems = meta ? meta.total : response.total;
        this.lastPage = meta ? meta.last_page : response.last_page;
        this.isLoading = false;
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
    this.loadSqrs();
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadSqrs();
  }

  onStatusFilterChange(event: any): void {
    this.statusFilter = event.detail.value;
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
}
