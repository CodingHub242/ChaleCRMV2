import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { IonToggle,IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';
import { ApiService } from '../../../core/services/api.service';
import { Deal, Contact, Company, CustomField } from '../../../models';
import { CustomFieldsComponent } from '../../../shared/components/custom-fields/custom-fields.component';
import { PickerModalComponent, PickerItem } from '../../../shared/components/picker-modal/picker-modal.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, layers, time, checkmarkCircle, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline, folder, pricetagOutline, folderOutline } from 'ionicons/icons';

interface DealGroup {
  id: number;
  name: string;
  color?: string;
}

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [IonToggle,CommonModule, FormsModule, IonicModule, RouterModule, CustomFieldsComponent, PickerModalComponent],
  templateUrl: './deal-form.page.html',
  styleUrls: ['./deal-form.page.scss']
})
export class DealFormPage implements OnInit {
  isEditing = false;
  dealId: number | null = null;
  isLoading = false;
  contacts: Contact[] = [];
  companies: Company[] = [];
  groups: DealGroup[] = [];

  deal: Partial<Deal> = {
    name: '',
    amount: 0,
    currency: 'GHS',
    stage: 'Prospect',
    notes: '',
    probability: 10,
    expected_close_date: '',
    contact_id: undefined,
    company_id: undefined,
    group_id: undefined,
    description: ''
  };

  showDatePicker = false;

  // Custom fields
  customFields: CustomField[] = [];
  customFieldValues: { [key: string]: string } = {};
  showAddCustomField = false;
  newCustomField = {
    label: '',
    type: 'text',
    required: false,
    optionsText: ''
  };

  // Get custom fields for the component (type cast)
  get dealCustomFields(): any {
    return this.deal.custom_fields || [];
  }

  stages = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];
  currencies = ['GHS','USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
      addIcons({personOutline,folderOutline,locationOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline,folder,pricetagOutline});
    }

  ngOnInit(): void {
    this.loadContacts();
    this.loadCompanies();
    this.loadGroups();
    this.loadCustomFields();

    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.dealId = +id;
      this.loadDeal();
    } else {
      // Set default close date to 30 days from now
      const date = new Date();
      date.setDate(date.getDate() + 30);
      this.deal.expected_close_date = date.toISOString().split('T')[0];
    }
  }

  toggleDatePicker(ev:any): void {
    if(ev.detail.checked) this.showDatePicker = true;

    if(!ev.detail.checked) this.showDatePicker = false;
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

  loadGroups(): void {
    this.api.getDealGroups().subscribe({
      next: (response) => {
        this.groups = response.data || [];
      }
    });
  }

  loadCustomFields(): void {
    this.api.getCustomFields('deal').subscribe({
      next: (response) => {
        this.customFields = response.data || [];
      }
    });
  }

  onCustomFieldValuesChanged(values: { [key: string]: string }): void {
    this.customFieldValues = values;
  }

  openAddCustomField(): void {
    this.showAddCustomField = true;
    this.newCustomField = {
      label: '',
      type: 'text',
      required: false,
      optionsText: ''
    };
  }

  addCustomField(module: string): void {
    if (!this.newCustomField.label) return;

    const fieldData: Partial<CustomField> = {
      name: this.newCustomField.label.toLowerCase().replace(/\s+/g, '_'),
      label: this.newCustomField.label,
      type: this.newCustomField.type as any,
      required: this.newCustomField.required,
      module: module as any,
      display_order: this.customFields.length + 1,
      options: this.newCustomField.type === 'select' && this.newCustomField.optionsText
        ? this.newCustomField.optionsText.split(',').map((o: string) => o.trim())
        : []
    };

    this.api.createCustomField(fieldData).subscribe({
      next: (response) => {
        if (response.success) {
          this.customFields.push(response.data);
          this.showAddCustomField = false;
        }
      },
      error: (err) => {
        console.error('Error creating custom field:', err);
      }
    });
  }

  loadDeal(): void {
    if (!this.dealId) return;
    
    this.isLoading = true;
    this.api.getDeal(this.dealId).subscribe({
      next: (response) => {
        if (response.success) {
          this.deal = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load deal');
      }
    });
  }

  onStageChange(): void {
    const stageProbabilities: { [key: string]: number } = {
      'Prospect': 10,
      'Client': 20,
      'Demo Requested': 40,
      'Demo Completed': 60,
      'Contract In-Review': 80,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    this.deal.probability = stageProbabilities[this.deal.stage || 'Prospect'] || 10;
  }

  async showContactPicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: PickerModalComponent,
      componentProps: {
        title: 'Contact',
        pickerType: 'contact',
        selectedId: this.deal.contact_id
      },
      cssClass: 'picker-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        console.log('Selected contact:', result.data);
        this.deal.contact_id = result.data.id;
      }
    });

    await modal.present();
  }

  async showCompanyPicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: PickerModalComponent,
      componentProps: {
        title: 'Company',
        pickerType: 'company',
        selectedId: this.deal.company_id
      },
      cssClass: 'picker-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.deal.company_id = result.data.id;
      }
    });

    await modal.present();
  }

  async showGroupPicker(): Promise<void> {
    const modal = await this.modalController.create({
      component: PickerModalComponent,
      componentProps: {
        title: 'Pipeline',
        pickerType: 'group',
        selectedId: this.deal.group_id
      },
      cssClass: 'picker-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.deal.group_id = result.data.id;
      }
    });

    await modal.present();
  }

  getContactName(contactId: number | undefined): string {
    if (!contactId) return '';
    const contact = this.contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : '';
  }

  getContactInitials(contactId: number | undefined): string {
    if (!contactId) return '';
    const contact = this.contacts.find(c => c.id === contactId);
    if (!contact) return '';
    return `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`.toUpperCase();
  }

  getCompanyName(companyId: number | undefined): string {
    if (!companyId) return '';
    const company = this.companies.find(c => c.id === companyId);
    return company?.name || '';
  }

  getCompanyInitials(companyId: number | undefined): string {
    if (!companyId) return '';
    const company = this.companies.find(c => c.id === companyId);
    if (!company?.name) return '';
    const words = company.name.split(' ');
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return company.name.substring(0, 2).toUpperCase();
  }

  getGroupName(groupId: number | undefined): string {
    if (!groupId) return '';
    const group = this.groups.find(g => g.id === groupId);
    return group?.name || '';
  }

  getStageClass(stage: string): string {
    return stage?.toLowerCase().replace(/\s+/g, '-') || 'prospect';
  }

  async save(): Promise<void> {
    if (!this.deal.name) {
      this.showAlert('Validation Error', 'Please enter a deal name');
      return;
    }

    // Set custom_fields from customFieldValues
    this.deal.custom_fields = this.customFieldValues;

    const request = this.isEditing && this.dealId
      ? this.api.updateDeal(this.dealId, this.deal)
      : this.api.createDeal(this.deal as any);

    request.subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/deals']);
          this.api.getDeals();
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        this.showAlert('Error', error.error?.message || 'Failed to save deal');
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
