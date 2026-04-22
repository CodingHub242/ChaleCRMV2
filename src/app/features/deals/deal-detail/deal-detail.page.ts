import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal, Contact, Company, Activity } from '../../../models';
import { PickerModalComponent, PickerItem } from '../../../shared/components/picker-modal/picker-modal.component';
import { addIcons } from 'ionicons';
import { 
  person, business, add, chevronBack, chevronDown, linkOutline,
  time, documentText, call, mail, folder, pricetag, ticket, send, createOutline, trash,
  chevronForward, checkmarkCircle, closeCircle, playCircle, play, cloudUpload,
  personOutline, businessOutline, locationOutline, flagOutline, calendarOutline,
  chatbubbleOutline, listOutline, fileTrayStacked, pricetagOutline, chatbox, locate,
  addCircle, arrowUpCircle,
  trashOutline, briefcase, trendingUp, trophy, analytics, cash,
  videocamOutline
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
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, PickerModalComponent],
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
  dealNotes: any[] = [];
  isLoadingDealNotes = true;

  // Activities
  activities: Activity[] = [];
  isLoadingActivities = true;

  // Emails
  emails: any[] = [];
  isLoadingEmails = true;

  // Files
  files: any[] = [];
  isUploading = false;

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

  // Stage flow for progress bar
  stageFlow = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];

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
      addCircle, arrowUpCircle,videocamOutline,
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
          this.loadDealNotes();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load deal');
      }
    });
  }

  loadDealNotes(): void {
    if (!this.dealId) return;
    this.isLoadingDealNotes = true;
    this.api.getDealNotes(this.dealId).subscribe({
      next: (response) => {
        if (response.success) {
          this.dealNotes = response.data || [];
        }
        this.isLoadingDealNotes = false;
      },
      error: () => {
        this.isLoadingDealNotes = false;
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
    } else if (tabKey === 'files') {
      this.loadFiles();
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

  getStageColor(stage?: string): string {
    if (stage) {
      return this.stageColors[stage] || '#999';
    }
    return this.stageColors[this.deal?.stage || 'Prospect'] || '#999';
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
    if (!this.notes.trim() || !this.dealId) return;
    
    this.isSavingNote = true;
    this.api.addDealNote(this.dealId, this.notes).subscribe({
      next: (response) => {
        this.isSavingNote = false;
        if (response.success) {
          this.notes = '';
          this.loadDealNotes();
        }
      },
      error: () => {
        this.isSavingNote = false;
      }
    });
  }

  async deleteNote(noteId: number): Promise<void> {
    if (!this.dealId) return;
    
    const alert = await this.alertController.create({
      header: 'Delete Note',
      message: 'Are you sure you want to delete this note?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteDealNote(this.dealId!, noteId).subscribe({
              next: () => {
                this.loadDealNotes();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getUserInitials(user: any): string {
    if (!user?.name) return '?';
    return user.name.charAt(0).toUpperCase();
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
    if (probability >= 70) return '#fff';
    if (probability >= 40) return '#fff';
    return 'burlywood';
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Stage progress bar methods
  getStageProgress(): number {
    const currentIndex = this.stageFlow.indexOf(this.deal?.stage || 'Prospect');
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / this.stageFlow.length) * 100;
  }

  getStagePosition(stage: string): number {
    const index = this.stageFlow.indexOf(stage);
    return (index / (this.stageFlow.length - 1)) * 100;
  }

  isStageCompleted(stage: string): boolean {
    const currentIndex = this.stageFlow.indexOf(this.deal?.stage || 'Prospect');
    const stageIndex = this.stageFlow.indexOf(stage);
    return stageIndex < currentIndex && currentIndex > 0;
  }

  async changeStage(newStage: string): Promise<void> {
    if (newStage === this.deal?.stage) return;
    
    const alert = await this.alertController.create({
      header: 'Change Stage',
      message: `Change stage to "${newStage}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Change',
          handler: () => {
            this.api.updateDealStage(this.dealId!, newStage).subscribe({
              next: (response) => {
                if (response.success) {
                  this.loadDeal();
                }
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Open contact picker
  async openContactPicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: PickerModalComponent,
      componentProps: {
        title: 'Contact',
        pickerType: 'contact',
        selectedId: this.deal?.contact_id
      },
      cssClass: 'picker-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.updateContact(result.data.id);
      }
    });

    await modal.present();
  }

  // Open company picker
  async openCompanyPicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: PickerModalComponent,
      componentProps: {
        title: 'Company',
        pickerType: 'company',
        selectedId: this.deal?.company_id
      },
      cssClass: 'picker-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.updateCompany(result.data.id);
      }
    });

    await modal.present();
  }

  // Update contact
  updateContact(contactId: number): void {
    this.api.updateDeal(this.dealId!, { contact_id: contactId }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDeal();
        }
      }
    });
  }

  // Update company
  updateCompany(companyId: number): void {
    this.api.updateDeal(this.dealId!, { company_id: companyId }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDeal();
        }
      }
    });
  }

  // File upload methods
  triggerFileUpload(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    if (!this.dealId) return;
    
    this.isUploading = true;
    // Create form data and upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('deal_id', String(this.dealId));
    
    this.api.uploadDealFile(this.dealId, formData).subscribe({
      next: (response: any) => {
        this.isUploading = false;
        if (response.success) {
          this.loadFiles();
        }
      },
      error: () => {
        this.isUploading = false;
      }
    });
  }

  loadFiles(): void {
    if (!this.dealId) return;
    this.api.getDealFiles(this.dealId).subscribe({
      next: (response) => {
        if (response.success) {
          this.files = response.data || [];
        }
      }
    });
  }

  deleteFile(fileId: number): void {
    this.api.deleteDealFile(this.dealId!, fileId).subscribe({
      next: () => {
        this.loadFiles();
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  viewFile(file: any): void {
    const baseUrl = 'https://expiry.codepps.online';
    const fileUrl = baseUrl + '/storage/' + file.file_path;
    window.open(fileUrl, '_blank');
  }
}
