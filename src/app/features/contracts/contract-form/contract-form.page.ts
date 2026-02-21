import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, PickerController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contract, Contact, Company, Deal, ContractSigner, ApiResponse } from '../../../models';

@Component({
  selector: 'app-contract-form',
  templateUrl: './contract-form.page.html',
  styleUrls: ['./contract-form.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class ContractFormPage implements OnInit {
  contract: any = {
    title: '',
    type: 'sales',
    status: 'draft',
    start_date: '',
    end_date: '',
    value: 0,
    currency: 'USD',
    content: '',
    signers: []
  };
  
  isLoading = false;
  isEditing = false;
  contractId: number | null = null;

  // Lists for pickers
  contacts: Contact[] = [];
  companies: Company[] = [];
  deals: Deal[] = [];

  // Contract types and statuses
  contractTypes = ['sales', 'service', 'nda', 'employment', 'partnership', 'other'];
  contractStatuses = ['draft', 'pending', 'active', 'expired', 'terminated', 'cancelled'];
  
  // Currency options
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private pickerController: PickerController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.contractId = parseInt(id, 10);
      this.isEditing = true;
      this.loadContract();
    }
    
    // Load related data
    this.loadContacts();
    this.loadCompanies();
    this.loadDeals();
  }

  loadContract() {
    if (!this.contractId) return;
    
    this.isLoading = true;
    this.apiService.getContracts({ per_page: 1 }).subscribe({
      next: (response: any) => {
        const contracts = response.data?.data || response.data || [];
        const contract = contracts.find((c: Contract) => c.id === this.contractId);
        if (contract) {
          this.contract = { ...contract };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading contract:', error);
        this.isLoading = false;
        this.showError('Failed to load contract');
      }
    });
  }

  loadContacts() {
    this.apiService.getContacts({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.contacts = response.data?.data || response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  loadCompanies() {
    this.apiService.getCompanies({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.companies = response.data?.data || response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadDeals() {
    this.apiService.getDeals({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.deals = response.data?.data || response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading deals:', error);
      }
    });
  }

  async showContactPicker() {
    const contactsForPicker = this.contacts.map(c => ({
      text: `${c.first_name} ${c.last_name}`,
      value: c.id
    }));

    if (contactsForPicker.length === 0) {
      const alert = await this.alertController.create({
        header: 'No Contacts',
        message: 'No contacts available. Please create a contact first.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'contact',
          options: contactsForPicker
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: (selected: any) => {
            this.contract.customer_id = selected.contact.value;
          }
        }
      ]
    });
    await picker.present();
  }

  async showCompanyPicker() {
    const companiesForPicker = this.companies.map(c => ({
      text: c.name,
      value: c.id
    }));

    if (companiesForPicker.length === 0) {
      const alert = await this.alertController.create({
        header: 'No Companies',
        message: 'No companies available. Please create a company first.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'company',
          options: companiesForPicker
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: (selected: any) => {
            this.contract.company_id = selected.company.value;
          }
        }
      ]
    });
    await picker.present();
  }

  async showDealPicker() {
    const dealsForPicker = this.deals.map(d => ({
      text: d.name,
      value: d.id
    }));

    if (dealsForPicker.length === 0) {
      const alert = await this.alertController.create({
        header: 'No Deals',
        message: 'No deals available. Please create a deal first.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'deal',
          options: dealsForPicker
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Select',
          handler: (selected: any) => {
            this.contract.deal_id = selected.deal.value;
          }
        }
      ]
    });
    await picker.present();
  }

  async addSigner() {
    const alert = await this.alertController.create({
      header: 'Add Signer',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Signer name'
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Signer email'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data: any) => {
            if (data.name && data.email) {
              if (!this.contract.signers) {
                this.contract.signers = [];
              }
              this.contract.signers.push({
                id: Date.now(),
                name: data.name,
                email: data.email
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  removeSigner(index: number) {
    if (this.contract.signers) {
      this.contract.signers.splice(index, 1);
    }
  }

  save() {
    if (!this.contract.title) {
      this.showError('Please enter a contract title');
      return;
    }

    if (this.isEditing && this.contractId) {
      this.updateContract();
    } else {
      this.createContract();
    }
  }

  createContract() {
    this.isLoading = true;
    this.apiService.createContract(this.contract).subscribe({
      next: (response: ApiResponse<Contract>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/contracts']);
        } else {
          this.showError(response.message || 'Failed to create contract');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating contract:', error);
        this.showError('Failed to create contract');
      }
    });
  }

  updateContract() {
    if (!this.contractId) return;
    
    this.isLoading = true;
    this.apiService.updateContract(this.contractId, this.contract).subscribe({
      next: (response: ApiResponse<Contract>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/contracts']);
        } else {
          this.showError(response.message || 'Failed to update contract');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating contract:', error);
        this.showError('Failed to update contract');
      }
    });
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Helper methods
  getTypeClass(type: string): string {
    return type || 'other';
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      sales: 'cart-outline',
      service: 'construct-outline',
      nda: 'shield-checkmark-outline',
      employment: 'people-outline',
      partnership: 'handshake-outline',
      other: 'document-outline'
    };
    return icons[type] || 'document-outline';
  }

  getStatusClass(status: string): string {
    const statusMap: any = {
      draft: 'draft',
      pending: 'pending',
      active: 'active-status',
      expired: 'expired',
      terminated: 'terminated',
      cancelled: 'cancelled'
    };
    return statusMap[status] || 'draft';
  }

  getContactInitials(): string {
    if (!this.contract.customer_id) return '';
    const contact = this.contacts.find(c => c.id === this.contract.customer_id);
    if (!contact) return '';
    return `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`.toUpperCase();
  }

  getContactName(): string {
    if (!this.contract.customer_id) return '';
    const contact = this.contacts.find(c => c.id === this.contract.customer_id);
    if (!contact) return '';
    return `${contact.first_name} ${contact.last_name}`;
  }

  getCompanyInitials(): string {
    if (!this.contract.company_id) return '';
    const company = this.companies.find(c => c.id === this.contract.company_id);
    if (!company) return '';
    return company.name.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  getCompanyName(): string {
    if (!this.contract.company_id) return '';
    const company = this.companies.find(c => c.id === this.contract.company_id);
    return company?.name || '';
  }

  getDealInitials(): string {
    if (!this.contract.deal_id) return '';
    return 'DL';
  }

  getDealName(): string {
    if (!this.contract.deal_id) return '';
    const deal = this.deals.find(d => d.id === this.contract.deal_id);
    return deal?.name || '';
  }

  getSignerInitials(signer: ContractSigner): string {
    return signer.name.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }
}
