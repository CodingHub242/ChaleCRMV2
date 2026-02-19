import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Activity, Contact, Company, Deal } from '../../../models';

type ActivityType = 'call' | 'meeting' | 'note' | 'email';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './activity-form.page.html',
  styleUrls: ['./activity-form.page.scss']
})
export class ActivityFormPage implements OnInit {
  isEditing = false;
  activityId: number | null = null;
  isLoading = false;
  
  contacts: Contact[] = [];
  companies: Company[] = [];
  deals: Deal[] = [];

  activity: any = {
    title: '',
    description: '',
    type: 'call',
    due_date: '',
    duration: undefined,
    related_to_type: undefined,
    related_to_id: undefined,
    participants: []
  };

  activityTypes: { value: ActivityType; label: string; icon: string }[] = [
    { value: 'call', label: 'Call', icon: 'call' },
    { value: 'meeting', label: 'Meeting', icon: 'people' },
    { value: 'note', label: 'Note', icon: 'document-text' },
    { value: 'email', label: 'Email', icon: 'mail' }
  ];

  relatedTypes = [
    { value: 'contact', label: 'Contact' },
    { value: 'company', label: 'Company' },
    { value: 'deal', label: 'Deal' }
  ];

  callTypes = [
    { value: 'outbound', label: 'Outbound' },
    { value: 'inbound', label: 'Inbound' }
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.loadContacts();
    this.loadCompanies();
    this.loadDeals();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.activityId = +id;
      this.loadActivity();
    }
  }

  loadContacts(): void {
    this.api.getContacts({ per_page: 100 }).subscribe({
      next: (response) => {
        this.contacts = response.data;
      }
    });
  }

  loadCompanies(): void {
    this.api.getCompanies({ per_page: 100 }).subscribe({
      next: (response) => {
        this.companies = response.data;
      }
    });
  }

  loadDeals(): void {
    this.api.getDeals({ per_page: 100 }).subscribe({
      next: (response) => {
        this.deals = response.data;
      }
    });
  }

  loadActivity(): void {
    if (!this.activityId) return;
    
    this.isLoading = true;
    this.api.getActivity(this.activityId).subscribe({
      next: (response) => {
        if (response.success) {
          this.activity = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load activity');
      }
    });
  }

  getRelatedItems(): any[] {
    switch (this.activity.related_to_type) {
      case 'contact':
        return this.contacts;
      case 'company':
        return this.companies;
      case 'deal':
        return this.deals;
      default:
        return [];
    }
  }

  getRelatedItemName(item: any): string {
    if (!item) return '';
    switch (this.activity.related_to_type) {
      case 'contact':
        return `${item.first_name} ${item.last_name}`;
      case 'company':
        return item.name;
      case 'deal':
        return item.name;
      default:
        return '';
    }
  }

  onRelatedTypeChange(): void {
    this.activity.related_to_id = undefined;
  }

  setActivityType(type: ActivityType): void {
    this.activity.type = type;
  }

  formatType(type: ActivityType): string {
    return type?.charAt(0).toUpperCase() + type?.slice(1) || '';
  }

  getRelatedTypeLabel(): string {
    const type = this.relatedTypes.find(t => t.value === this.activity.related_to_type);
    return type?.label || '';
  }

  async save(): Promise<void> {
    if (!this.activity.title) {
      this.showAlert('Validation Error', 'Please enter an activity title');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    const request = this.isEditing && this.activityId
      ? this.api.updateActivity(this.activityId, this.activity)
      : this.api.createActivity(this.activity as any);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/activities']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save activity');
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
}
