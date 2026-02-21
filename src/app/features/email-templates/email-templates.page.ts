import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { EmailTemplate } from '../../models';

@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.page.html',
  styleUrls: ['./email-templates.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class EmailTemplatesPage implements OnInit {
  templates: EmailTemplate[] = [];
  loading = false;
  currentFilter = 'all';
  searchQuery = '';
  
  // Stats
  totalCount = 0;
  leadCount = 0;
  dealCount = 0;
  invoiceCount = 0;
  contactCount = 0;

  // Pagination
  currentPage = 1;
  hasMore = true;

  // Categories
  categories = ['lead', 'deal', 'invoice', 'contact', 'company', 'custom', 'other'];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.loading = true;
    const params: any = {
      page: this.currentPage
    };
    
    if (this.currentFilter !== 'all') {
      params.category = this.currentFilter;
    }
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getEmailTemplates(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.templates = response;
        } else if (response?.data) {
          if (this.currentPage === 1) {
            this.templates = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          } else {
            this.templates = [...this.templates, ...(Array.isArray(response.data) ? response.data : (response.data?.data || []))];
          }
          this.hasMore = response.data?.next_page_url !== null;
        } else {
          this.templates = [];
        }
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading email templates:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalCount = this.templates.length;
    this.leadCount = this.templates.filter(t => t.category === 'lead').length;
    this.dealCount = this.templates.filter(t => t.category === 'deal').length;
    this.invoiceCount = this.templates.filter(t => t.category === 'invoice').length;
    this.contactCount = this.templates.filter(t => t.category === 'contact').length;
  }

  getActiveCount(): number {
    return this.templates.filter(t => t.is_active).length;
  }

  filterChanged(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadTemplates();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.currentPage = 1;
    this.loadTemplates();
  }

  loadMore(event: any) {
    if (this.hasMore) {
      this.currentPage++;
      this.loadTemplates();
    }
    event.target.complete();
  }

  viewTemplate(template: EmailTemplate) {
    this.router.navigate(['/email-templates', template.id]);
  }

  async presentActionSheet(event: Event, template: EmailTemplate) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'View Details',
          icon: 'eye-outline',
          handler: () => {
            this.viewTemplate(template);
          }
        },
        {
          text: 'Preview',
          icon: 'eye-outline',
          handler: () => {
            this.previewTemplate(template);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/email-templates', template.id, 'edit']);
          }
        },
        {
          text: 'Duplicate',
          icon: 'copy-outline',
          handler: () => {
            this.duplicateTemplate(template);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteTemplate(template);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  editTemplate(template: EmailTemplate) {
    this.router.navigate(['/email-templates', template.id, 'edit']);
  }

  async previewTemplate(template: EmailTemplate) {
    const alert = await this.alertController.create({
      header: template.name,
      message: `
        <div style="padding: 10px;">
          <p><strong>Subject:</strong> ${template.subject}</p>
          <hr/>
          <div style="max-height: 300px; overflow-y: auto; white-space: pre-wrap;">${template.body}</div>
        </div>
      `,
      buttons: ['Close', 'Edit'],
      cssClass: 'preview-alert'
    });
    await alert.present();
  }

  duplicateTemplate(template: EmailTemplate) {
    const duplicatedData = {
      name: `${template.name} (Copy)`,
      category: template.category,
      subject: template.subject,
      body: template.body
    };
    this.apiService.createEmailTemplate(duplicatedData).subscribe({
      next: () => {
        this.loadTemplates();
      },
      error: (error: any) => {
        console.error('Error duplicating template:', error);
      }
    });
  }

  async deleteTemplate(template: EmailTemplate) {
    const alert = await this.alertController.create({
      header: 'Delete Template',
      message: `Are you sure you want to delete "${template.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteEmailTemplate(template.id).subscribe({
              next: () => {
                this.loadTemplates();
              },
              error: (error: any) => {
                console.error('Error deleting template:', error);
              }
            });
          }
        }
      ]
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

  getPreviewText(body: string): string {
    if (!body) return '';
    // Strip HTML tags
    const text = body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }
}
