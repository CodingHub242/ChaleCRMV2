import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Deal, Contact, Company } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-deal-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './deal-form.page.html',
  styleUrls: ['./deal-form.page.scss']
})
export class DealFormPage implements OnInit {
  isEditing = false;
  dealId: number | null = null;
  isLoading = false;
  contacts: Contact[] = [];
  companies: Company[] = [];

  deal: Partial<Deal> = {
    name: '',
    amount: 0,
    currency: 'GHS',
    stage: 'New',
    probability: 10,
    expected_close_date: '',
    contact_id: undefined,
    company_id: undefined,
    description: ''
  };

  stages = ['New', 'Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) {
      addIcons({personOutline,locationOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
    }

  ngOnInit(): void {
    this.loadContacts();
    this.loadCompanies();
    
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
      'New': 10,
      'Qualification': 20,
      'Needs Analysis': 40,
      'Proposal': 60,
      'Negotiation': 80,
      'Closed Won': 100,
      'Closed Lost': 0
    };
    this.deal.probability = stageProbabilities[this.deal.stage || 'New'] || 10;
  }

  async showContactPicker(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Select Contact',
      buttons: [
        ...this.contacts.map(contact => ({
          text: `${contact.first_name} ${contact.last_name}`,
          handler: () => {
            this.deal.contact_id = contact.id;
          }
        })),
        ...(this.deal.contact_id ? [{
          text: 'Remove Contact',
          handler: () => {
            this.deal.contact_id = undefined;
          }
        }] : []),
        {
          text: 'Cancel',
          role: 'cancel' as const
        }
      ]
    });
    await alert.present();
  }

  async showCompanyPicker(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Select Company',
      buttons: [
        ...this.companies.map(company => ({
          text: company.name,
          handler: () => {
            this.deal.company_id = company.id;
          }
        })),
        ...(this.deal.company_id ? [{
          text: 'Remove Company',
          handler: () => {
            this.deal.company_id = undefined;
          }
        }] : []),
        {
          text: 'Cancel',
          role: 'cancel' as const
        }
      ]
    });
    await alert.present();
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

  getStageClass(stage: string): string {
    return stage?.toLowerCase().replace(/\s+/g, '-') || 'new';
  }

  async save(): Promise<void> {
    if (!this.deal.name) {
      this.showAlert('Validation Error', 'Please enter a deal name');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    const request = this.isEditing && this.dealId
      ? this.api.updateDeal(this.dealId, this.deal)
      : this.api.createDeal(this.deal as any);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/deals']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        loading.dismiss();
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
