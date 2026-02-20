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
  loading = false;
  
  stats = {
    total_revenue: 125000,
    total_deals: 45,
    total_contacts: 230,
    conversion_rate: 15.5,
    average_deal_size: 5000
  };

  pipeline = {
    total_pipeline_value: 250000,
    deals_count: 25
  };

  performance = {
    tasks_completed: 32,
    calls_logged: 48,
    meetings_scheduled: 15
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    
    // Load analytics overview
    this.apiService.getAnalyticsOverview().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.stats = response.data.stats || this.stats;
          this.pipeline = response.data.pipeline || this.pipeline;
          this.performance = response.data.performance || this.performance;
        }
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
