import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Sqr, Contact, Company, User } from '../../../models';
import { addIcons } from 'ionicons';
import { warning, alertCircle, person, business, add, chevronBack, chevronDown, linkOutline, personAdd } from 'ionicons/icons';

@Component({
  selector: 'app-sqr-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './sqr-form.page.html',
  styleUrls: ['./sqr-form.page.scss']
})
export class SqrFormPage implements OnInit {
  isEditing = false;
  sqrId: number | null = null;
  isLoading = false;
  isSaving = false;
  
  contacts: Contact[] = [];
  companies: Company[] = [];
  assignees: User[] = [];

  sqr: Partial<Sqr> = {
    title: '',
    type: 'Complaint',
    priority: 'Medium',
    status: 'Open',
    description: '',
    contact_id: undefined,
    company_id: undefined,
    assigned_to: undefined,
    resolution_notes: ''
  };

  types = ['Complaint', 'Feedback', 'Suggestion', 'Inquiry'];
  priorities = ['Low', 'Medium', 'High', 'Critical'];
  statuses = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ linkOutline, personAdd, warning, alertCircle, person, business, add, chevronBack, chevronDown });
  }

  ngOnInit(): void {
    this.loadContacts();
    this.loadCompanies();
    this.loadAssignees();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.sqrId = +id;
      this.loadSqr();
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

  loadAssignees(): void {
    // Load organization users for assignment
    this.api.getOrganizationUsers().subscribe({
      next: (response) => {
        this.assignees = response.data || [];
      }
    });
  }

  loadSqr(): void {
    if (!this.sqrId) return;
    
    this.isLoading = true;
    this.api.getSqr(this.sqrId).subscribe({
      next: (response) => {
        if (response.success) {
          this.sqr = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load SQR');
      }
    });
  }

  async save(): Promise<void> {
    if (!this.sqr.title) {
      this.showAlert('Validation Error', 'Please enter a title');
      return;
    }

    this.isSaving = true;

    try {
    //   const loading = await this.loadingController.create({
    //     message: 'Saving...',
    //     spinner: 'circles',
    //     duration: 30000
    //   });
    //   await loading.present();

      const request = this.isEditing && this.sqrId
        ? this.api.updateSqr(this.sqrId, this.sqr as any)
        : this.api.createSqr(this.sqr as any);

      request.subscribe({
        next: (response) => {
          //loading.dismiss();
          this.isSaving = false;
          if (response.success) {
            this.router.navigate(['/sqrs']);
            //reload sqrs after navigation
            this.api.getSqrs();
          } else {
            this.showAlert('Error', response.message);
          }
        },
        error: (error) => {
         // loading.dismiss();
          this.isSaving = false;
          this.showAlert('Error', error.error?.message || 'Failed to save SQR');
        }
      });
    } catch (error) {
      this.isSaving = false;
      console.error('Error saving:', error);
      this.showAlert('Error', 'Failed to save SQR');
    }
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
