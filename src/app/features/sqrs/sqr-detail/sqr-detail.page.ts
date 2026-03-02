import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Sqr, Contact, Company, Activity } from '../../../models';
import { addIcons } from 'ionicons';
import { 
  warning, alertCircle, person, business, add, chevronBack, chevronDown, linkOutline,
  time, documentText, call, mail, folder, pricetag, ticket, send, createOutline, trash,
  chevronForward, checkmarkCircle, closeCircle, playCircle, play, cloudUpload,
  personOutline, businessOutline, locationOutline, flagOutline, calendarOutline,
  chatbubbleOutline, listOutline, fileTrayStacked, pricetagOutline, chatbox, locate,
  addCircle, arrowUpCircle
} from 'ionicons/icons';

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sqr-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './sqr-detail.page.html',
  styleUrls: ['./sqr-detail.page.scss']
})
export class SqrDetailPage implements OnInit {
  sqrId: number | null = null;
  sqr: Sqr | null = null;
  isLoading = true;

  // Tabs
  activeTab = 'timeline';
  tabs: TabItem[] = [
    { key: 'timeline', label: 'Timeline', icon: 'time' },
    { key: 'notes', label: 'Notes', icon: 'document-text' },
    { key: 'activities', label: 'Activities', icon: 'play-circle' },
    { key: 'emails', label: 'Emails', icon: 'mail' },
    { key: 'history', label: 'Stage History', icon: 'list' },
    { key: 'files', label: 'Files', icon: 'folder' },
    { key: 'products', label: 'Products', icon: 'pricetag' },
    { key: 'tickets', label: 'Tickets', icon: 'ticket' }
  ];

  // Timeline data
  timelineItems: any[] = [];

  // Notes
  notes: string = '';
  isSavingNote = false;

  // Activities
  activities: Activity[] = [];
  isLoadingActivities = true;

  // Emails
  emails: any[] = [];
  isLoadingEmails = true;

  // Stage history
  stageHistory: any[] = [];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    addIcons({
      time, documentText, call, mail, folder, pricetag, ticket, send, createOutline, trash,
      chevronForward, checkmarkCircle, closeCircle, playCircle, play, cloudUpload,
      personOutline, businessOutline, locationOutline, flagOutline, calendarOutline,
      chatbubbleOutline, listOutline, fileTrayStacked, pricetagOutline, chatbox, locate,
      addCircle, arrowUpCircle,
      warning, alertCircle, person, business, add, chevronBack, chevronDown, linkOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sqrId = +id;
      this.loadSqr();
    } else {
      this.router.navigate(['/sqrs']);
    }
  }

  loadSqr(): void {
    if (!this.sqrId) return;
    
    this.isLoading = true;
    this.api.getSqr(this.sqrId).subscribe({
      next: (response) => {
        if (response.success) {
          this.sqr = response.data;
          this.loadTimeline();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load SQR');
      }
    });
  }

  loadTimeline(): void {
    // Build timeline from SQR data
    this.timelineItems = [];
    
    if (this.sqr?.created_at) {
      this.timelineItems.push({
        type: 'created',
        title: 'SQR Created',
        date: this.sqr.created_at,
        icon: 'add-circle',
        color: '#4caf50'
      });
    }

    if (this.sqr?.status === 'In Progress') {
      this.timelineItems.push({
        type: 'status',
        title: 'Status changed to In Progress',
        date: this.sqr.updated_at,
        icon: 'time',
        color: '#ff9800'
      });
    }

    if (this.sqr?.status === 'Escalated') {
      this.timelineItems.push({
        type: 'escalated',
        title: 'Ticket Escalated',
        date: this.sqr.updated_at,
        icon: 'arrow-up-circle',
        color: '#f44336'
      });
    }

    if (this.sqr?.status === 'Resolved' || this.sqr?.status === 'Closed') {
      this.timelineItems.push({
        type: 'resolved',
        title: 'Ticket Resolved',
        date: this.sqr.resolved_at || this.sqr?.updated_at,
        icon: 'checkmark-circle',
        color: '#4caf50'
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
      related_to_type: 'sqr', 
      related_to_id: this.sqrId!,
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

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'Low': '#4caf50',
      'Medium': '#ff9800',
      'High': '#f44336',
      'Critical': '#9c27b0'
    };
    return colors[priority] || '#999';
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

  async saveNote(): Promise<void> {
    if (!this.notes.trim()) return;
    
    this.isSavingNote = true;
    
    // For now, we'll just save the note as part of the description
    if (this.sqr) {
      const updateData = {
        ...this.sqr,
        description: (this.sqr.description || '') + '\n\n--- Note ---\n' + this.notes
      };
      
      this.api.updateSqr(this.sqrId!, updateData as any).subscribe({
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

  async editSqr(): Promise<void> {
    this.router.navigate(['/sqrs', this.sqrId]);
  }

  async deleteSqr(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete SQR',
      message: `Are you sure you want to delete "${this.sqr?.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteSqr(this.sqrId!).subscribe({
              next: () => {
                this.router.navigate(['/sqrs']);
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
      queryParams: { contact_id: this.sqr?.contact_id }
    });
  }

  getContactInitials(): string {
    if (!this.sqr?.contact) return '?';
    const first = this.sqr.contact.first_name?.charAt(0) || '';
    const last = this.sqr.contact.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getCompanyInitials(): string {
    if (!this.sqr?.company?.name) return '?';
    const words = this.sqr.company.name.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return this.sqr.company.name.substring(0, 2).toUpperCase();
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
