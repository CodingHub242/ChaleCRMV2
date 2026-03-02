import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal, Contact, Company, Activity } from '../../../models';
import { addIcons } from 'ionicons';
import { 
  person, business, add, chevronBack, chevronDown, linkOutline,
  time, documentText, call, mail, folder, pricetag, ticket, send, createOutline, trash,
  chevronForward, checkmarkCircle, closeCircle, playCircle, play, cloudUpload,
  personOutline, businessOutline, locationOutline, flagOutline, calendarOutline,
  chatbubbleOutline, listOutline, fileTrayStacked, pricetagOutline, chatbox, locate,
  addCircle, arrowUpCircle,
  trashOutline, briefcase, trendingUp, trophy, analytics, cash
} from 'ionicons/icons';

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

interface TimelineItem {
  type: string;
  title: string;
  date: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-deal-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './deal-detail.page.html',
  styleUrls: ['./deal-detail.page.scss']
})
export class DealDetailPage implements OnInit {
  dealId: number | null = null;
  deal: Deal | null = null;
  isLoading = true;

  // Tabs
  activeTab = 'timeline';
  tabs: TabItem[] = [
    { key: 'timeline', label: 'Timeline', icon: 'time' },
    { key: 'notes', label: 'Notes', icon: 'document-text' },
    { key: 'activities', label: 'Activities', icon: 'play-circle' },
    { key: 'emails', label: 'Emails', icon: 'mail' },
    { key: 'products', label: 'Products', icon: 'pricetag' },
    { key: 'quotes', label: 'Quotes', icon: 'document-text' },
    { key: 'files', label: 'Files', icon: 'folder' }
  ];

  // Timeline data
  timelineItems: TimelineItem[] = [];

  // Notes
  notes: string = '';
  isSavingNote = false;

  // Activities
  activities: Activity[] = [];
  isLoadingActivities = true;

  // Emails
  emails: any[] = [];
  isLoadingEmails = true;

  // Sales Pipeline Stages
  stageColors: { [key: string]: string } = {
    'Prospect': '#2196F3',
    'Client': '#9C27B0',
    'Demo Requested': '#FF9800',
    'Demo Completed': '#00BCD4',
    'Contract In-Review': '#795548',
    'Closed Won': '#4CAF50',
    'Closed Lost': '#F44336'
  };

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    addIcons({
      time, trashOutline, documentText, call, mail, folder, pricetag, ticket, send, createOutline, trash,
      chevronForward, checkmarkCircle, closeCircle, playCircle, play, cloudUpload,
      personOutline, businessOutline, locationOutline, flagOutline, calendarOutline,
      chatbubbleOutline, listOutline, fileTrayStacked, pricetagOutline, chatbox, locate,
      addCircle, arrowUpCircle,
      person, business, add, chevronBack, chevronDown, linkOutline, briefcase, trendingUp, trophy, analytics, cash
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dealId = +id;
      this.loadDeal();
    } else {
      this.router.navigate(['/deals']);
    }
  }

