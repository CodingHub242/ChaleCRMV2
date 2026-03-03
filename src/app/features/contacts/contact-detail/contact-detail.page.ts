import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contact, Company, Deal, Task, Activity } from '../../../models';
import { addIcons } from 'ionicons';
import { 
  briefcase, add, trash, create, mail, document, close, eye, download, 
  checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, 
  checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, 
  chevronDown, person, logOut, list, calendar, analytics, trendingUp, 
  flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, 
  cash, people, trophyOutline, callOutline, chatbubbleOutline, 
  calendarOutline, personOutline, flagOutline, sendOutline, call, locationOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './contact-detail.page.html',
  styleUrls: ['./contact-detail.page.scss']
})
export class ContactDetailPage implements OnInit {
  contact: Contact | null = null;
  isLoading = true;
  activeTab = 'details';
  
  // Related data
  deals: Deal[] = [];
  tasks: Task[] = [];
  activities: Activity[] = [];
  isLoadingRelated = false;

  tabs = [
    { key: 'details', label: 'Details', icon: 'person-outline' },
    { key: 'deals', label: 'Deals', icon: 'trending-up-outline' },
    { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
    { key: 'activities', label: 'Activities', icon: 'calendar-outline' },
    { key: 'notes', label: 'Notes', icon: 'document-text-outline' },
    { key: 'emails', label: 'Emails', icon: 'mail-outline' }
  ];

  private avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      personOutline, flagOutline, briefcase, notificationsOutline, settingsOutline,
      trophyOutline, trendingUp, cash, chevronBack, chevronForward, chevronDown,
      alertCircle, add, trash, create, mail, document, close, eye, download,
      checkmark, arrowBack, arrowUp, arrowDown, filter, checkmarkCircle,
      cloudUpload, layers, time, person, logOut, list, calendar, analytics,
      people, flag, folderOpen, ellipse, business, callOutline, chatbubbleOutline,
      calendarOutline, sendOutline, call, locationOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadContact(+id);
    }
  }

  loadContact(id: number): void {
    this.isLoading = true;
    this.api.getContact(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.contact = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load contact', 'danger');
      }
    });
  }

  loadRelatedData(): void {
    if (!this.contact) return;
    
    this.isLoadingRelated = true;
    
    // Load deals for this contact
    this.api.getDeals({ per_page: 50 }).subscribe({
      next: (response) => {
        this.deals = response.data.filter(d => d.contact_id === this.contact?.id);
      }
    });

    // Load tasks for this contact
    this.api.getTasks({ per_page: 50 }).subscribe({
      next: (response) => {
        // Tasks may not have contact_id, show all for now
        this.tasks = response.data.slice(0, 10);
      }
    });

    // Load activities for this contact
    this.api.getActivities({ per_page: 50 }).subscribe({
      next: (response) => {
        this.activities = response.data;
        this.isLoadingRelated = false;
      },
      error: () => {
        this.isLoadingRelated = false;
      }
    });
  }

  onTabClick(tabKey: string): void {
    this.activeTab = tabKey;
    if (tabKey !== 'details' && tabKey !== 'notes') {
      this.loadRelatedData();
    }
  }

  isTabActive(tabKey: string): boolean {
    return this.activeTab === tabKey;
  }

  getInitials(): string {
    if (!this.contact) return '?';
    const first = this.contact.first_name?.charAt(0) || '';
    const last = this.contact.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getAvatarColor(): string {
    if (!this.contact) return this.avatarColors[0];
    const index = this.contact.id % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getFullName(): string {
    if (!this.contact) return '';
    return `${this.contact.first_name || ''} ${this.contact.last_name || ''}`.trim();
  }

  getStatusClass(): string {
    const statusMap: { [key: string]: string } = {
      'new': 'new',
      'attempted to contact': 'contacted',
      'connected': 'connected',
      'qualified': 'qualified',
      'lost': 'lost',
      'won': 'won',
      'not contacted': 'not-contacted'
    };
    return statusMap[this.contact?.lead_status?.toLowerCase() || ''] || 'new';
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  editContact(): void {
    if (this.contact?.id) {
      this.router.navigate(['/contacts', this.contact.id]);
    }
  }

  async deleteContact(): Promise<void> {
    if (!this.contact?.id) return;

    const alert = await this.alertController.create({
      header: 'Delete Contact',
      message: `Are you sure you want to delete ${this.getFullName()}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteContact(this.contact!.id!).subscribe({
              next: () => {
                this.router.navigate(['/contacts']);
              },
              error: () => {
                this.showToast('Failed to delete contact', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async sendEmail(): Promise<void> {
    if (!this.contact?.email) return;
    this.router.navigate(['/send-email'], { 
      queryParams: { to: this.contact.email } 
    });
  }

  async makeCall(): Promise<void> {
    if (!this.contact?.phone) return;
    window.location.href = `tel:${this.contact.phone}`;
  }

  private async showToast(message: string, color: string = 'primary'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
