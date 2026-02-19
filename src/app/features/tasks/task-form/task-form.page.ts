import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Task, User, Contact, Company, Deal } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline } from 'ionicons/icons';

type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'in_progress' | 'completed';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './task-form.page.html',
  styleUrls: ['./task-form.page.scss']
})
export class TaskFormPage implements OnInit {
  isEditing = false;
  taskId: number | null = null;
  isLoading = false;
  
  users: User[] = [];
  contacts: Contact[] = [];
  companies: Company[] = [];
  deals: Deal[] = [];

  task: Partial<Task> = {
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: undefined,
    related_to_type: undefined,
    related_to_id: undefined
  };

  priorities: Priority[] = ['low', 'medium', 'high'];
  statuses: Status[] = ['pending', 'in_progress', 'completed'];
  relatedTypes = [
    { value: 'contact', label: 'Contact' },
    { value: 'company', label: 'Company' },
    { value: 'deal', label: 'Deal' }
  ];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
      addIcons({personOutline,locationOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
    }

  ngOnInit(): void {
    this.loadUsers();
    this.loadContacts();
    this.loadCompanies();
    this.loadDeals();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.taskId = +id;
      this.loadTask();
    } else {
      // Set default due date to today
      this.task.due_date = new Date().toISOString().split('T')[0];
    }
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.users = response.data;
          // Set default to first user
          if (this.users.length > 0 && !this.task.assigned_to) {
            this.task.assigned_to = this.users[0].id;
          }
        }
      }
    });
  }

  loadContacts(): void {
    this.api.getContacts({ per_page: 100 }).subscribe({
      next: (response) => {
        this.contacts = response.data;
      }
    });
  }

  loadCompanies(): void {
    this.api.getCompanies({ per_page: 100 }).subscribe({
      next: (response) => {
        this.companies = response.data;
      }
    });
  }

  loadDeals(): void {
    this.api.getDeals({ per_page: 100 }).subscribe({
      next: (response) => {
        this.deals = response.data;
      }
    });
  }

  loadTask(): void {
    if (!this.taskId) return;
    
    this.isLoading = true;
    this.api.getTask(this.taskId).subscribe({
      next: (response) => {
        if (response.success) {
          this.task = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load task');
      }
    });
  }

  getRelatedItems(): any[] {
    switch (this.task.related_to_type) {
      case 'contact':
        return this.contacts;
      case 'company':
        return this.companies;
      case 'deal':
        return this.deals;
      default:
        return [];
    }
  }

  getRelatedItemName(item: any): string {
    if (!item) return '';
    switch (this.task.related_to_type) {
      case 'contact':
        return `${item.first_name} ${item.last_name}`;
      case 'company':
        return item.name;
      case 'deal':
        return item.name;
      default:
        return '';
    }
  }

  async onRelatedTypeChange(): Promise<void> {
    this.task.related_to_id = undefined;
  }

  setPriority(priority: Priority): void {
    this.task.priority = priority;
  }

  setStatus(status: Status): void {
    this.task.status = status;
  }

  formatPriority(priority: Priority): string {
    return priority?.charAt(0).toUpperCase() + priority?.slice(1) || '';
  }

  formatStatus(status: Status): string {
    return status?.replace(/_/g, ' ')?.charAt(0).toUpperCase() + status?.replace(/_/g, ' ')?.slice(1) || '';
  }

  getRelatedTypeLabel(): string {
    const type = this.relatedTypes.find(t => t.value === this.task.related_to_type);
    return type?.label || '';
  }

  async save(): Promise<void> {
    if (!this.task.title) {
      this.showAlert('Validation Error', 'Please enter a task title');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    const request = this.isEditing && this.taskId
      ? this.api.updateTask(this.taskId, this.task)
      : this.api.createTask(this.task as any);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/tasks']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save task');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