  loadDeal(): void {
    if (!this.dealId) return;
    
    this.isLoading = true;
    this.api.getDeal(this.dealId).subscribe({
      next: (response) => {
        if (response.success) {
          this.deal = response.data;
          this.loadTimeline();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load deal');
      }
    });
  }

  loadTimeline(): void {
    this.timelineItems = [];
    
    if (this.deal?.created_at) {
      this.timelineItems.push({
        type: 'created',
        title: 'Deal Created',
        date: this.deal.created_at,
        icon: 'add-circle',
        color: '#4caf50'
      });
    }

    // Add stage-based timeline items
    if (this.deal?.stage === 'Prospect') {
      this.timelineItems.push({
        type: 'stage',
        title: 'Stage changed to Prospect',
        date: this.deal.updated_at,
        icon: 'person-outline',
        color: '#2196F3'
      });
    } else if (this.deal?.stage === 'Client') {
      this.timelineItems.push({
        type: 'stage',
        title: 'Moved to Client',
        date: this.deal.updated_at,
        icon: 'people-outline',
        color: '#9C27B0'
      });
    } else if (this.deal?.stage === 'Demo Requested') {
      this.timelineItems.push({
        type: 'stage',
        title: 'Demo Requested',
        date: this.deal.updated_at,
        icon: 'videocam-outline',
        color: '#FF9800'
      });
    } else if (this.deal?.stage === 'Demo Completed') {
      this.timelineItems.push({
        type: 'stage',
        title: 'Demo Completed',
        date: this.deal.updated_at,
        icon: 'checkmark-circle-outline',
        color: '#00BCD4'
      });
    } else if (this.deal?.stage === 'Contract In-Review') {
      this.timelineItems.push({
        type: 'stage',
        title: 'Contract In-Review',
        date: this.deal.updated_at,
        icon: 'document-text-outline',
        color: '#795548'
      });
    } else if (this.deal?.stage === 'Closed Won') {
      this.timelineItems.push({
        type: 'won',
        title: 'Deal Won!',
        date: this.deal.updated_at,
        icon: 'trophy-outline',
        color: '#4caf50'
      });
    } else if (this.deal?.stage === 'Closed Lost') {
      this.timelineItems.push({
        type: 'lost',
        title: 'Deal Lost',
        date: this.deal.updated_at,
        icon: 'close-circle-outline',
        color: '#F44336'
      });
    }

    // Sort by date descending
    this.timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Load activities
    this.loadActivities();
  }

  loadActivities(): void {
    this.isLoadingActivities = true;
    this.api.getActivities({ 
      related_to_type: 'deal', 
      related_to_id: this.dealId!,
      per_page: 20 
    }).subscribe({
      next: (response) => {
        this.activities = response.data;
        this.isLoadingActivities = false;
      },
      error: () => {
        this.isLoadingActivities = false;
      }
    });
  }

  loadEmails(): void {
    this.isLoadingEmails = true;
    // For now, we'll just show empty - can be extended with email history
    this.emails = [];
    this.isLoadingEmails = false;
  }

  onTabClick(tabKey: string): void {
    this.activeTab = tabKey;
    if (tabKey === 'activities' && this.activities.length === 0) {
      this.loadActivities();
    } else if (tabKey === 'emails') {
      this.loadEmails();
    }
  }

  isTabActive(tabKey: string): boolean {
    return this.activeTab === tabKey;
  }

  getStageClass(stage: string): string {
    const stageMap: { [key: string]: string } = {
      'Prospect': 'stage-prospect',
      'Client': 'stage-client',
      'Demo Requested': 'stage-demo-requested',
      'Demo Completed': 'stage-demo-completed',
      'Contract In-Review': 'stage-contract',
      'Closed Won': 'stage-won',
      'Closed Lost': 'stage-lost'
    };
    return stageMap[stage] || 'stage-prospect';
  }

  getStageColor(stage: string): string {
    return this.stageColors[stage] || '#999';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.deal?.currency || 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  async saveNote(): Promise<void> {
    if (!this.notes.trim()) return;
    
    this.isSavingNote = true;
    
    // Save the note as part of the description
    if (this.deal) {
      const updateData = {
        ...this.deal,
        description: (this.deal.description || '') + '\n\n--- Note ---\n' + this.notes
      };
      
      this.api.updateDeal(this.dealId!, updateData).subscribe({
        next: (response) => {
          this.isSavingNote = false;
          if (response.success) {
            this.notes = '';
            this.loadTimeline();
          }
        },
        error: () => {
          this.isSavingNote = false;
        }
      });
    }
  }

  async editDeal(): Promise<void> {
    this.router.navigate(['/deals', this.dealId]);
  }

  async deleteDeal(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Deal',
      message: `Are you sure you want to delete "${this.deal?.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteDeal(this.dealId!).subscribe({
              next: () => {
                this.router.navigate(['/deals']);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async sendEmail(): Promise<void> {
    // Navigate to email compose or open modal
    this.router.navigate(['/email-templates/send'], { 
      queryParams: { contact_id: this.deal?.contact_id }
    });
  }

  getContactInitials(): string {
    if (!this.deal?.contact) return '?';
    const first = this.deal.contact.first_name?.charAt(0) || '';
    const last = this.deal.contact.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getCompanyInitials(): string {
    if (!this.deal?.company?.name) return '?';
    const words = this.deal.company.name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return this.deal.company.name.substring(0, 2).toUpperCase();
  }

  getProbabilityColor(probability: number): string {
    if (probability >= 70) return '#4caf50';
    if (probability >= 40) return '#ff9800';
    return '#f44336';
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
