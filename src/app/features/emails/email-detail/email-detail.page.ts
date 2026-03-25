import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import { arrowBack, send, mailOutline } from 'ionicons/icons';

interface EmailContent {
  uid: number;
  message_id?: string;
  from: string;
  from_email: string;
  from_name: string;
  to: string;
  to_email: string;
  cc?: string;
  subject: string;
  date: string;
  seen: boolean;
  body: string;
  html_body: string;
}

@Component({
  selector: 'app-email-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './email-detail.page.html',
  styleUrls: ['./email-detail.page.scss']
})
export class EmailDetailPage implements OnInit {
  email: EmailContent | null = null;
  isLoading = true;
  showReplyForm = false;
  replyTo = '';
  replyCc = '';
  replySubject = '';
  replyBody = '';
  isSending = false;

  private accountId!: number;
  private uid!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private alertController: AlertController
  ) {
    addIcons({ arrowBack, send, mailOutline });
  }

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('accountId'));
    this.uid = Number(this.route.snapshot.paramMap.get('uid'));
    
    this.loadEmailContent();
  }

  loadEmailContent(): void {
    this.isLoading = true;
    
    this.api.getEmailContent(this.accountId, this.uid).subscribe({
      next: (response) => {
        this.email = response.data;
        this.isLoading = false;
        
        // Pre-fill reply form
        if (this.email) {
          this.replyTo = this.email.from_email;
          this.replySubject = this.email.subject?.startsWith('Re:') 
            ? this.email.subject 
            : `Re: ${this.email.subject}`;
          this.replyCc = this.email.cc || '';
        }
      },
      error: () => {
        this.isLoading = false;
        this.showError('Failed to load email');
      }
    });
  }

  toggleReplyForm(): void {
    this.showReplyForm = !this.showReplyForm;
  }

  async sendReply(): Promise<void> {
    if (!this.replyBody.trim() || !this.replyTo) {
      return;
    }

    this.isSending = true;

    const replyData = {
      to: this.replyTo,
      subject: this.replySubject,
      body: this.replyBody,
      cc: this.replyCc || undefined,
      in_reply_to: this.email?.message_id,
      references: this.email?.message_id
    };

    this.api.sendEmailReply(this.accountId, replyData).subscribe({
      next: (response) => {
        this.isSending = false;
        if (response.success) {
          this.showReplyForm = false;
          this.replyBody = '';
          this.showSuccess('Reply sent successfully');
        } else {
          this.showError(response.message || 'Failed to send reply');
        }
      },
      error: () => {
        this.isSending = false;
        this.showError('Failed to send reply');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/emails']);
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }

  getInitials(email: string): string {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
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