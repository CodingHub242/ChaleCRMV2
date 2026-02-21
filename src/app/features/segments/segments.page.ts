import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Segment } from '../../models';

@Component({
  selector: 'app-segments',
  templateUrl: './segments.page.html',
  styleUrls: ['./segments.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class SegmentsPage implements OnInit {
  segments: Segment[] = [];
  loading = false;
  searchQuery = '';
  
  // Pagination
  currentPage = 1;
  hasMore = true;

  // Segment types
  segmentTypes = ['contact', 'company', 'lead', 'deal'];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadSegments();
  }

  loadSegments() {
    this.loading = true;
    const params: any = {
      page: this.currentPage
    };
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getSegments().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.segments = response;
        } else if (response?.data) {
          if (this.currentPage === 1) {
            this.segments = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          } else {
            this.segments = [...this.segments, ...(Array.isArray(response.data) ? response.data : (response.data?.data || []))];
          }
          this.hasMore = response.data?.next_page_url !== null;
        } else {
          this.segments = [];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading segments:', error);
        this.loading = false;
      }
    });
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.currentPage = 1;
    this.loadSegments();
  }

  loadMore(event: any) {
    if (this.hasMore) {
      this.currentPage++;
      this.loadSegments();
    }
    event.target.complete();
  }

  viewSegment(segment: Segment) {
    this.router.navigate(['/segments', segment.id]);
  }

  async presentActionSheet(event: Event, segment: Segment) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'View Details',
          icon: 'eye-outline',
          handler: () => {
            this.viewSegment(segment);
          }
        },
        {
          text: 'Analyze',
          icon: 'analytics-outline',
          handler: () => {
            this.analyzeSegment(segment);
          }
        },
        {
          text: 'Export',
          icon: 'download-outline',
          handler: () => {
            this.exportSegment(segment);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/segments', segment.id, 'edit']);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteSegment(segment);
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

  analyzeSegment(segment: Segment) {
    this.apiService.analyzeSegment(segment.id).subscribe({
      next: (response: any) => {
        console.log('Analysis:', response.data);
      },
      error: (error: any) => {
        console.error('Error analyzing segment:', error);
      }
    });
  }

  exportSegment(segment: Segment) {
    console.log('Export:', segment.id);
  }

  async deleteSegment(segment: Segment) {
    const alert = await this.alertController.create({
      header: 'Delete Segment',
      message: `Are you sure you want to delete "${segment.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteSegment(segment.id).subscribe({
              next: () => {
                this.loadSegments();
              },
              error: (error: any) => {
                console.error('Error deleting segment:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Helper methods
  getTotalContacts(): number {
    return this.segments.reduce((sum, s) => sum + (s.contacts_count || 0), 0);
  }

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
