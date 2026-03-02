import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, ModalController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline, funnelOutline, gridOutline, folder, createOutline, pricetagOutline } from 'ionicons/icons';

interface DealGroup {
  id: number;
  name: string;
  color?: string;
  deals_count?: number;
}

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
  selectedGroupId: number | null = null;
  
  // Groups (like Ghana Leads, USA Leads, etc.)
  groups: DealGroup[] = [];
  isLoadingGroups = true;
  
  // Show "All Deals" tab at the beginning
  showAllDealsTab = true;

  // Sales Pipeline Stages
  tabs: StageTab[] = [
    { key: 'all', label: 'All', icon: 'layers', count: 0, stage: '' },
    { key: 'prospect', label: 'Prospect', icon: 'person-outline', count: 0, stage: 'Prospect' },
    { key: 'client', label: 'Client', icon: 'people-outline', count: 0, stage: 'Client' },
    { key: 'demo_requested', label: 'Demo', icon: 'videocam-outline', count: 0, stage: 'Demo Requested' },
    { key: 'demo_completed', label: 'Demo Done', icon: 'checkmark-circle-outline', count: 0, stage: 'Demo Completed' },
    { key: 'contract_review', label: 'Contract', icon: 'document-text-outline', count: 0, stage: 'Contract In-Review' },
    { key: 'closed_won', label: 'Won', icon: 'trophy-outline', count: 0, stage: 'Closed Won' },
    { key: 'closed_lost', label: 'Lost', icon: 'close-circle-outline', count: 0, stage: 'Closed Lost' }
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
      funnelOutline, gridOutline, folder, createOutline, pricetagOutline,
      peopleOutline: people, videocamOutline: callOutline,
      documentTextOutline: document, trophyOutline, closeCircleOutline: close
    });
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  ionViewWillEnter(): void {
    this.loadDeals();
  }

  loadGroups(): void {
    this.isLoadingGroups = true;
    this.api.getDealGroups().subscribe({
      next: (response) => {
        this.groups = response.data || [];
        this.isLoadingGroups = false;
        
        // If there are groups and no group selected, select the first one
        if (this.groups.length > 0 && !this.selectedGroupId) {
          // Keep "All Deals" selected by default
        }
      },
      error: () => {
        this.isLoadingGroups = false;
        this.groups = [];
      }
    });
  }

  onGroupSelect(groupId: number | null): void {
    this.selectedGroupId = groupId;
    this.activeTab = 'all';
    this.loadDeals();
    this.loadStageCounts();
  }

  loadStageCounts(): void {
    // If a group is selected, load stage counts for that group
    if (this.selectedGroupId) {
      this.api.getDealGroupStageCounts(this.selectedGroupId).subscribe({
        next: (response) => {
          const counts = response.data;
          this.tabs[0].count = counts.total || 0;
          this.tabs[1].count = counts.prospect || 0;
          this.tabs[2].count = counts.client || 0;
          this.tabs[3].count = counts.demo_requested || 0;
          this.tabs[4].count = counts.demo_completed || 0;
          this.tabs[5].count = counts.contract_in_review || 0;
          this.tabs[6].count = counts.closed_won || 0;
          this.tabs[7].count = counts.closed_lost || 0;
        }
      });
    } else {
      // Reset counts for "All Deals"
      this.tabs.forEach(tab => tab.count = 0);
    }
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

    const params: any = { 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery,
      stage: stageParam
    };

    // Add group_id if a group is selected
    if (this.selectedGroupId) {
      params.group_id = this.selectedGroupId;
    }

    this.api.getDeals(params).subscribe({
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
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.searchQuery = value;
      this.loadDeals();
    }, 300);
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadDeals();
  }

  clearSearch(): void {
    this.searchQuery = '';
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

      const params: any = { 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery,
        stage: stageParam
      };

      if (this.selectedGroupId) {
        params.group_id = this.selectedGroupId;
      }

      this.api.getDeals(params).subscribe({
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
      this.loadStageCounts();
    }
  }

  async createGroup(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Create Group',
      message: 'Enter a name for the new group (e.g., Ghana Leads, USA Leads)',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Group name'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data) => {
            if (data.name) {
              this.api.createDealGroup({ name: data.name }).subscribe({
                next: () => {
                  this.loadGroups();
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteGroup(group: DealGroup): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? Deals in this group will not be deleted.`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteDealGroup(group.id).subscribe({
              next: () => {
                if (this.selectedGroupId === group.id) {
                  this.selectedGroupId = null;
                }
                this.loadGroups();
              }
            });
          }
        }
      ]
    });
    await alert.present();
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
                this.loadStageCounts();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
