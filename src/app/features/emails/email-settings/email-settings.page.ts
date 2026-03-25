import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import { add, trash, sync, checkmarkCircle, warningOutline, mailOutline } from 'ionicons/icons';

interface EmailAccount {
  id: number;
  email: string;
  name: string;
  imap_host: string;
  imap_port: number;
  imap_encryption: string;
  smtp_host?: string;
  smtp_port?: number;
  is_active: boolean;
  is_default: boolean;
  last_sync_at?: string;
}

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './email-settings.page.html',
  styleUrls: ['./email-settings.page.scss']
})
export class EmailSettingsPage implements OnInit {
  accounts: EmailAccount[] = [];
  isLoading = true;

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ add, trash, sync, checkmarkCircle, warningOutline, mailOutline });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.isLoading = true;
    
    this.api.getEmailAccounts().subscribe({
      next: (response) => {
        this.accounts = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.accounts = [];
      }
    });
  }

  addAccount(): void {
    this.router.navigate(['/email-settings/new']);
  }

  editAccount(account: EmailAccount): void {
    this.router.navigate(['/email-settings', account.id]);
  }

  async deleteAccount(account: EmailAccount): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Account',
      message: `Are you sure you want to delete "${account.email}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteEmailAccount(account.id).subscribe({
              next: () => {
                this.loadAccounts();
              },
              error: () => {
                this.showError('Failed to delete account');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async setDefault(account: EmailAccount): Promise<void> {
    const data = {
      email: account.email,
      name: account.name,
      imap_host: account.imap_host,
      imap_port: account.imap_port,
      imap_encryption: account.imap_encryption,
      smtp_host: account.smtp_host,
      smtp_port: account.smtp_port,
      is_default: true
    };
    
    this.api.updateEmailAccount(account.id, data).subscribe({
      next: () => {
        this.loadAccounts();
        this.showSuccess('Default account updated');
      },
      error: () => {
        this.showError('Failed to set default account');
      }
    });
  }

  async testConnection(account: EmailAccount): Promise<void> {
    this.showSuccess(`Testing connection to ${account.email}...`);
    // This would call the test endpoint - for now just show a message
    this.loadAccounts();
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