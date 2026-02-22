import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Sqr } from '../../../models';
import { addIcons } from 'ionicons';
import { warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb, person } from 'ionicons/icons';

@Component({
  selector: 'app-sqrs-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './sqrs-list.page.html',
  styleUrls: ['./sqrs-list.page.scss']
})
export class SqrsListPage implements OnInit {
  sqrs: Sqr[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  statusFilter = '';

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  private priorityColors: { [key: string]: string } = {
    'Low': '#4caf50',
    'Medium': '#ff9800',
    'High': '#f44336',
    'Critical': '#9c27b0'
  };

  private typeIcons: { [key: string]: string } = {
    'Complaint': 'warning',
    'Feedback': 'chatbubbles',
    'Suggestion': 'lightbulb',
    'Inquiry': 'helpCircle'
  };

  constructor(
    private api: ApiService,
    private alertController: AlertController
  ) {
    addIcons({ warning, chatbubbles, helpCircle, add, trash, create, chevronBack, chevronForward, chevronDown, alertCircle, bulb: alertCircle, person });
  }

  ngOnInit(): void {
    this.loadSqrs();
  }

  loadSqrs(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    this.api.getSqrs({ 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery,
      status: this.statusFilter
    }).subscribe({
      next: (response) => {
        if (loadMore) {
          this.sqrs = [...this.sqrs, ...response.data];
        } else {
          this.sqrs = response.data;
        }
        this.hasMore = response.current_page < response.last_page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.sqrs = [];
      }
    });
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadSqrs();
  }

  onStatusFilterChange(event: any): void {
    this.statusFilter = event.detail.value;
    this.loadSqrs();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      this.api.getSqrs({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery,
        status: this.statusFilter
      }).subscribe({
        next: (response) => {
          this.sqrs = [...this.sqrs, ...response.data];
          this.hasMore = response.current_page < response.last_page;
          event.target.complete();
        },
        error: () => {
          event.target.complete();
        }
      });
    } else {
      event.target.complete();
    }
  }

  getTypeIcon(type: string): string {
    return this.typeIcons[type] || 'helpCircle';
  }

  getPriorityColor(priority: string): string {
    return this.priorityColors[priority] || '#999';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Open': 'status-open',
      'In Progress': 'status-progress',
      'Resolved': 'status-resolved',
      'Closed': 'status-closed'
    };
    return statusMap[status] || 'status-open';
  }

  async deleteSqr(sqr: Sqr): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete SQR',
      message: `Are you sure you want to delete "${sqr.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteSqr(sqr.id).subscribe({
              next: () => {
                this.loadSqrs();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
