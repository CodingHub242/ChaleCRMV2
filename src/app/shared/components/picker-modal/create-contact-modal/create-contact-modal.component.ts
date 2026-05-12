import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ApiService } from '../../../../core/services/api.service';
import { Contact, Company, CustomField, CustomFieldValue } from '../../../../models';
import { addIcons } from 'ionicons';
import {
  briefcase, add, trash, create, mail, document, close, eye, download, checkmark,
  arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time,
  alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar,
  analytics, people, flag, folderOpen, ellipse, business, notificationsOutline,
  settingsOutline, cash, callOutline, chatbubbleOutline, calendarOutline, personOutline,
  flagOutline, optionsOutline, addCircleOutline, createOutline,
  trendingUp,
  trophyOutline
} from 'ionicons/icons';
import { CustomFieldsComponent } from '../../custom-fields/custom-fields.component';

@Component({
  selector: 'app-create-contact-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, CustomFieldsComponent],
  template: `
    <ion-header>
      <ion-toolbar class="bigin-header">
        <ion-buttons slot="start">
          <ion-button (click)="dismiss()">
            <ion-icon slot="icon-only" name="arrow-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Create Contact</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="save()" [strong]="true" class="save-btn">Save</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="bigin-content">
      <div class="form-page">
        <div class="form-card">
          <!-- Profile Photo Section -->
          <div class="profile-section">
            <div class="profile-avatar" [style.background]="avatarPreview || getAvatarColor()">
              <img *ngIf="avatarPreview" [src]="avatarPreview" alt="Avatar" class="avatar-preview" />
              <span *ngIf="!avatarPreview">{{ getInitials() }}</span>
            </div>
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" hidden />
            <ion-button fill="clear" class="change-photo-btn" (click)="fileInput.click()">
              <ion-icon slot="start" name="camera-outline"></ion-icon>
              {{ avatarPreview ? 'Change Photo' : 'Add Photo' }}
            </ion-button>
            <ion-button *ngIf="avatarPreview" fill="clear" color="danger" class="remove-photo-btn" (click)="removePhoto()">
              <ion-icon slot="start" name="trash-outline"></ion-icon>
              Remove
            </ion-button>
          </div>

          <!-- Basic Information -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <ion-icon name="person-outline"></ion-icon>
              </div>
              <h3>Basic Information</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <ion-input [(ngModel)]="contact.first_name" name="first_name" placeholder="Enter first name"></ion-input>
              </div>

              <div class="form-field">
                <ion-input [(ngModel)]="contact.last_name" name="last_name" placeholder="Enter last name"></ion-input>
              </div>

              <div class="form-field full-width">
                <ion-input type="email" [(ngModel)]="contact.email" name="email" placeholder="Enter email address"></ion-input>
              </div>

              <div class="form-field">
                <ion-input type="tel" [(ngModel)]="contact.phone" name="phone" placeholder="Enter phone number"></ion-input>
              </div>

              <div class="form-field">
                <ion-input type="tel" [(ngModel)]="contact.mobile" name="mobile" placeholder="Enter mobile number"></ion-input>
              </div>
            </div>
          </div>

          <!-- Company Information -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <ion-icon name="business-outline"></ion-icon>
              </div>
              <h3>Company Information</h3>
            </div>

            <div class="form-grid">
              <div class="form-field full-width">
                <ion-select [(ngModel)]="contact.company_id" name="company_id" interface="popover" placeholder="Select a company">
                  <ion-select-option [value]="undefined">No Company</ion-select-option>
                  <ion-select-option *ngFor="let company of companies" [value]="company.id">
                    {{ company.name }}
                  </ion-select-option>
                </ion-select>
              </div>
            </div>
          </div>

          <!-- Lead Information -->
          <div class="form-section">
            <div class="section-header">
              <div class="section-icon">
                <ion-icon name="flag-outline"></ion-icon>
              </div>
              <h3>Lead Information</h3>
            </div>

            <div class="form-grid">
              <div class="form-field">
                <ion-select [(ngModel)]="contact.lead_status" name="lead_status" interface="popover" placeholder="Select status">
                  <ion-select-option value="">Select Status</ion-select-option>
                  <ion-select-option *ngFor="let status of leadStatuses" [value]="status">
                    {{ status }}
                  </ion-select-option>
                </ion-select>
              </div>

              <div class="form-field">
                <ion-select [(ngModel)]="contact.source" name="source" interface="popover" placeholder="Select source">
                  <ion-select-option value="">Select Source</ion-select-option>
                  <ion-select-option *ngFor="let source of sources" [value]="source">
                    {{ source }}
                  </ion-select-option>
                </ion-select>
              </div>
            </div>
          </div>

          <!-- Custom Fields Section -->
          <div class="form-section" *ngIf="customFields.length > 0">
            <div class="section-header">
              <div class="section-icon">
                <ion-icon name="options-outline"></ion-icon>
              </div>
              <h3>Custom Information</h3>
            </div>

            <app-custom-fields
              [fields]="customFields"
              [entityValues]="customFieldValues"
              (valuesChanged)="onCustomFieldChange($event)">
            </app-custom-fields>

            <!-- Add Another Field -->
            <div class="add-field-inline" (click)="openAddCustomField()">
              <ion-icon name="add-circle-outline"></ion-icon>
              <span>Add Custom Field</span>
            </div>
          </div>

          <!-- Add Custom Field Inline Form -->
          <div class="form-section" *ngIf="showAddCustomField">
            <div class="section-header">
              <div class="section-icon">
                <ion-icon name="create-outline"></ion-icon>
              </div>
              <h3>New Custom Field</h3>
            </div>

            <div class="form-grid">
              <div class="form-field full-width">
                <ion-label>Field Label *</ion-label>
                <ion-input [(ngModel)]="newCustomField.label" placeholder="e.g., Reference Number"></ion-input>
              </div>

              <div class="form-field">
                <ion-label>Field Type</ion-label>
                <ion-select [(ngModel)]="newCustomField.type" interface="popover">
                  <ion-select-option value="text">Text</ion-select-option>
                  <ion-select-option value="textarea">Long Text</ion-select-option>
                  <ion-select-option value="number">Number</ion-select-option>
                  <ion-select-option value="date">Date</ion-select-option>
                  <ion-select-option value="select">Dropdown</ion-select-option>
                </ion-select>
              </div>

              <div class="form-field" *ngIf="newCustomField.type === 'select'">
                <ion-label>Options</ion-label>
                <ion-input [(ngModel)]="newCustomField.optionsText" placeholder="Option 1, Option 2"></ion-input>
              </div>
            </div>

            <div class="inline-actions">
              <ion-button fill="clear" style="--background:transparent;--color:gray;color:gray;" (click)="showAddCustomField = false">Cancel</ion-button>
              <ion-button (click)="addCustomField()" [disabled]="!newCustomField.label">
                <ion-icon name="add" slot="start"></ion-icon>
                Add Field
              </ion-button>
            </div>
          </div>

          <!-- No Custom Fields - Show Add Button -->
          <div class="form-section" *ngIf="customFields.length === 0 && !showAddCustomField">
            <div class="add-field-empty" (click)="openAddCustomField()">
              <div class="section-icon">
                <ion-icon name="options-outline"></ion-icon>
              </div>
              <p>Add custom fields to capture additional information</p>
              <ion-button size="small">
                <ion-icon name="add" slot="start"></ion-icon>
                Add Custom Field
              </ion-button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <ion-button expand="block" class="cancel-btn" fill="outline" (click)="dismiss()">
              Cancel
            </ion-button>
            <ion-button expand="block" class="save-btn-full" (click)="save()" [disabled]="isSaving">
              <ion-spinner *ngIf="isSaving" name="circular" style="margin-right: 8px;"></ion-spinner>
              {{ isSaving ? 'Saving...' : 'Create Contact' }}
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .bigin-header {
      --background: #073336;
      --border-color: #e0e0e0;
      --color: #e3e3e3;
    }

    .bigin-header ion-title {
      font-weight: 600;
    }

    .bigin-content {
      --background: #f5f7fa;
    }

    .save-btn {
      --color: #073336;
      font-weight: 600;
    }

    .form-page {
      display: flex;
      justify-content: center;
      padding: 20px;
      min-height: calc(100vh - 56px);
    }

    .form-card {
      width: 100%;
      max-width: 600px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      padding: 24px;
    }

    .profile-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0;
      border-bottom: 1px solid #f0f0f0;
      margin-bottom: 24px;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 36px;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #073336 0%, #073336 100%) !important;
      overflow: hidden;
    }

    .avatar-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .change-photo-btn {
      --color: #fff;
      font-size: 14px;
      background: #073336;
      border-radius: 10px;
    }

    .remove-photo-btn {
      --color: #f5576c;
      font-size: 13px;
      margin-top: 4px;
    }

    .form-section {
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .section-icon ion-icon {
      font-size: 18px;
      color: #667eea;
    }

    .section-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a2e;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field ion-label {
      font-size: 13px;
      color: #666;
      margin-bottom: 6px;
    }

    .form-field ion-input,
    .form-field ion-select {
      --background: #f8f9fa;
      --border-radius: 10px;
      --padding-start: 12px;
      --padding-end: 12px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      border: 1px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .form-field ion-input:focus,
    .form-field ion-select:focus {
      --background: #ffffff;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-field ion-input::placeholder {
      color: #aaa;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f0f0f0;
    }

    .cancel-btn {
      --border-color: #e0e0e0;
      --color: #666;
      --border-radius: 10px;
      height: 48px;
      font-weight: 500;
    }

    .save-btn-full {
      --background: #073336;
      --background-hover: #0581b6;
      --border-radius: 10px;
      height: 48px;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .form-page {
        padding: 12px;
      }

      .form-card {
        padding: 16px;
        border-radius: 12px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-field.full-width {
        grid-column: 1;
      }

      .form-actions {
        grid-template-columns: 1fr;
      }
    }

    .add-field-inline {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      margin-top: 12px;
      background: #f8f9fa;
      border: 1px dashed #c0c0c0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .add-field-inline:hover {
      background: #f0f4f8;
      border-color: #073336;
      color: #073336;
    }

    .add-field-inline ion-icon {
      font-size: 20px;
    }

    .add-field-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: #f8f9fa;
      border: 1px dashed #c0c0c0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .add-field-empty:hover {
      background: #f0f4f8;
      border-color: #073336;
    }

    .add-field-empty .section-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, rgba(7, 51, 54, 0.1) 0%, rgba(7, 51, 54, 0.05) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .add-field-empty .section-icon ion-icon {
      font-size: 28px;
      color: #073336;
    }

    .add-field-empty p {
      color: #666;
      font-size: 14px;
      margin: 0 0 16px;
    }

    .add-field-empty ion-button {
      --background: #073336;
      --color: #fff;
      --border-radius: 8px;
    }

    .inline-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }

    .inline-actions ion-button {
      --background: #073336;
      --color: #fff;
      --border-radius: 8px;
      height: 40px;
      font-weight: 500;
    }
  `]
})
export class CreateContactModalComponent implements OnInit {
  isLoading = false;
  isSaving = false;
  companies: Company[] = [];

