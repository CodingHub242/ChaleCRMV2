import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { IonContent,IonTextarea, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';
import { Segment, SegmentCondition, ApiResponse } from '../../../models';

@Component({
  selector: 'app-segment-form',
  templateUrl: './segment-form.page.html',
  styleUrls: ['./segment-form.page.scss'],
  standalone: true,
  imports: [IonContent, IonTextarea,IonHeader, IonTitle, IonToolbar,IonButton,IonButtons,IonIcon,IonModal,IonRow,IonCol,IonMenuButton, IonLabel, IonItem, IonDatetime,CommonModule, IonicModule, FormsModule, RouterModule],
})
export class SegmentFormPage implements OnInit {
  segment: any = {
    name: '',
    type: 'contact',
    description: '',
    logic: 'and',
    conditions: []
  };
  
  isLoading = false;
  isEditing = false;
  segmentId: number | null = null;

  // Segment types
  segmentTypes = ['contact', 'company', 'lead', 'deal'];

  // Available fields based on type
  contactFields = ['first_name', 'last_name', 'email', 'phone', 'company', 'source', 'lead_status'];
  companyFields = ['name', 'email', 'phone', 'industry', 'city', 'country'];
  leadFields = ['first_name', 'last_name', 'email', 'phone', 'source', 'lead_status'];
  dealFields = ['name', 'amount', 'stage', 'probability', 'expected_close_date'];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.segmentId = parseInt(id, 10);
      this.isEditing = true;
      this.loadSegment();
    }
  }

  loadSegment() {
    if (!this.segmentId) return;
    
    this.isLoading = true;
    this.apiService.getSegments().subscribe({
      next: (response: any) => {
        const segments = response.data || [];
        const segment = segments.find((s: Segment) => s.id === this.segmentId);
        if (segment) {
          this.segment = { ...segment };
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading segment:', error);
        this.isLoading = false;
        this.showError('Failed to load segment');
      }
    });
  }

  addCondition() {
    if (!this.segment.conditions) {
      this.segment.conditions = [];
    }
    this.segment.conditions.push({
      field: '',
      operator: 'equals',
      value: ''
    });
  }

  removeCondition(index: number) {
    if (this.segment.conditions) {
      this.segment.conditions.splice(index, 1);
    }
  }

  getAvailableFields(): string[] {
    switch (this.segment.type) {
      case 'contact': return this.contactFields;
      case 'company': return this.companyFields;
      case 'lead': return this.leadFields;
      case 'deal': return this.dealFields;
      default: return this.contactFields;
    }
  }

  save() {
    if (!this.segment.name) {
      this.showError('Please enter a segment name');
      return;
    }

    if (this.isEditing && this.segmentId) {
      this.updateSegment();
    } else {
      this.createSegment();
    }
  }

  createSegment() {
    this.isLoading = true;
    this.apiService.createSegment(this.segment).subscribe({
      next: (response: ApiResponse<Segment>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/segments']);
        } else {
          this.showError(response.message || 'Failed to create segment');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating segment:', error);
        this.showError('Failed to create segment');
      }
    });
  }

  updateSegment() {
    if (!this.segmentId) return;
    
    this.isLoading = true;
    this.apiService.updateSegment(this.segmentId, this.segment).subscribe({
      next: (response: ApiResponse<Segment>) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/segments']);
        } else {
          this.showError(response.message || 'Failed to update segment');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating segment:', error);
        this.showError('Failed to update segment');
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
      contact: 'person-outline',
      company: 'business-outline',
      lead: 'trending-up-outline',
      deal: 'handshake-outline',
      other: 'people-outline'
    };
    return icons[type] || 'people-outline';
  }
}
