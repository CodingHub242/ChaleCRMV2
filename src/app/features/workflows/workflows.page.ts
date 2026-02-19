import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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

  constructor(
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadWorkflows();
  }

  loadWorkflows() {
    const params: any = {};
    if (this.currentFilter === 'active') {
      params.is_active = true;
    } else if (this.currentFilter === 'inactive') {
      params.is_active = false;
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
      },
      error: (error) => {
        console.error('Error loading workflows:', error);
      }
    });
  }

  filterChanged(event: any) {
    this.currentFilter = event.detail.value;
    this.loadWorkflows();
  }

  viewWorkflow(workflow: Workflow) {
    this.router.navigate(['/workflows', workflow.id]);
  }

  editWorkflow(workflow: Workflow) {
    this.router.navigate(['/workflows', workflow.id, 'edit']);
  }

  async toggleWorkflow(workflow: Workflow) {
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
}
