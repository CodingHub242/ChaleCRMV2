import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AnalyticsPage implements OnInit {
  currentSegment = 'overview';
  dateRange: string = '';
  loading = false;
  
  stats = {
    total_revenue: 0,
    total_deals: 0,
    total_contacts: 0,
    conversion_rate: 0,
    average_deal_size: 0
  };

  pipeline = {
    total_pipeline_value: 0,
    deals_count: 0
  };

  performance = {
    tasks_completed: 0,
    calls_logged: 0,
    meetings_scheduled: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    
    // Load analytics overview
    this.apiService.getAnalyticsOverview().subscribe({
      next: (response) => {
        this.stats = response.data.stats || this.stats;
        this.pipeline = response.data.pipeline || this.pipeline;
        this.performance = response.data.performance || this.performance;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  segmentChanged(event: any) {
    this.currentSegment = event.detail.value;
  }

  generateReport() {
    console.log('Generate report');
  }
}
