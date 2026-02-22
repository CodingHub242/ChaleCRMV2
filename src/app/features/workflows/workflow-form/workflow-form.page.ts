import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Workflow, EmailTemplate } from '../../../models';
import { addIcons } from 'ionicons';
import { arrowBack, flashOutline, layersOutline, settingsOutline, add, trashOutline, mailOutline, createOutline, notificationsOutline } from 'ionicons/icons';

interface WorkflowAction {
  type: string;
  template_id?: number;
  field?: string;
  value?: string;
  notify_email?: string;
  message?: string;
}

@Component({
  selector: 'app-workflow-form',
  templateUrl: './workflow-form.page.html',
  styleUrls: ['./workflow-form.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class WorkflowFormPage implements OnInit {
  workflow: any = {
    name: '',
    description: '',
    trigger_type: '',
    trigger_condition: '',
    is_active: false,
    run_once: false,
    actions: []
  };
  
  isLoading = false;
  isEditing = false;
  workflowId: number | null = null;
  emailTemplates: EmailTemplate[] = [];

  // Trigger types
  triggerTypes = [
    { value: 'lead', label: 'Lead', icon: 'person-outline' },
    { value: 'deal', label: 'Deal', icon: 'handshake-outline' },
    { value: 'contact', label: 'Contact', icon: 'people-outline' },
    { value: 'company', label: 'Company', icon: 'business-outline' },
    { value: 'custom', label: 'Custom', icon: 'settings-outline' }
  ];

  // Action types
  actionTypes = [
    { value: 'email', label: 'Send Email', icon: 'mail-outline' },
    { value: 'update_field', label: 'Update Field', icon: 'create-outline' },
    { value: 'notification', label: 'Send Notification', icon: 'notifications-outline' }
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private apiService: ApiService
  ) {
    addIcons({ arrowBack, flashOutline, layersOutline, settingsOutline, add, trashOutline, mailOutline, createOutline, notificationsOutline });
  }

  ngOnInit() {
    this.loadEmailTemplates();
    
    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.workflowId = parseInt(id, 10);
      this.isEditing = true;
      this.loadWorkflow();
    }
  }

  loadEmailTemplates() {
    this.apiService.getEmailTemplates().subscribe({
      next: (response: any) => {
        this.emailTemplates = response.data || [];
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  loadWorkflow() {
    if (!this.workflowId) return;
    
    this.isLoading = true;
    this.apiService.getWorkflow(this.workflowId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.workflow = { ...response.data };
          // Parse actions if it's a string
          if (typeof this.workflow.actions === 'string') {
            try {
              this.workflow.actions = JSON.parse(this.workflow.actions);
            } catch (e) {
              this.workflow.actions = [];
            }
          }
          if (!this.workflow.actions) {
            this.workflow.actions = [];
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading workflow:', error);
        this.isLoading = false;
        this.showError('Failed to load workflow');
      }
    });
  }

  getTriggerClass(triggerType: string): string {
    if (!triggerType) return '';
    return triggerType.toLowerCase();
  }

  getTriggerLabel(): string {
    const trigger = this.triggerTypes.find(t => t.value === this.workflow.trigger_type);
    return trigger ? trigger.label : 'Record';
  }

  getTriggerConditions(): any[] {
    const conditions: any[] = [
      { value: 'created', label: 'Is Created' },
      { value: 'updated', label: 'Is Updated' }
    ];
    
    if (this.workflow.trigger_type === 'deal') {
      conditions.push(
        { value: 'stage_changed', label: 'Stage Changed' },
        { value: 'won', label: 'Is Won' },
        { value: 'lost', label: 'Is Lost' }
      );
    } else if (this.workflow.trigger_type === 'lead') {
      conditions.push(
        { value: 'status_changed', label: 'Status Changed' },
        { value: 'converted', label: 'Is Converted' }
      );
    }
    
    return conditions;
  }

  getActionIcon(actionType: string): string {
    const action = this.actionTypes.find(a => a.value === actionType);
    return action ? action.icon : 'help-outline';
  }

  getActionLabel(actionType: string): string {
    const action = this.actionTypes.find(a => a.value === actionType);
    return action ? action.label : 'Unknown Action';
  }

  addAction() {
    if (!this.workflow.actions) {
      this.workflow.actions = [];
    }
    
    this.workflow.actions.push({
      type: 'email',
      template_id: null
    });
  }

  removeAction(index: number) {
    this.workflow.actions.splice(index, 1);
  }

  save() {
    if (!this.workflow.name) {
      this.showError('Please enter a workflow name');
      return;
    }

    if (!this.workflow.trigger_type) {
      this.showError('Please select a trigger type');
      return;
    }

    if (this.isEditing && this.workflowId) {
      this.updateWorkflow();
    } else {
      this.createWorkflow();
    }
  }

  createWorkflow() {
    this.isLoading = true;
    this.apiService.createWorkflow(this.workflow).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/workflows']);
        } else {
          this.showError(response.message || 'Failed to create workflow');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error creating workflow:', error);
        this.showError('Failed to create workflow');
      }
    });
  }

  updateWorkflow() {
    if (!this.workflowId) return;
    
    this.isLoading = true;
    this.apiService.updateWorkflow(this.workflowId, this.workflow).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.success) {
          this.router.navigate(['/workflows']);
        } else {
          this.showError(response.message || 'Failed to update workflow');
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error updating workflow:', error);
        this.showError('Failed to update workflow');
      }
    });
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
