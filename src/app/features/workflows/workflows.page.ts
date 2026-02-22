import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Workflow } from '../../models';

@Component({
  selector: 'app-workflows',
  templateUrl: './workflows.page.html',
  styleUrls: ['./workflows.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WorkflowsPage implements OnInit {
  workflows: Workflow[] = [];
  currentFilter = 'all';
  searchQuery = '';
  loading = false;
  
  // Stats
  totalCount = 0;
  activeCount = 0;
  inactiveCount = 0;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadWorkflows();
  }

  loadWorkflows() {
    this.loading = true;
    const params: any = {};
    
    if (this.currentFilter === 'active') {
      params.is_active = true;
    } else if (this.currentFilter === 'inactive') {
      params.is_active = false;
    }
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getWorkflows(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.workflows = response;
        } else if (response?.data) {
          this.workflows = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.workflows = [];
        }
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading workflows:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalCount = this.workflows.length;
    this.activeCount = this.workflows.filter(w => w.is_active).length;
    this.inactiveCount = this.workflows.filter(w => !w.is_active).length;
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  filterChanged(filter: string) {
    this.currentFilter = filter;
    this.loadWorkflows();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.loadWorkflows();
  }

  viewWorkflow(workflow: Workflow) {
    this.router.navigate(['/workflows', workflow.id]);
  }

  editWorkflow(workflow: Workflow) {
    this.router.navigate(['/workflows', workflow.id, 'edit']);
  }

  async presentActionSheet(event: Event, workflow: Workflow) {
    event.stopPropagation();
    
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.editWorkflow(workflow);
          }
        },
        {
          text: workflow.is_active ? 'Deactivate' : 'Activate',
          icon: workflow.is_active ? 'pause-outline' : 'play-outline',
          handler: () => {
            this.toggleWorkflow(workflow);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteWorkflow(workflow);
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    
    await actionSheet.present();
  }

  toggleWorkflow(workflow: Workflow) {
    if (workflow.is_active) {
      this.apiService.deactivateWorkflow(workflow.id).subscribe({
        next: () => {
          this.loadWorkflows();
        },
        error: (error) => {
          console.error('Error deactivating workflow:', error);
        }
      });
    } else {
      this.apiService.activateWorkflow(workflow.id).subscribe({
        next: () => {
          this.loadWorkflows();
        },
        error: (error) => {
          console.error('Error activating workflow:', error);
        }
      });
    }
  }

  async deleteWorkflow(workflow: Workflow) {
    const alert = await this.alertController.create({
      header: 'Delete Workflow',
      message: `Are you sure you want to delete "${workflow.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteWorkflow(workflow.id).subscribe({
              next: () => {
                this.loadWorkflows();
              },
              error: (error) => {
                console.error('Error deleting workflow:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  loadMore(event: any) {
    // Implement pagination if needed
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  getTriggerClass(triggerType: string): string {
    if (!triggerType) return 'default';
    return triggerType.toLowerCase();
  }

  getTriggerIcon(triggerType: string): string {
    const icons: any = {
      lead: 'person-outline',
      deal: 'handshake-outline',
      contact: 'people-outline',
      company: 'business-outline',
      custom: 'settings-outline',
      default: 'git-branch-outline'
    };
    return icons[triggerType?.toLowerCase()] || 'git-branch-outline';
  }

  formatTrigger(triggerType: string): string {
    if (!triggerType) return 'Custom';
    return triggerType.charAt(0).toUpperCase() + triggerType.slice(1);
  }
}
