import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contact, Company } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline } from 'ionicons/icons';


@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './contact-form.page.html',
  styleUrls: ['./contact-form.page.scss']
})
export class ContactFormPage implements OnInit {
  isEditing = false;
  contactId: number | null = null;
  isLoading = false;
  isSaving = false;
  companies: Company[] = [];
  
  // Photo upload
  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  contact: Partial<Contact> = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    company_id: undefined,
    lead_status: '',
    source: ''
  };

  leadStatuses = [
    'New', 'Attempted to Contact', 'Connected', 'Qualified', 
    'Lost', 'Won', 'Not Contacted'
  ];

  sources = [
    'Website', 'Referral', 'LinkedIn', 'Facebook', 
    'Twitter', 'Cold Call', 'Trade Show', 'Other'
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
     addIcons({personOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
  }

  ngOnInit(): void {
    this.loadCompanies();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.contactId = +id;
      this.loadContact();
    }
  }

  loadCompanies(): void {
    this.api.getCompanies({ per_page: 100 }).subscribe({
      next: (response) => {
        this.companies = response.data;
      }
    });
  }

  loadContact(): void {
    if (!this.contactId) return;
    
    this.isLoading = true;
    this.api.getContact(this.contactId).subscribe({
      next: (response) => {
        if (response.success) {
          this.contact = response.data;
          // Set existing avatar if available
          if (this.contact.avatar) {
            this.avatarPreview = this.contact.avatar;
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load contact');
      }
    });
  }

  // Photo upload methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.avatarPreview = null;
  }

  async save(): Promise<void> {
    if (this.contact.first_name=='' || this.contact.last_name=='' || this.contact.email=='') {
      this.showAlert('Validation Error', 'Please fill in required fields');
      return;
    }

    console.log('Save clicked, selectedFile:', this.selectedFile);
    this.isSaving = true;

    try {
      const loading = await this.loadingController.create({
        message: 'Saving...',
        spinner: 'circles',
        duration: 30000
      });
      await loading.present();
      console.log('Loading presented, calling saveContact...');
      console.log('Contact data to save:', this.selectedFile);

      // If there's a selected file, we need to upload it first
      if (this.selectedFile!= null) {
        console.log('Has file, uploading...');
        this.uploadPhotoAndSave(loading);
      } else {
        console.log('No file, calling saveContact directly...');
        this.saveContact(loading, null);
      }
    } catch (error) {
      this.isSaving = false;
      console.error('Error in save:', error);
      this.showAlert('Error', 'Failed to initialize save process');
    }
  }

  private uploadPhotoAndSave(loading: HTMLIonLoadingElement): void {
    const formData = new FormData();
    formData.append('photo', this.selectedFile as File);
    formData.append('entity_type', 'contact');
    formData.append('entity_id', this.contactId ? this.contactId.toString() : '');

    // Upload photo first
    this.api.uploadPhoto(formData).subscribe({
      next: (response: any) => {
        if (response.success && response.data?.url) {
          this.contact.avatar = response.data.url;
        }
        this.saveContact(loading, response.success ? response.data?.url : null);
      },
      error: () => {
        // Continue saving even if photo upload fails
        this.isSaving = false;
        this.saveContact(loading, null);
      }
    });
  }

  private saveContact(loading: HTMLIonLoadingElement, avatarUrl: string | null): void {
    console.log('saveContact called with avatarUrl:', avatarUrl);
    const contactData = { ...this.contact };
    if (avatarUrl) {
      contactData.avatar = avatarUrl;
    }

    console.log('Contact data to save:', contactData);
    const request = this.isEditing && this.contactId
      ? this.api.updateContact(this.contactId, contactData)
      : this.api.createContact(contactData as any);

    request.subscribe({
      next: (response) => {
        console.log('API response:', response);
        loading.dismiss();
        this.isSaving = false;
        if (response.success) {
          this.router.navigate(['/contacts']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        console.error('API error:', error);
        loading.dismiss();
        this.isSaving = false;
        this.showAlert('Error', error.error?.message || 'Failed to save contact');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getInitials(): string {
    const first = this.contact.first_name?.charAt(0) || '';
    const last = this.contact.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  getAvatarColor(): string {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
}
