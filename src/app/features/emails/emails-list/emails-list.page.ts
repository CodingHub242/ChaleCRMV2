import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController, RefresherEventDetail } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import { mailOutline, refresh, settings, search, chevronForward, warningOutline } from 'ionicons/icons';

interface EmailMessage {
  uid: number;
  message_id?: string;
  from: string;
  from_email: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  seen: boolean;
  answered?: boolean;
  flagged?: boolean;
  size: number;
}

interface EmailAccount {
  id: number;
  email: string;
  name: string;
  is_default: boolean;
}

@Component({
  selector: 'app-emails-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './emails-list.page.html',
  styleUrls: ['./emails-list.page.scss']
})
export class EmailsListPage implements OnInit {
  emails: EmailMessage[] = [];
  accounts: EmailAccount[] = [];
  selectedAccountId: number | null = null;
  isLoading = true;
  isRefreshing = false;
  searchQuery = '';
  errorMessage = '';
  hasEmailAccount = false;
  sqrsCreatedCount = 0;

  constructor(
    private api: ApiService,
    private alertController: AlertController,
    private router: Router
  ) {
    addIcons({ mailOutline, refresh, settings, search, chevronForward, warningOutline });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.api.getEmailAccounts().subscribe({
      next: (response) => {
        this.accounts = response.data || [];
        
        // Find default account or first active account
        const defaultAccount = this.accounts.find(a => a.is_default) || this.accounts[0];
        
        if (defaultAccount) {
          this.hasEmailAccount = true;
          this.selectedAccountId = defaultAccount.id;
          this.loadEmails();
        } else {
          this.hasEmailAccount = false;
          this.isLoading = false;
        }
      },
      error: () => {
        this.hasEmailAccount = false;
        this.isLoading = false;
      }
    });
  }

  loadEmails(createSqrs: boolean = false): void {
    if (!this.selectedAccountId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.api.fetchEmails(this.selectedAccountId, undefined, createSqrs).subscribe({
      next: (response: any) => {
        this.emails = response.data || [];
        this.isLoading = false;
        this.isRefreshing = false;
        
        // Show notification if sqrs were created
        if (response.meta?.sqrs_created > 0) {
          this.sqrsCreatedCount = response.meta.sqrs_created;
          setTimeout(() => this.sqrsCreatedCount = 0, 5000);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.isRefreshing = false;
        this.errorMessage = 'Failed to fetch emails. Please check your email account settings.';
        this.showError('Failed to fetch emails', this.errorMessage);
      }
    });
  }

  onRefresh(event: any): void {
    this.isRefreshing = true;
    this.loadEmails();
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    // Filter locally for now
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      // This would need backend support for proper search
    } else {
      this.loadEmails();
    }
  }

  onAccountChange(event: any): void {
    this.selectedAccountId = event.detail.value;
    this.loadEmails();
  }

  viewEmail(email: EmailMessage): void {
    if (this.selectedAccountId) {
      this.router.navigate(['/emails/view', this.selectedAccountId, email.uid]);
    }
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (days === 1) {
        return 'Yesterday';
      } else if (days < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  }

  truncateSubject(subject: string, maxLength: number = 60): string {
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength) + '...';
  }

  getInitials(fromEmail: string): string {
    const name = fromEmail.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  }

  async showError(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  openSettings(): void {
    this.router.navigate(['/email-settings']);
  }
}