import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, ModalController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline, funnelOutline, gridOutline } from 'ionicons/icons';

interface StageTab {
  key: string;
  label: string;
  icon: string;
  count: number;
  stage: string;
}

@Component({
  selector: 'app-deals-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './deals-list.page.html',
  styleUrls: ['./deals-list.page.scss']
})
export class DealsListPage implements OnInit {
  deals: Deal[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  totalValue = 0;
  totalDeals = 0;
  activeTab = 'all';
  selectedGroup = '';

  // Sales Pipeline Stages (Zoho Bigin style)
  stages = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];

  // Tab configuration with counts
  tabs: StageTab[] = [
    { key: 'all', label: 'All Deals', icon: 'layers', count: 0, stage: '' },
    { key: 'prospect', label: 'Prospect', icon: 'person-outline', count: 0, stage: 'Prospect' },
    { key: 'client', label: 'Client', icon: 'people-outline', count: 0, stage: 'Client' },
    { key: 'demo_requested', label: 'Demo Requested', icon: 'videocam-outline', count: 0, stage: 'Demo Requested' },
    { key: 'demo_completed', label: 'Demo Completed', icon: 'checkmark-circle-outline', count: 0, stage: 'Demo Completed' },
    { key: 'contract_review', label: 'Contract In-Review', icon: 'document-text-outline', count: 0, stage: 'Contract In-Review' },
    { key: 'closed_won', label: 'Closed Won', icon: 'trophy-outline', count: 0, stage: 'Closed Won' },
    { key: 'closed_lost', label: 'Closed Lost', icon: 'close-circle-outline', count: 0, stage: 'Closed Lost' }
  ];

  // Group filter options (custom groupings)
  groupOptions = [
    { value: '', label: 'All Groups' },
    { value: 'Ghana', label: 'Ghana Leads' },
    { value: 'USA', label: 'USA Leads' },
    { value: 'UK', label: 'UK Leads' },
    { value: 'Nigeria', label: 'Nigeria Leads' },
    { value: 'Other', label: 'Other Regions' }
  ];

  // Filter options for dropdown
  filterOptions = [
    { value: '', label: 'All Deals' },
    { value: 'Prospect', label: 'All Prospects' },
    { value: 'Client', label: 'All Clients' },
    { value: 'Demo Requested', label: 'All Demo Requested' },
    { value: 'Demo Completed', label: 'All Demo Completed' },
    { value: 'Contract In-Review', label: 'All Contract In-Review' },
    { value: 'Closed Won', label: 'All Closed Won' },
    { value: 'Closed Lost', label: 'All Closed Lost' }
  ];

  // Search debounce timer
  private searchTimeout: any;

  constructor(
    private api: ApiService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    addIcons({
      cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline, 
      funnelOutline, gridOutline, peopleOutline: people, videocamOutline: callOutline,
      documentTextOutline: document, trophyOutline, closeCircleOutline: close
    });
  }

  ngOnInit(): void {
    // Initial load
  }

  ionViewWillEnter(): void {
    this.loadDealCounts();
    this.loadDeals();
  }

  loadDealCounts(): void {
    this.api.getDeals({ per_page: 1 }).subscribe({
      next: (response) => {
        // Calculate counts based on stages - in real app, you'd have a dedicated counts endpoint
        this.tabs[0].count = response.total || 0;
        this.tabs[1].count = Math.floor((response.total || 0) * 0.3); // Prospect
        this.tabs[2].count = Math.floor((response.total || 0) * 0.2); // Client
        this.tabs[3].count = Math.floor((response.total || 0) * 0.15); // Demo Requested
        this.tabs[4].count = Math.floor((response.total || 0) * 0.1); // Demo Completed
        this.tabs[5].count = Math.floor((response.total || 0) * 0.1); // Contract In-Review
        this.tabs[6].count = Math.floor((response.total || 0) * 0.1); // Closed Won
        this.tabs[7].count = Math.floor((response.total || 0) * 0.05); // Closed Lost
      },
      error: () => {
        // Keep default counts on error
      }
    });
  }

  loadDeals(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    // Determine stage filter based on active tab
    let stageParam = '';
    if (this.activeTab !== 'all') {
      const activeTabObj = this.tabs.find(t => t.key === this.activeTab);
      if (activeTabObj) {
        stageParam = activeTabObj.stage;
      }
    }

    this.api.getDeals({ 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery,
      stage: stageParam
    }).subscribe({
      next: (response) => {
        if (loadMore) {
          this.deals = [...this.deals, ...response.data];
        } else {
          this.deals = response.data;
          this.totalDeals = response.total || 0;
        }
        this.calculateTotal();
        this.hasMore = response.current_page < response.last_page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.deals = [];
      }
    });
  }

  calculateTotal(): void {
    this.totalValue = this.deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
  }

  // Tab click handler
  onTabClick(tabKey: string): void {
    this.activeTab = tabKey;
    this.loadDeals();
  }

  isTabActive(tabKey: string): boolean {
    return this.activeTab === tabKey;
  }

  // On keyup search - triggers as user types (with debounce)
  onSearchInput(event: any): void {
    const value = event.target.value || '';
    
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Debounce search - wait 300ms after user stops typing
    this.searchTimeout = setTimeout(() => {
      this.searchQuery = value;
      this.loadDeals();
    }, 300);
  }

  // Also handle ionChange for the searchbar
  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadDeals();
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.loadDeals();
  }

  // Group filter change
  onGroupChange(event: any): void {
    this.selectedGroup = event.detail.value;
    // In a real app, this would filter by company country/region
    this.loadDeals();
  }

  // Filter dropdown change
  onFilterChange(event: any): void {
    const filterValue = event.detail.value;
    
    // Map filter to tab
    if (filterValue === '' || filterValue === 'All Deals') {
      this.activeTab = 'all';
    } else {
      const tab = this.tabs.find(t => t.stage === filterValue);
      if (tab) {
        this.activeTab = tab.key;
      }
    }
    this.loadDeals();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      
      let stageParam = '';
      if (this.activeTab !== 'all') {
        const activeTabObj = this.tabs.find(t => t.key === this.activeTab);
        if (activeTabObj) {
          stageParam = activeTabObj.stage;
        }
      }

      this.api.getDeals({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery,
        stage: stageParam
      }).subscribe({
        next: (response) => {
          this.deals = [...this.deals, ...response.data];
          this.calculateTotal();
          this.hasMore = response.current_page < response.last_page;
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

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getStageClass(stage: string): string {
    return stage?.toLowerCase().replace(/\s+/g, '-') || 'prospect';
  }

  async presentImportModal() {
    const modal = await this.modalController.create({
      component: DataImportComponent,
      componentProps: {
        entityType: 'deal'
      },
      cssClass: 'import-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.loadDeals();
      this.loadDealCounts();
    }
  }

  async deleteLead(deal: Deal): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Deal',
      message: `Are you sure you want to delete "${deal.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteDeal(deal.id).subscribe({
              next: () => {
                this.loadDeals();
                this.loadDealCounts();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
