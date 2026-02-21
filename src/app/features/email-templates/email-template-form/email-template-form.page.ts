import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { EmailTemplate, ApiResponse } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, eyeOutline, personOutline, documentTextOutline, peopleOutline, businessOutline, mailOutline } from 'ionicons/icons';

@Component({
  selector: 'app-email-template-form',
  templateUrl: './email-template-form.page.html',
  styleUrls: ['./email-template-form.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class EmailTemplateFormPage implements OnInit {
  template: any = {
    name: '',
    category: 'lead',
    subject: '',
    body: '',
    is_active: true
  };
  
  isLoading = false;
  isEditing = false;
  templateId: number | null = null;
  showPreview = false;

  // Categories
  categories = ['lead', 'deal', 'invoice', 'contact', 'company', 'custom', 'other'];

  // Available variables based on category
  availableVariables: string[] = [
    'contact.first_name',
    'contact.last_name',
    'contact.email',
    'contact.phone',
    'contact.company',
    'company.name',
    'company.email',
    'company.phone',
    'deal.name',
    'deal.amount',
    'deal.stage',
    'deal.expected_close_date',
    'invoice.number',
    'invoice.amount',
    'invoice.date',
    'invoice.due_date',
    'user.name',
    'user.email',
    'company.name',
    'today',
    'tomorrow'
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    addIcons({eyeOutline,personOutline,documentTextOutline,peopleOutline,businessOutline,settingsOutline,mailOutline});
  }

  ngOnInit() {
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.templateId = parseInt(id, 10);
      this.isEditing = true;
      this.loadTemplate();
    }
  }

  loadTemplate() {
    if (!this.templateId) return;
    
    this.isLoading = true;
    this.apiService.getEmailTemplates().subscribe({
      next: (response: any) => {
        const templates = response.data || [];
        const template = templates.find((t: EmailTemplate) => t.id === this.templateId);
        if (template) {
          this.template = { ...template };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading template:', error);
        this.isLoading = false;
        this.showError('Failed to load template');
      }
    });
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }

  getProcessedBody(): string {
    if (!this.template.body) return '';
    let body = this.template.body;
    
    // Replace variables with sample values for preview
    this.availableVariables.forEach((variable: string) => {
      const sampleValues: any = {
        'contact.first_name': 'John',
        'contact.last_name': 'Doe',
        'contact.email': 'john.doe@example.com',
        'contact.phone': '+1234567890',
        'contact.company': 'Acme Corp',
        'company.name': 'Acme Corp',
        'company.email': 'contact@acme.com',
        'company.phone': '+1234567890',
        'deal.name': 'Enterprise Deal',
        'deal.amount': '$10,000',
        'deal.stage': 'Negotiation',
        'deal.expected_close_date': 'December 31, 2024',
        'invoice.number': 'INV-001',
        'invoice.amount': '$1,000',
        'invoice.date': 'January 1, 2024',
        'invoice.due_date': 'January 31, 2024',
        'user.name': 'Sales Representative',
        'user.email': 'rep@example.com',
        'today': new Date().toLocaleDateString(),
        'tomorrow': new Date(Date.now() + 86400000).toLocaleDateString()
      };
      
      const regex = new RegExp(`{{${variable}}}`, 'g');
      body = body.replace(regex, sampleValues[variable] || `[${variable}]`);
    });
    
    return body;
  }

  insertTag(tag: string) {
    const textarea = document.querySelector('.editor-area textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.template.body || '';
    
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
    
    this.template.body = text.substring(0, start) + insertion + text.substring(end);
    
    // Set cursor position after insert
    setTimeout(() => {
      textarea.focus();
      const newPos = start + insertion.indexOf('>') + 1;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  insertVariable() {
    this.showVariablesList();
  }

  insertVariableValue(variable: string) {
    const textarea = document.querySelector('.editor-area textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const text = this.template.body || '';
    const insertion = `{{${variable}}}`;
    
    this.template.body = text.substring(0, start) + insertion + text.substring(start);
  }

  async showVariablesList() {
    const buttons: any[] = this.availableVariables.map((variable: string) => ({
      text: `{{${variable}}}`,
      handler: () => {
        this.insertVariableValue(variable);
      }
    }));
    
    // Add cancel button
    buttons.push({ text: 'Cancel', role: 'cancel' });
    
    const alert = await this.alertController.create({
      header: 'Insert Variable',
      message: 'Select a variable to insert:',
      buttons: buttons
    });
    await alert.present();
  }

  save() {
    if (!this.template.name) {
      this.showError('Please enter a template name');
      return;
    }

    if (!this.template.subject) {
      this.showError('Please enter a subject line');
      return;
    }

    if (this.isEditing && this.templateId) {
      this.updateTemplate();
    } else {
      this.createTemplate();
    }
  }

  createTemplate() {
    this.isLoading = true;
    this.apiService.createEmailTemplate(this.template).subscribe({
      next: (response: ApiResponse<EmailTemplate>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/email-templates']);
        } else {
          this.showError(response.message || 'Failed to create template');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating template:', error);
        this.showError('Failed to create template');
      }
    });
  }

  updateTemplate() {
    if (!this.templateId) return;
    
    this.isLoading = true;
    this.apiService.updateEmailTemplate(this.templateId, this.template).subscribe({
      next: (response: ApiResponse<EmailTemplate>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/email-templates']);
        } else {
          this.showError(response.message || 'Failed to update template');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating template:', error);
        this.showError('Failed to update template');
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
  getCategoryClass(category: string): string {
    return category || 'other';
  }

  getCategoryIcon(category: string): string {
    const icons: any = {
      lead: 'person-outline',
      deal: 'handshake-outline',
      invoice: 'document-text-outline',
      contact: 'people-outline',
      company: 'business-outline',
      custom: 'settings-outline',
      other: 'mail-outline'
    };
    return icons[category] || 'mail-outline';
  }
}
