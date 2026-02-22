import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contact, EmailTemplate } from '../../../models';
import { addIcons } from 'ionicons';
import { 
  arrowBack, 
  eyeOutline, 
  paperPlaneOutline, 
  peopleOutline, 
  addCircleOutline, 
  closeCircle,
  searchOutline,
  mailOutline,
  settingsOutline,
  codeSlashOutline,
  closeOutline,
  personOutline
} from 'ionicons/icons';

interface SelectedContact {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.page.html',
  styleUrls: ['./send-email.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class SendEmailPage implements OnInit {
  // Form data
  emailData = {
    subject: '',
    body: ''
  };

  // Recipients
  selectedContacts: SelectedContact[] = [];
  ccEmails = '';
  bccEmails = '';
  customEmail = '';

  // Template
  selectedTemplateId: number | null = null;
  emailTemplates: EmailTemplate[] = [];

  // Options
  saveToHistory = true;
  sendCopyToSelf = false;

  // Contact picker
  showContactPickerModal = false;
  contactSearch = '';
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  tempSelectedContactIds: number[] = [];

  // Preview
  showPreview = false;

  // Available variables
  availableVariables = [
    'contact.first_name',
    'contact.last_name',
    'contact.email',
    'contact.phone',
    'contact.company',
    'company.name',
    'user.name',
    'today',
    'tomorrow'
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private apiService: ApiService
  ) {
    addIcons({
      arrowBack,
      eyeOutline,
      paperPlaneOutline,
      peopleOutline,
      addCircleOutline,
      closeCircle,
      searchOutline,
      mailOutline,
      settingsOutline,
      codeSlashOutline,
      closeOutline,
      personOutline
    });
  }

  ngOnInit() {
    this.loadEmailTemplates();
    this.loadContacts();

    // Check if template_id was passed
    const templateId = this.route.snapshot.queryParamMap.get('template_id');
    if (templateId) {
      this.selectedTemplateId = parseInt(templateId, 10);
      this.loadTemplateData();
    }

    // Check if contact_id was passed
    const contactId = this.route.snapshot.queryParamMap.get('contact_id');
    if (contactId) {
      this.loadContact(parseInt(contactId, 10));
    }
  }

  loadEmailTemplates() {
    this.apiService.getEmailTemplates().subscribe({
      next: (response: any) => {
        this.emailTemplates = response.data || [];
        // Filter to only active templates
        this.emailTemplates = this.emailTemplates.filter(t => t.is_active);
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  loadContacts() {
    this.apiService.getContacts({ per_page: 100 }).subscribe({
      next: (response: any) => {
        this.contacts = response.data || [];
        this.filteredContacts = [...this.contacts];
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  loadContact(contactId: number) {
    this.apiService.getContact(contactId).subscribe({
      next: (response: any) => {
        if (response.data) {
          const contact = response.data;
          this.selectedContacts.push({
            id: contact.id,
            name: contact.name,
            email: contact.email
          });
        }
      },
      error: (error) => {
        console.error('Error loading contact:', error);
      }
    });
  }

  loadTemplateData() {
    if (!this.selectedTemplateId) return;

    const template = this.emailTemplates.find(t => t.id === this.selectedTemplateId);
    if (template) {
      this.emailData.subject = template.subject || '';
      this.emailData.body = template.body || '';
    }
  }

  onTemplateChange() {
    this.loadTemplateData();
  }

  // Contact picker methods
  showContactPicker() {
    this.tempSelectedContactIds = this.selectedContacts.map(c => c.id);
    this.filteredContacts = [...this.contacts];
    this.contactSearch = '';
    this.showContactPickerModal = true;
  }

  searchContacts() {
    const search = this.contactSearch.toLowerCase();
    this.filteredContacts = this.contacts.filter(c => 
      c.name?.toLowerCase().includes(search) || 
      c.email?.toLowerCase().includes(search)
    );
  }

  isContactSelected(contactId: number): boolean {
    return this.tempSelectedContactIds.includes(contactId);
  }

  toggleContact(contact: Contact) {
    const index = this.tempSelectedContactIds.indexOf(contact.id);
    if (index > -1) {
      this.tempSelectedContactIds.splice(index, 1);
    } else {
      this.tempSelectedContactIds.push(contact.id);
    }
  }

  getSelectedCount(): number {
    return this.tempSelectedContactIds.length;
  }

  confirmContactSelection() {
    this.selectedContacts = this.contacts
      .filter(c => this.tempSelectedContactIds.includes(c.id))
      .map(c => ({
        id: c.id,
        name: c.name || 'Unknown',
        email: c.email
      }));
    this.showContactPickerModal = false;
  }

  removeContact(index: number) {
    this.selectedContacts.splice(index, 1);
  }

  addCustomEmail() {
    const email = this.customEmail?.trim();
    if (!email) {
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.showToast('Please enter a valid email address', 'warning');
      return;
    }
    
    // Check if already added
    const exists = this.selectedContacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      this.showToast('This email is already added', 'warning');
      this.customEmail = '';
      return;
    }
    
    // Add as custom recipient
    const name = email.split('@')[0];
    this.selectedContacts.push({
      id: 0, // 0 indicates custom email
      name: name,
      email: email
    });
    
    this.customEmail = '';
    this.showToast('Email added', 'success');
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  // Email methods
  canSend(): boolean {
    const hasRecipients = this.selectedContacts.length > 0;
    const hasSubject = !!this.emailData.subject?.trim();
    return hasRecipients && hasSubject;
  }

  async sendEmail() {
    if (!this.canSend()) {
      this.showToast('Please select at least one recipient and enter a subject', 'warning');
      return;
    }

    const toEmails = this.selectedContacts.map(c => c.email);
    const cc = this.ccEmails ? this.ccEmails.split(',').map(e => e.trim()).filter(e => e) : [];
    const bcc = this.bccEmails ? this.bccEmails.split(',').map(e => e.trim()).filter(e => e) : [];

    const sendData: any = {
      to: toEmails,
      subject: this.emailData.subject,
      body: this.emailData.body,
      template_id: this.selectedTemplateId || undefined
    };

    if (cc.length > 0) sendData.cc = cc;
    if (bcc.length > 0) sendData.bcc = bcc;

    this.apiService.sendEmail(sendData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.showToast('Email sent successfully!', 'success');
          setTimeout(() => {
            this.router.navigate(['/email-templates']);
          }, 1000);
        } else {
          this.showToast(response.message || 'Failed to send email', 'error');
        }
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.showToast('Failed to send email. Please try again.', 'error');
      }
    });
  }

  // Editor methods
  insertTag(tag: string) {
    const textarea = document.querySelector('.editor-area textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.emailData.body || '';
    
    let insertion = '';
    switch (tag) {
      case 'b':
        insertion = `<strong></strong>`;
        break;
      case 'i':
        insertion = `<em></em>`;
        break;
      case 'u':
        insertion = `<u></u>`;
        break;
      case 'br':
        insertion = `<br>`;
        break;
      case 'a':
        insertion = `<a href=""></a>`;
        break;
    }
    
    this.emailData.body = text.substring(0, start) + insertion + text.substring(end);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.indexOf('>') + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  async showVariablesList() {
    const buttons: any[] = this.availableVariables.map(variable => ({
      text: `{{${variable}}}`,
      handler: () => {
        this.insertVariable(variable);
      }
    }));
    
    buttons.push({ text: 'Cancel', role: 'cancel' });
    
    const alert = await this.alertController.create({
      header: 'Insert Variable',
      message: 'Select a variable to insert:',
      buttons: buttons,
      cssClass: 'variable-alert'
    });
    await alert.present();
  }

  insertVariable(variable: string) {
    const textarea = document.querySelector('.editor-area textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const text = this.emailData.body || '';
    const insertion = `{{${variable}}}`;
    
    this.emailData.body = text.substring(0, start) + insertion + text.substring(start);
  }

  // Preview methods
  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  getRecipientDisplay(): string {
    if (this.selectedContacts.length === 0) return 'No recipients';
    if (this.selectedContacts.length === 1) {
      return `${this.selectedContacts[0].name} <${this.selectedContacts[0].email}>`;
    }
    return `${this.selectedContacts[0].name} and ${this.selectedContacts.length - 1} more`;
  }

  getProcessedBody(): string {
    if (!this.emailData.body) return '<p style="color: #999;">No content</p>';
    
    let body = this.emailData.body;
    
    // Replace variables with sample values for preview
    const sampleValues: any = {
      'contact.first_name': 'John',
      'contact.last_name': 'Doe',
      'contact.email': 'john.doe@example.com',
      'contact.phone': '+1234567890',
      'contact.company': 'Acme Corp',
      'company.name': 'Acme Corp',
      'user.name': 'Sales Representative',
      'today': new Date().toLocaleDateString(),
      'tomorrow': new Date(Date.now() + 86400000).toLocaleDateString()
    };
    
    this.availableVariables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      body = body.replace(regex, sampleValues[variable] || `[${variable}]`);
    });
    
    return body;
  }

  async showToast(message: string, type: 'success' | 'error' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'danger',
      position: 'top'
    });
    await toast.present();
  }
}
