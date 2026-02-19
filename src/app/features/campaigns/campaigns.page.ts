import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Campaign } from '../../models';

@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class CampaignsPage implements OnInit {
  campaigns: Campaign[] = [];
  loading = false;
  currentFilter = 'all';
  searchQuery = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCampaigns();
  }

  loadCampaigns() {
    this.loading = true;
    const params: any = {};
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
          this.campaigns = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.campaigns = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading campaigns:', error);
        this.loading = false;
      }
    });
  }

  filterChanged(event: any) {
    this.currentFilter = event.detail.value;
    this.loadCampaigns();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.loadCampaigns();
  }

  viewCampaign(campaign: Campaign) {
    this.router.navigate(['/campaigns', campaign.id]);
  }

  editCampaign(campaign: Campaign) {
    this.router.navigate(['/campaigns', campaign.id, 'edit']);
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
              error: (error) => {
                console.error('Error deleting campaign:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

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
}
