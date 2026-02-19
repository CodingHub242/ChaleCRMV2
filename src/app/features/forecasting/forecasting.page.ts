import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-forecasting',
  templateUrl: './forecasting.page.html',
  styleUrls: ['./forecasting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class ForecastingPage implements OnInit {
  forecastPeriod = 3;
  totalPredictedRevenue = 0;
  predictions: any[] = [];
  loading = false;

  pipeline = {
    total_pipeline_value: 0,
    weighted_forecast: 0,
    probability_weighted: 0,
    total_open_deals: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadForecast();
  }

  loadForecast() {
    this.loading = true;
    
    this.apiService.getForecastPredictions({ period: this.forecastPeriod }).subscribe({
      next: (response) => {
        this.predictions = response.data.predictions || [];
        this.pipeline = response.data.pipeline || this.pipeline;
        this.totalPredictedRevenue = this.predictions.reduce((sum: number, p: any) => sum + p.predicted_revenue, 0);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading forecast:', error);
        this.loading = false;
      }
    });
  }

  refreshForecast() {
    this.loadForecast();
  }
}
