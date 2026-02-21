import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Campaign } from '../../models';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
})
export class CampaignsPage implements OnInit {
  campaigns: Campaign[] = [];
  loading = false;
  currentFilter = 'all';
  searchQuery = '';
  
  // Stats
  totalCount = 0;
  activeCount = 0;
  draftCount = 0;
  completedCount = 0;
  totalBudget = 0;

  // Pagination
  currentPage = 1;
  hasMore = true;

  // Campaign types and statuses
  campaignTypes = ['email', 'social', 'event', 'advertising', 'other'];
  campaignStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.loading = true;
    const params: any = {
      page: this.currentPage
    };
    
    if (this.currentFilter !== 'all') {
      params.status = this.currentFilter;
    }
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getCampaigns(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.campaigns = response;
        } else if (response?.data) {
          if (this.currentPage === 1) {
            this.campaigns = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          } else {
            this.campaigns = [...this.campaigns, ...(Array.isArray(response.data) ? response.data : (response.data?.data || []))];
          }
          this.hasMore = response.data?.next_page_url !== null;
        } else {
          this.campaigns = [];
        }
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading campaigns:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalCount = this.campaigns.length;
    this.activeCount = this.campaigns.filter(c => c.status === 'active').length;
    this.draftCount = this.campaigns.filter(c => c.status === 'draft').length;
    this.completedCount = this.campaigns.filter(c => c.status === 'completed').length;
    this.totalBudget = this.campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  }

  filterChanged(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadCampaigns();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.currentPage = 1;
    this.loadCampaigns();
  }

  loadMore(event: any) {
    if (this.hasMore) {
      this.currentPage++;
      this.loadCampaigns();
    }
    event.target.complete();
  }

  viewCampaign(campaign: Campaign) {
    this.router.navigate(['/campaigns', campaign.id]);
  }

  async presentActionSheet(event: Event, campaign: Campaign) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'View Details',
          icon: 'eye-outline',
          handler: () => {
            this.viewCampaign(campaign);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/campaigns', campaign.id, 'edit']);
          }
        },
        {
          text: 'Duplicate',
          icon: 'copy-outline',
          handler: () => {
            this.duplicateCampaign(campaign);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteCampaign(campaign);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async duplicateCampaign(campaign: Campaign) {
    const alert = await this.alertController.create({
      header: 'Duplicate Campaign',
      message: `Create a copy of "${campaign.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Duplicate',
          handler: () => {
            const duplicatedCampaign: any = { ...campaign };
            delete duplicatedCampaign.id;
            duplicatedCampaign.name = `${campaign.name} (Copy)`;
            duplicatedCampaign.status = 'draft';
            
            this.apiService.createCampaign(duplicatedCampaign).subscribe({
              next: () => {
                this.loadCampaigns();
              },
              error: (error: any) => {
                console.error('Error duplicating campaign:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteCampaign(campaign: Campaign) {
    const alert = await this.alertController.create({
      header: 'Delete Campaign',
      message: `Are you sure you want to delete "${campaign.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteCampaign(campaign.id).subscribe({
              next: () => {
                this.loadCampaigns();
              },
              error: (error: any) => {
                console.error('Error deleting campaign:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentImportModal() {
    const alert = await this.alertController.create({
      header: 'Import Campaigns',
      message: 'Import functionality coming soon!',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Helper methods
  getCampaignColor(type: string): string {
    const colors: any = {
      email: 'primary',
      social: 'secondary',
      event: 'tertiary',
      advertising: 'warning',
      other: 'medium'
    };
    return colors[type] || 'medium';
  }

  getStatusColor(status: string): string {
    const colors: any = {
      draft: 'medium',
      active: 'success',
      paused: 'warning',
      completed: 'tertiary',
      cancelled: 'danger'
    };
    return colors[status] || 'medium';
  }

  getStatusClass(status: string): string {
    return status || 'draft';
  }

  getTypeClass(type: string): string {
    return type || 'other';
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      email: 'mail-outline',
      social: 'share-social-outline',
      event: 'calendar-outline',
      advertising: 'megaphone-outline',
      other: 'bulb-outline'
    };
    return icons[type] || 'bulb-outline';
  }

  formatCurrency(value: number): string {
    if (!value) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
