import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Company } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './company-form.page.html',
  styleUrls: ['./company-form.page.scss']
})
export class CompanyFormPage implements OnInit {
  isEditing = false;
  companyId: number | null = null;
  isLoading = false;
  
  // Logo upload
  selectedFile: File | null = null;
  logoPreview: string | null = null;

  company: Partial<Company> = {
    name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    industry: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: ''
  };

  industries = [
    'Advertising', 'Agriculture', 'Automotive', 'Banking', 'Biotechnology',
    'Chemical', 'Communications', 'Construction', 'Consulting', 'Consumer Products',
    'Education', 'Electronics', 'Energy', 'Engineering', 'Entertainment',
    'Finance', 'Food & Beverage', 'Government', 'Healthcare', 'Hospitality',
    'Insurance', 'Manufacturing', 'Media', 'Non-profit', 'Real Estate',
    'Retail', 'Shipping', 'Technology', 'Telecommunications', 'Transportation',
    'Other'
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { 
      addIcons({personOutline,locationOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
    }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.companyId = +id;
      this.loadCompany();
    }
  }

  loadCompany(): void {
    if (!this.companyId) return;
    
    this.isLoading = true;
    this.api.getCompany(this.companyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.company = response.data;
          if (this.company.logo) {
            this.logoPreview = this.company.logo;
          }
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load company');
      }
    });
  }

  // Logo upload methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removePhoto(): void {
    this.selectedFile = null;
    this.logoPreview = null;
  }

  async save(): Promise<void> {
    if (!this.company.name) {
      this.showAlert('Validation Error', 'Please enter a company name');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    // If there's a selected file, we need to upload it first
    if (this.selectedFile) {
      this.uploadLogoAndSave(loading);
    } else {
      this.saveCompany(loading, null);
    }
  }

  private uploadLogoAndSave(loading: HTMLIonLoadingElement): void {
    const formData = new FormData();
    formData.append('photo', this.selectedFile as File);
    formData.append('entity_type', 'company');
    formData.append('entity_id', this.companyId ? this.companyId.toString() : '');

    this.api.uploadPhoto(formData).subscribe({
      next: (response: any) => {
        if (response.success && response.data?.url) {
          this.company.logo = response.data.url;
        }
        this.saveCompany(loading, response.success ? response.data?.url : null);
      },
      error: () => {
        this.saveCompany(loading, null);
      }
    });
  }

  private saveCompany(loading: HTMLIonLoadingElement, logoUrl: string | null): void {
    const companyData = { ...this.company };
    if (logoUrl) {
      companyData.logo = logoUrl;
    }

    const request = this.isEditing && this.companyId
      ? this.api.updateCompany(this.companyId, companyData)
      : this.api.createCompany(companyData as any);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/companies']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save company');
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
    return this.company.name?.charAt(0).toUpperCase() || 'C';
  }

  getAvatarColor(): string {
    return 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)';
  }
}
