import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import { arrowBack, checkmarkCircle, warningOutline } from 'ionicons/icons';

interface EmailAccount {
  id?: number;
  email: string;
  name: string;
  imap_host: string;
  imap_port: number;
  imap_encryption: string;
  username: string;
  password?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_encryption: string;
  is_default: boolean;
  auto_create_sqr: boolean;
}

@Component({
  selector: 'app-email-settings-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './email-settings-form.page.html',
  styleUrls: ['./email-settings-form.page.scss']
})
export class EmailSettingsFormPage implements OnInit {
  isEdit = false;
  isLoading = false;
  isSaving = false;
  isTesting = false;
  accountId: number | null = null;

  account: EmailAccount = {
    email: '',
    name: '',
    imap_host: '',
    imap_port: 993,
    imap_encryption: 'ssl',
    username: '',
    password: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_encryption: 'tls',
    is_default: false,
    auto_create_sqr: true
  };

  // Common email providers
  commonProviders = [
    { name: 'Gmail', imap: 'imap.gmail.com', smtp: 'smtp.gmail.com' },
    { name: 'Outlook', imap: 'outlook.office365.com', smtp: 'smtp.office365.com' },
    { name: 'Yahoo', imap: 'imap.mail.yahoo.com', smtp: 'smtp.mail.yahoo.com' },
    { name: 'Zoho Mail', imap: 'imap.zoho.com', smtp: 'smtp.zoho.com' },
    { name: 'Custom', imap: '', smtp: '' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ arrowBack, checkmarkCircle, warningOutline });
  }

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('id') 
      ? Number(this.route.snapshot.paramMap.get('id')) 
      : null;
    
    if (this.accountId) {
      this.isEdit = true;
      this.loadAccount();
    }
  }

  loadAccount(): void {
    this.isLoading = true;
    
    this.api.getEmailAccount(this.accountId!).subscribe({
      next: (response) => {
        const data = response.data;
        this.account = {
          email: data.email || '',
          name: data.name || '',
          imap_host: data.imap_host || '',
          imap_port: data.imap_port || 993,
          imap_encryption: data.imap_encryption || 'ssl',
          username: data.username || '',
          password: '', // Don't show password
          smtp_host: data.smtp_host || '',
          smtp_port: data.smtp_port || 587,
          smtp_encryption: data.smtp_encryption || 'tls',
          is_default: data.is_default || false,
          auto_create_sqr: data.auto_create_sqr ?? true
        };
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load account');
      }
    });
  }

  selectProvider(provider: any): void {
    if (provider.name !== 'Custom') {
      this.account.imap_host = provider.imap;
      this.account.smtp_host = provider.smtp;
    }
  }

  async testConnection(): Promise<void> {
    if (!this.validateForm()) return;

    this.isTesting = true;
    const loading = await this.loadingController.create({
      message: 'Testing connection...'
    });
    await loading.present();

    const testData = {
      imap_host: this.account.imap_host,
      imap_port: this.account.imap_port,
      imap_encryption: this.account.imap_encryption,
      username: this.account.username,
      password: this.account.password
    };

    this.api.testEmailConnection(testData).subscribe({
      next: (response) => {
        loading.dismiss();
        this.isTesting = false;
        if (response.success) {
          this.showSuccess('Connection successful!');
        } else {
          this.showError(response.message || 'Connection failed');
        }
      },
      error: (err) => {
        loading.dismiss();
        this.isTesting = false;
        this.showError('Connection test failed');
      }
    });
  }

  async save(): Promise<void> {
    if (!this.validateForm()) return;

    this.isSaving = true;
    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    if (this.isEdit && this.accountId) {
      const updateData = { ...this.account };
      // Don't send empty password
      if (!updateData.password) {
        delete updateData.password;
      }
      
      this.api.updateEmailAccount(this.accountId, updateData).subscribe({
        next: () => {
          loading.dismiss();
          this.isSaving = false;
          this.showSuccess('Account updated successfully');
          this.router.navigate(['/email-settings']);
        },
        error: () => {
          loading.dismiss();
          this.isSaving = false;
          this.showError('Failed to update account');
        }
      });
    } else {
      this.api.createEmailAccount(this.account).subscribe({
        next: () => {
          loading.dismiss();
          this.isSaving = false;
          this.showSuccess('Account added successfully');
          this.router.navigate(['/email-settings']);
        },
        error: () => {
          loading.dismiss();
          this.isSaving = false;
          this.showError('Failed to add account');
        }
      });
    }
  }

  validateForm(): boolean {
    if (!this.account.email) {
      this.showError('Please enter email address');
      return false;
    }
    if (!this.account.imap_host) {
      this.showError('Please enter IMAP host');
      return false;
    }
    if (!this.account.username) {
      this.showError('Please enter username');
      return false;
    }
    if (!this.isEdit && !this.account.password) {
      this.showError('Please enter password');
      return false;
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/email-settings']);
  }

  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showSuccess(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Success',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}