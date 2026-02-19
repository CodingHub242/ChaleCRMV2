import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SegmentCustomEvent } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Activity } from '../../../models';

@Component({
  selector: 'app-activities-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './activities-list.page.html',
  styleUrls: ['./activities-list.page.scss']
})
export class ActivitiesListPage implements OnInit {
  activities: Activity[] = [];
  typeFilter = '';
  isLoading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.isLoading = true;
    this.api.getActivities({ type: this.typeFilter || undefined }).subscribe({
      next: (response) => {
        this.activities = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.activities = [];
        this.isLoading = false;
      }
    });
  }

  onTypeChange(event: SegmentCustomEvent): void {
    this.typeFilter = String(event.detail.value || '');
    this.loadActivities();
  }

  getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'call': 'call',
      'meeting': 'people',
      'note': 'document-text',
      'email': 'mail'
    };
    return icons[type] || 'calendar';
  }

  formatDuration(minutes: number | undefined): string {
    if (!minutes) return '';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}
