import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Company, Contact, Deal, Task, Activity } from '../../../models';
import { addIcons } from 'ionicons';
import { 
  briefcase, add, trash, create, mail, document, close, eye, download, 
  checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, 
  checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, 
  chevronDown, person, logOut, list, calendar, analytics, trendingUp, 
  flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, 
  cash, people, trophyOutline, callOutline, chatbubbleOutline, 
  calendarOutline, personOutline, flagOutline, sendOutline, call, locationOutline,
  globeOutline, peopleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './company-detail.page.html',
  styleUrls: ['./company-detail.page.scss']
})
export class CompanyDetailPage implements OnInit {
  company: Company | null = null;
  isLoading = true;
  activeTab = 'details';
  
  // Related data
  contacts: Contact[] = [];
  deals: Deal[] = [];
  tasks: Task[] = [];
  activities: Activity[] = [];
  isLoadingRelated = false;

  tabs = [
    { key: 'details', label: 'Details', icon: 'business-outline' },
    { key: 'contacts', label: 'Contacts', icon: 'people-outline' },
    { key: 'deals', label: 'Deals', icon: 'trending-up-outline' },
    { key: 'tasks', label: 'Tasks', icon: 'checkbox-outline' },
    { key: 'activities', label: 'Activities', icon: 'calendar-outline' },
    { key: 'notes', label: 'Notes', icon: 'document-text-outline' }
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
      calendarOutline, sendOutline, call, locationOutline, globeOutline, peopleOutline
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompany(+id);
    }
  }

  loadCompany(id: number): void {
    this.isLoading = true;
    this.api.getCompany(id).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.company = response.data;
          this.contacts = response.data.contacts;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to load company', 'danger');
      }
    });
  }

  loadRelatedData(): void {
    if (!this.company) return;
    
    this.isLoadingRelated = true;
    
    // Load contacts for this company
    this.api.getContacts({ per_page: 100 }).subscribe({
      next: (response:any) => {
       // console.log(response.data['contacts']);
        //this.contacts = response.data.contacts;
       // console.log(this.contacts);
        //response.data.filter(c => c.company_id === this.company?.id);
      }
    });

    // Load deals for this company
    this.api.getDeals({ per_page: 50 }).subscribe({
      next: (response) => {
        this.deals = response.data.filter(d => d.company_id === this.company?.id);
      }
    });

    // Load tasks
    this.api.getTasks({ per_page: 50 }).subscribe({
      next: (response) => {
        this.tasks = response.data.slice(0, 10);
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
    if (!this.company?.name) return '?';
    const words = this.company.name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.company.name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(): string {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCompanyDescription(): string {
    if (!this.company) return '';
    return (this.company as any)['description'] || '';
  }

  hasCompanyDescription(): boolean {
    return !!this.getCompanyDescription();
  }

  editCompany(): void {
    if (this.company?.id) {
      this.router.navigate(['/companies', this.company.id]);
    }
  }

  async deleteCompany(): Promise<void> {
    if (!this.company?.id) return;

    const alert = await this.alertController.create({
      header: 'Delete Company',
      message: `Are you sure you want to delete ${this.company.name}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteCompany(this.company!.id!).subscribe({
              next: () => {
                this.router.navigate(['/companies']);
              },
              error: () => {
                this.showToast('Failed to delete company', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async sendEmail(): Promise<void> {
    if (!this.company?.email) return;
    this.router.navigate(['/send-email'], { 
      queryParams: { to: this.company.email } 
    });
  }

  async makeCall(): Promise<void> {
    if (!this.company?.phone) return;
    window.location.href = `tel:${this.company.phone}`;
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
