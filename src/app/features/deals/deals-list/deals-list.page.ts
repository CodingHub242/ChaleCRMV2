import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, ModalController, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline, funnelOutline, gridOutline, folder, createOutline, pricetagOutline, swapHorizontal, trendingUpOutline, calendarOutline as calendarIcon, videocamOutline, documentTextOutline, peopleOutline, checkmarkCircleOutline, closeCircleOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';

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
  @ViewChild('kanbanContainer') kanbanContainer!: ElementRef;

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

  // Toggle for showing empty stages in kanban
  showEmptyStages = true;

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
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({
      cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline, 
      funnelOutline, gridOutline, folder, createOutline, pricetagOutline,
      peopleOutline: people, 
      documentTextOutline: document, trophyOutline, closeCircleOutline: close,
      swapHorizontal, trendingUpOutline, calendarIcon, 
      videocamOutline: videocamOutline, 
      documentTextOutlineAlt: documentTextOutline,
      peopleOutlineAlt: peopleOutline, 
      checkmarkCircleOutline,
      eyeOutline, eyeOffOutline
    });
  }

  ngOnInit(): void {
    this.loadGroups();
  }

  ionViewWillEnter(): void {
    this.loadDeals();
    this.loadStageCounts();
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
      // Load overall counts when no group is selected (All Deals)
      this.api.getDealCounts().subscribe({
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
        },
        error: () => {
          // Reset counts on error
          this.tabs.forEach(tab => tab.count = 0);
        }
      });
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

    // Build params for count request
    const countParams: any = { 
      page: 1, 
      per_page: 1,
      search: this.searchQuery,
      stage: stageParam
    };

    // Add group_id if a group is selected
    if (this.selectedGroupId) {
      countParams.group_id = this.selectedGroupId;
    }

    // First, get total count to know how many pages to fetch
    this.api.getDeals(countParams).subscribe({
      next: (response) => {
        // Get total count - check meta first, then root-level total
        let total = 0;
        if (response.meta && response.meta.total !== undefined) {
          // Response has meta with total
          total = response.meta.total;
        } else if (response.total !== undefined) {
          total = response.total;
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback: count items in data array
          total = response.data.length;
        } else if (Array.isArray(response)) {
          total = response.length;
        }
        
        if (total === 0) {
          this.deals = [];
          this.isLoading = false;
          this.hasMore = false;
          this.totalDeals = 0;
          return;
        }
        
        // Calculate how many pages we need
        const perPage = 100;
        const totalPages = Math.ceil(total / perPage);
        
        // Fetch all pages
        const promises: Promise<any>[] = [];
        for (let page = 1; page <= totalPages; page++) {
          const pageParams: any = { 
            page: page, 
            per_page: perPage,
            search: this.searchQuery,
            stage: stageParam
          };
          if (this.selectedGroupId) {
            pageParams.group_id = this.selectedGroupId;
          }
          
          promises.push(
            new Promise((resolve) => {
              this.api.getDeals(pageParams).subscribe({
                next: (res) => resolve(res.data || []),
                error: () => resolve([])
              });
            })
          );
        }
        
        Promise.all(promises).then((results) => {
          // Flatten all results
          const allDeals: Deal[] = [];
          results.forEach((pageData: Deal[]) => {
            if (pageData && pageData.length > 0) {
              allDeals.push(...pageData);
            }
          });
          
          this.deals = allDeals;
          this.totalDeals = total;
          this.hasMore = false; // No more since we loaded all
          this.calculateTotal();
          this.isLoading = false;
        });
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

  toggleEmptyStages(): void {
    this.showEmptyStages = !this.showEmptyStages;
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
      header: 'Delete Lead',
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

  // ==================== Selection & Bulk Actions ====================
  
  // Selection tracking
  selectedIds = new Set<number>();

  // Stage options for bulk update
  stageOptions = [
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Client', label: 'Client' },
    { value: 'Demo Requested', label: 'Demo Requested' },
    { value: 'Demo Completed', label: 'Demo Completed' },
    { value: 'Contract In-Review', label: 'Contract In-Review' },
    { value: 'Closed Won', label: 'Closed Won' },
    { value: 'Closed Lost', label: 'Closed Lost' }
  ];

  get allSelected(): boolean {
    return this.deals.length > 0 && this.selectedIds.size === this.deals.length;
  }

  get someSelected(): boolean {
    return this.selectedIds.size > 0 && this.selectedIds.size < this.deals.length;
  }

  toggleSelection(id: number, event: any): void {
    if (event.detail && event.detail.checked !== undefined) {
      if (event.detail.checked) {
        this.selectedIds.add(id);
      } else {
        this.selectedIds.delete(id);
      }
    } else {
      if (this.selectedIds.has(id)) {
        this.selectedIds.delete(id);
      } else {
        this.selectedIds.add(id);
      }
    }
  }

  onDealClick(deal: Deal, event: any): void {
    if (event.shiftKey || this.selectedIds.size > 0) {
      this.toggleSelection(deal.id, event);
    } else {
      this.router.navigate(['/deals/view', deal.id]);
    }
  }

  isAllSelectedForStage(stage: string): boolean {
    const dealsInStage = this.getDealsByStage(stage);
    if (dealsInStage.length === 0) return false;
    return dealsInStage.every(deal => this.selectedIds.has(deal.id));
  }

  isSomeSelectedForStage(stage: string): boolean {
    const dealsInStage = this.getDealsByStage(stage);
    if (dealsInStage.length === 0) return false;
    const selectedCount = dealsInStage.filter(deal => this.selectedIds.has(deal.id)).length;
    return selectedCount > 0 && selectedCount < dealsInStage.length;
  }

  toggleSelectAllForStage(stage: string, event: any): void {
    const dealsInStage = this.getDealsByStage(stage);
    const isChecked = event.detail.checked;
    
    if (isChecked) {
      dealsInStage.forEach(deal => this.selectedIds.add(deal.id));
    } else {
      dealsInStage.forEach(deal => this.selectedIds.delete(deal.id));
    }
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.clearSelection();
    } else {
      this.deals.forEach(deal => this.selectedIds.add(deal.id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  getDealsByStage(stage: string): Deal[] {
    // Filter deals by stage, but always show all stages (empty if no data)
    // When a group is selected, the deals are already filtered by group_id in loadDeals
    
    // For Prospect stage, also include deals with stage = 'New'
    if (stage === 'Prospect') {
      return this.deals.filter(deal => deal.stage === 'Prospect' || deal.stage === 'New' || deal.stage === 'Prospect Client' || !deal.stage);
    }
    return this.deals.filter(deal => deal.stage === stage);
  }

  // Check if a stage has any deals (for conditional rendering)
  hasDealsInStage(stage: string): boolean {
    return this.getDealsByStage(stage).length > 0;
  }

  // Get all stages that should be displayed
  get displayedStages(): string[] {
    return [
      'Prospect',
      'Client',
      'Demo Requested',
      'Demo Completed',
      'Contract In-Review',
      'Closed Won',
      'Closed Lost'
    ];
  }

  // Check if divider should show between two stages
  shouldShowDivider(beforeStage: string, afterStage: string): boolean {
    const beforeHasDeals = this.hasDealsInStage(beforeStage);
    const afterHasDeals = this.hasDealsInStage(afterStage);
    
    // Show divider if either:
    // 1. Both stages have deals (always show)
    // 2. One has deals and we're showing empty stages
    // 3. showEmptyStages is true (show all dividers)
    if (this.showEmptyStages) {
      return true; // Show all dividers when showing empty stages
    }
    
    // Show divider if at least one stage has deals
    return beforeHasDeals || afterHasDeals;
  }

  // Scroll kanban board horizontally
  scrollKanban(direction: 'left' | 'right'): void {
    // Try using ViewChild first
    if (this.kanbanContainer?.nativeElement) {
      const el = this.kanbanContainer.nativeElement;
      const scrollAmount = 300;
      if (direction === 'left') {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      // Fallback: use window.document to avoid any type issues
      const kanbanContainer = window.document.querySelector('.kanban-container') as HTMLElement;
      if (kanbanContainer) {
        const scrollAmount = 300;
        if (direction === 'left') {
          kanbanContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          kanbanContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      } else {
        // Last fallback: try scrolling the ion-content element
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
  }

  // Bulk stage update
  async openBulkStageUpdate(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Update Stage',
      message: `Update stage for ${this.selectedIds.size} selected deal(s)`,
      inputs: [
        {
          name: 'stage',
          type: 'radio',
          label: 'Prospect',
          value: 'Prospect',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Client',
          value: 'Client',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Demo Requested',
          value: 'Demo Requested',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Demo Completed',
          value: 'Demo Completed',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Contract In-Review',
          value: 'Contract In-Review',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Closed Won',
          value: 'Closed Won',
          checked: false
        },
        {
          name: 'stage',
          type: 'radio',
          label: 'Closed Lost',
          value: 'Closed Lost',
          checked: false
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (data) => {
            if (data.stage) {
              this.bulkUpdateStage(data.stage);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  bulkUpdateStage(stage: string): void {
    const ids = Array.from(this.selectedIds);
    this.api.bulkUpdateDealStage(ids, stage).subscribe({
      next: () => {
        this.loadDeals();
        this.loadStageCounts();
        this.clearSelection();
      },
      error: () => {
        this.showError('Failed to update stage');
      }
    });
  }

  // Bulk delete
  async bulkDelete(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Deals',
      message: `Are you sure you want to delete ${this.selectedIds.size} selected deal(s)? This action cannot be undone.`,
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
    this.api.bulkDeleteDeals(ids).subscribe({
      next: () => {
        this.loadDeals();
        this.loadStageCounts();
        this.clearSelection();
      },
      error: () => {
        this.showError('Failed to delete deals');
      }
    });
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
