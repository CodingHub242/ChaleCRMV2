import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, ModalController, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline, trashOutline, ellipsisVertical, searchOutline } from 'ionicons/icons';

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

  stages = ['New', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  // Search debounce timer
  private searchTimeout: any;

  constructor(
    private api: ApiService,
    private modalController: ModalController,
    private alertController: AlertController
  ) {
    addIcons({cloudUploadOutline,trashOutline,ellipsisVertical, searchOutline});
  }

  ngOnInit(): void {
    // Initial load
  }

  ionViewWillEnter(): void {
    this.loadDeals();
  }

  loadDeals(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    this.api.getDeals({ 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery 
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

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      this.api.getDeals({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery 
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
    return stage?.toLowerCase().replace(/\s+/g, '-') || 'new';
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
    }
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
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
