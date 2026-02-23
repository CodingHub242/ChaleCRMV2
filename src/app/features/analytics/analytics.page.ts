import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline, walletOutline, briefcaseOutline, pulseOutline } from 'ionicons/icons';

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
  recent: any[] = [];
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
    meetings_scheduled: 15,
    activity_by_user: {
      name: 'John Doe',
      role: 'Sales Manager'
    }
  };

  constructor(private apiService: ApiService) {
    addIcons({pulseOutline,walletOutline,personOutline,locationOutline,flagOutline,briefcaseOutline,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
  }

  ngOnInit() {
    this.loadAnalytics();
    this.loadPipeline();
    this.loadPerformance();
  }

  loadAnalytics() {
    this.loading = true;
    
    // Load analytics overview
    this.apiService.getAnalyticsOverview().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.stats = response.data || this.stats;
          this.recent = response.data.recent_activities;
          console.log(this.recent);
         // this.pipeline = response.data.pipeline || this.pipeline;
          //this.performance = response.data.performance || this.performance;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      }
    });
  }

  loadPipeline() {
    this.loading = true;
    
    // Load pipeline overview
    this.apiService.getAnalyticsPipeline().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.pipeline = response.data || this.pipeline;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pipeline:', error);
        this.loading = false;
      }
    });
  }

  loadPerformance() {
    this.loading = true;
    
    // Load performance overview
    this.apiService.getAnalyticsPerformance().subscribe({
      next: (response: any) => {
        if (response.data) {
          this.performance = response.data || this.performance;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading performance:', error);
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