  // Custom fields
  customFields: CustomField[] = [];
  customFieldValues: CustomFieldValue[] = [];
  customFieldData: { [key: string]: string } = {};
  showAddCustomField = false;
  newCustomField: any = {
    label: '',
    type: 'text',
    optionsText: '',
    module: 'contacts'
  };

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
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({
      personOutline, flagOutline, briefcase, notificationsOutline, settingsOutline,
      trophyOutline, trendingUp, cash, chevronBack, chevronForward, chevronDown,
      alertCircle, add, trash, create, mail, document, close, eye, download,
      checkmark, arrowBack, arrowUp, arrowDown, filter, checkmarkCircle, cloudUpload,
      layers, time, person, logOut, list, calendar, analytics, people, flag,
      folderOpen, ellipse, business, callOutline, chatbubbleOutline, calendarOutline,
      optionsOutline, addCircleOutline, createOutline
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadCustomFields();
  }

  loadCustomFields(): void {
    this.api.getCustomFields('contacts').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customFields = response.data;
        }
      },
      error: () => {
        console.log('No custom fields found for contacts');
      }
    });
  }

  onCustomFieldChange(values: { [key: string]: string }): void {
    this.customFieldData = values;
  }

  openAddCustomField(): void {
    this.showAddCustomField = true;
    this.newCustomField = {
      label: '',
      type: 'text',
      optionsText: '',
      module: 'contacts'
    };
  }

  addCustomField(): void {
    if (!this.newCustomField.label) {
      this.showAlert('Error', 'Please enter a field label');
      return;
    }

    const fieldData: any = {
      label: this.newCustomField.label,
      type: this.newCustomField.type,
      module: 'contacts',
      required: false
    };

    if (this.newCustomField.type === 'select' && this.newCustomField.optionsText) {
      fieldData.options = this.newCustomField.optionsText.split(',').map((opt: string) => opt.trim());
    }

    this.api.createCustomField(fieldData).subscribe({
      next: (response) => {
        if (response.success) {
          this.customFields.push(response.data);
          this.showAddCustomField = false;
          this.showAlert('Success', 'Custom field added successfully');
        }
      },
      error: (err) => {
        console.error('Error creating custom field:', err);
        this.showAlert('Error', 'Failed to create custom field');
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

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
    if (this.contact.first_name == '' || this.contact.last_name == '' || this.contact.email == '') {
      this.showAlert('Validation Error', 'Please fill in required fields');
      return;
    }

    this.isSaving = true;

    try {
      if (this.selectedFile != null) {
        this.uploadPhotoAndSave();
      } else {
        this.saveContact(null);
      }
    } catch (error) {
      this.isSaving = false;
      this.showAlert('Error', 'Failed to initialize save process');
    }
  }

  private uploadPhotoAndSave(): void {
    const formData = new FormData();
    formData.append('photo', this.selectedFile as File);
    formData.append('entity_type', 'contact');
    formData.append('entity_id', '');

    this.api.uploadPhoto(formData).subscribe({
      next: (response: any) => {
        if (response.success && response.data?.url) {
          this.contact.avatar = response.data.url;
        }
        this.saveContact(response.success ? response.data?.url : null);
      },
      error: () => {
        this.isLoading = false;
        this.saveContact(null);
      }
    });
  }

  private saveContact(avatarUrl: string | null): void {
    const contactData: any = { ...this.contact };
    if (avatarUrl) {
      contactData.avatar = avatarUrl;
    }

    if (Object.keys(this.customFieldData).length > 0) {
      contactData.custom_fields = this.customFieldData;
    }

    this.api.createContact(contactData as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.modalController.dismiss(response.data);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
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

  dismiss(): void {
    this.modalController.dismiss(null);
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