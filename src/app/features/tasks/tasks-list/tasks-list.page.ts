import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Task, User } from '../../../models';
import { IonContent, IonHeader, IonTitle,IonSegment,IonSegmentButton, IonToolbar, IonButton, IonButtons, IonMenuButton, IonIcon, IonRow, IonCol, IonModal, IonLabel, IonItem, IonDatetime } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule,IonSegment,IonSegmentButton],
  templateUrl: './tasks-list.page.html',
  styleUrls: ['./tasks-list.page.scss']
})
export class TasksListPage implements OnInit {
  tasks: Task[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  users: User[] = [];

  statusFilter = '';
  priorities = ['low', 'medium', 'high'];

  constructor(
    private api: ApiService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.api.getTasks({ 
      page: this.currentPage, 
      per_page: 20,
      status: this.statusFilter || undefined
    }).subscribe({
      next: (response) => {
        this.tasks = response.data;
        this.hasMore = response.current_page < response.last_page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.tasks = [];
      }
    });
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
        }
      }
    });
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.currentPage = 1;
    this.loadTasks();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      this.api.getTasks({ 
        page: this.currentPage, 
        per_page: 20,
        status: this.statusFilter || undefined
      }).subscribe({
        next: (response) => {
          this.tasks = [...this.tasks, ...response.data];
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

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'success',
      'medium': 'warning',
      'high': 'danger'
    };
    return colors[priority] || 'primary';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'secondary',
      'in_progress': 'warning',
      'completed': 'success',
      'overdue': 'danger'
    };
    return colors[status] || 'primary';
  }

  formatStatus(status: string): string {
    return status?.replace(/_/g, ' ') || '';
  }

  isOverdue(dueDate: string | undefined): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  getDueIndicatorClass(dueDate: string | undefined): string {
    if (!dueDate) return '';
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'upcoming';
    return '';
  }

  getPendingCount(): number {
    return this.tasks.filter(t => t.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 'in_progress').length;
  }

  getCompletedCount(): number {
    return this.tasks.filter(t => t.status === 'completed').length;
  }

  getOverdueCount(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const due = new Date(t.due_date);
      due.setHours(0, 0, 0, 0);
      return due < today;
    }).length;
  }

  async completeTask(task: Task): Promise<void> {
    if (task.status === 'completed') return;
    
    this.api.completeTask(task.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
        }
      }
    });
  }

  getAssigneeName(assignedTo: number | undefined): string {
    if (!assignedTo) return 'Unassigned';
    const user = this.users.find(u => u.id === assignedTo);
    return user?.name || 'Unknown';
  }
}
