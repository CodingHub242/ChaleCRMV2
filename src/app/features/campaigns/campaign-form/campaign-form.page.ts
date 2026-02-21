import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Campaign, ApiResponse } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, mailOutline, shareSocialOutline, megaphoneOutline, bulbOutline } from 'ionicons/icons';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.page.html',
  styleUrls: ['./campaign-form.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class CampaignFormPage implements OnInit {
  campaign: any = {
    name: '',
    type: 'email',
    status: 'draft',
    start_date: '',
    end_date: '',
    budget: 0,
    currency: 'GHS',
    description: '',
    goals: ''
  };
  
  isLoading = false;
  isEditing = false;
  campaignId: number | null = null;

  // Campaign types and statuses
  campaignTypes = ['email', 'social', 'event', 'advertising', 'other'];
  campaignStatuses = ['draft', 'active', 'paused', 'completed', 'cancelled'];
  
  // Currency options
  currencies = ['GHS','USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    addIcons({mailOutline,shareSocialOutline,calendarOutline,megaphoneOutline,bulbOutline});
  }

  ngOnInit() {
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.campaignId = parseInt(id, 10);
      this.isEditing = true;
      this.loadCampaign();
    }
  }

  loadCampaign() {
    if (!this.campaignId) return;
    
    this.isLoading = true;
    this.apiService.getCampaigns({ per_page: 1 }).subscribe({
      next: (response: any) => {
        const campaigns = response.data?.data || response.data || [];
        const campaign = campaigns.find((c: Campaign) => c.id === this.campaignId);
        if (campaign) {
          this.campaign = { ...campaign };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading campaign:', error);
        this.isLoading = false;
        this.showError('Failed to load campaign');
      }
    });
  }

  save() {
    if (!this.campaign.name) {
      this.showError('Please enter a campaign name');
      return;
    }

    if (this.isEditing && this.campaignId) {
      this.updateCampaign();
    } else {
      this.createCampaign();
    }
  }

  createCampaign() {
    this.isLoading = true;
    this.apiService.createCampaign(this.campaign).subscribe({
      next: (response: ApiResponse<Campaign>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/campaigns']);
        } else {
          this.showError(response.message || 'Failed to create campaign');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating campaign:', error);
        this.showError('Failed to create campaign');
      }
    });
  }

  updateCampaign() {
    if (!this.campaignId) return;
    
    this.isLoading = true;
    this.apiService.updateCampaign(this.campaignId, this.campaign).subscribe({
      next: (response: ApiResponse<Campaign>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/campaigns']);
        } else {
          this.showError(response.message || 'Failed to update campaign');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating campaign:', error);
        this.showError('Failed to update campaign');
      }
    });
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Helper methods
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

  getStatusClass(status: string): string {
    const statusMap: any = {
      draft: 'draft',
      active: 'active-status',
      paused: 'paused',
      completed: 'completed',
      cancelled: 'cancelled'
    };
    return statusMap[status] || 'draft';
  }
}
