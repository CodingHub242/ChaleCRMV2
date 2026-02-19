import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Segment } from '../../models';

@Component({
  selector: 'app-segments',
  templateUrl: './segments.page.html',
  styleUrls: ['./segments.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SegmentsPage implements OnInit {
  segments: Segment[] = [];
  loading = false;
  searchQuery = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadSegments();
  }

  loadSegments() {
    this.loading = true;
    
    this.apiService.getSegments().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.segments = response;
        } else if (response?.data) {
          this.segments = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.segments = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading segments:', error);
        this.loading = false;
      }
    });
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.loadSegments();
  }

  viewSegment(segment: Segment) {
    this.router.navigate(['/segments', segment.id]);
  }

  analyzeSegment(segment: Segment) {
    this.apiService.analyzeSegment(segment.id).subscribe({
      next: (response) => {
        console.log('Analysis:', response.data);
      },
      error: (error) => {
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
              error: (error) => {
                console.error('Error deleting segment:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
