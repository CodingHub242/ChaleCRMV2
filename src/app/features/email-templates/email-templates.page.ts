import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { EmailTemplate } from '../../models';

@Component({
  selector: 'app-email-templates',
  templateUrl: './email-templates.page.html',
  styleUrls: ['./email-templates.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class EmailTemplatesPage implements OnInit {
  templates: EmailTemplate[] = [];
  currentFilter = 'all';
  searchQuery = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    const params: any = {};
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
          this.templates = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.templates = [];
        }
      },
      error: (error) => {
        console.error('Error loading email templates:', error);
      }
    });
  }

  filterChanged(event: any) {
    this.currentFilter = event.detail.value;
    this.loadTemplates();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.loadTemplates();
  }

  viewTemplate(template: EmailTemplate) {
    this.router.navigate(['/email-templates', template.id]);
  }

  editTemplate(template: EmailTemplate) {
    this.router.navigate(['/email-templates', template.id, 'edit']);
  }

  previewTemplate(template: EmailTemplate) {
    this.apiService.previewEmailTemplate(template.id).subscribe({
      next: (response) => {
        console.log('Preview:', response.data);
      },
      error: (error) => {
        console.error('Error previewing template:', error);
      }
    });
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
      error: (error) => {
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
              error: (error) => {
                console.error('Error deleting template:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
