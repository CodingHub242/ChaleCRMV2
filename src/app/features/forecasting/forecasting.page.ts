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
        // Use sample data for demo
        this.loadSampleData();
      }
    });
  }

  loadSampleData() {
    // Sample data for demonstration
    this.pipeline = {
      total_pipeline_value: 250000,
      weighted_forecast: 175000,
      probability_weighted: 125000,
      total_open_deals: 15
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    this.predictions = months.slice(0, this.forecastPeriod).map((month, index) => ({
      month: `${month} 2026`,
      predicted_revenue: 40000 + (Math.random() * 20000),
      confidence_level: index % 3 === 0 ? 'high' : index % 2 === 0 ? 'medium' : 'low',
      confidence_interval: {
        low: 30000 + (Math.random() * 10000),
        high: 50000 + (Math.random() * 15000)
      }
    }));

    this.totalPredictedRevenue = this.predictions.reduce((sum, p) => sum + p.predicted_revenue, 0);
    this.loading = false;
  }

  refreshForecast() {
    this.loadForecast();
  }

  getWeightedPercentage(): number {
    if (this.pipeline.total_pipeline_value === 0) return 0;
    return (this.pipeline.weighted_forecast / this.pipeline.total_pipeline_value) * 100;
  }

  getProbabilityPercentage(): number {
    if (this.pipeline.total_pipeline_value === 0) return 0;
    return (this.pipeline.probability_weighted / this.pipeline.total_pipeline_value) * 100;
  }

  getPredictionRate(): number {
    if (this.pipeline.total_pipeline_value === 0) return 0;
    return (this.totalPredictedRevenue / this.pipeline.total_pipeline_value) * 100;
  }

  getPredictionPercentage(prediction: any): number {
    if (this.totalPredictedRevenue === 0) return 0;
    return (prediction.predicted_revenue / this.totalPredictedRevenue) * 100;
  }

  getConfidenceClass(confidence: string): string {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }
}
