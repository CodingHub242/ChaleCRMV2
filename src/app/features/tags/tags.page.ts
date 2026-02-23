import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Tag, Label } from '../../models';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class TagsPage implements OnInit {
  currentSegment = 'tags';
  tags: Tag[] = [];
  labels: Label[] = [];
  loading = false;

  // Form fields
  isEditing = false;
  editingType: 'tag' | 'label' = 'tag';
  editingItem: Tag | Label | null = null;
  formName = '';
  formColor = '#073336';
  formEntityType = 'contact';

  // Color options
  colorOptions = [
    { name: 'Blue', value: '#073336' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Pink', value: '#db2777' },
    { name: 'Cyan', value: '#0891b2' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Gray', value: '#6b7280' },
  ];

  entityTypeOptions = [
    { name: 'Contacts', value: 'contact' as const },
    { name: 'Companies', value: 'company' as const },
    { name: 'Deals', value: 'deal' as const },
    { name: 'Tasks', value: 'task' as const },
    { name: 'Leads', value: 'lead' as const },
    { name: 'Invoices', value: 'invoice' as const },
    { name: 'Quotes', value: 'quote' as const },
  ];

  constructor(
    private apiService: ApiService,
    private modalController: ModalController,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Load tags
    this.apiService.getTags().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.tags = response;
        } else if (response?.data) {
          this.tags = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.tags = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tags:', error);
        this.loading = false;
      }
    });

    // Load labels
    this.apiService.getLabels().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.labels = response;
        } else if (response?.data) {
          this.labels = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.labels = [];
        }
      },
      error: (error) => {
        console.error('Error loading labels:', error);
      }
    });
  }

  segmentChanged(event: any) {
    this.currentSegment = event.detail.value;
  }

  // Show create/edit modal
  async showCreateModal() {
    this.isEditing = false;
    this.editingItem = null;
    this.formName = '';
    this.formColor = '#2563eb';
    this.formEntityType = 'contact';
    this.editingType = this.currentSegment as 'tag' | 'label';

    const alert = await this.alertController.create({
      header: this.isEditing ? `Edit ${this.editingType === 'tag' ? 'Tag' : 'Label'}` : `New ${this.currentSegment === 'tag' ? 'Tag' : 'Label'}`,
      cssClass: 'bigin-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Enter name',
          value: this.formName
        },
        {
          name: 'entity_type',
          type: 'text',
          placeholder: 'Entity type (contact, company, deal, task)',
          value: this.formEntityType
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.name) {
              this.saveItem(data.name, data.entity_type || 'contact');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Save item (create or update)
  saveItem(name: string, entityType: string) {
    const data: any = {
      name: name,
      color: this.formColor,
      entity_type: entityType
    };

    if (this.isEditing && this.editingItem) {
      // Update
      if (this.editingType === 'tag') {
        this.apiService.updateTag(this.editingItem.id, data).subscribe({
          next: () => this.loadData(),
          error: (error) => console.error('Error updating tag:', error)
        });
      } else {
        this.apiService.updateLabel(this.editingItem.id, data).subscribe({
          next: () => this.loadData(),
          error: (error) => console.error('Error updating label:', error)
        });
      }
    } else {
      // Create
      if (this.currentSegment === 'tag') {
        this.apiService.createTag(data).subscribe({
          next: () => this.loadData(),
          error: (error) => console.error('Error creating tag:', error)
        });
      } else {
        this.apiService.createLabel(data).subscribe({
          next: () => this.loadData(),
          error: (error) => console.error('Error creating label:', error)
        });
      }
    }
  }

  // Edit tag
  editTag(tag: Tag) {
    this.isEditing = true;
    this.editingType = 'tag';
    this.editingItem = tag;
    this.formName = tag.name;
    this.formColor = tag.color || '#2563eb';
    this.formEntityType = tag.entity_type || 'contact';

    this.showCreateModal();
  }

  // Edit label
  editLabel(label: Label) {
    this.isEditing = true;
    this.editingType = 'label';
    this.editingItem = label;
    this.formName = label.name;
    this.formColor = label.color || '#2563eb';
    this.formEntityType = label.entity_type || 'contact';

    this.showCreateModal();
  }

  // Present action sheet for tag options
  async presentTagOptions(event: Event, tag: Tag) {
    event.stopPropagation();
    
    const actionSheet = await this.actionSheetController.create({
      header: tag.name,
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => this.editTag(tag)
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          cssClass: 'delete-btn',
          handler: () => this.deleteTag(tag)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Present action sheet for label options
  async presentLabelOptions(event: Event, label: Label) {
    event.stopPropagation();
    
    const actionSheet = await this.actionSheetController.create({
      header: label.name,
      buttons: [
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => this.editLabel(label)
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          cssClass: 'delete-btn',
          handler: () => this.deleteLabel(label)
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Delete tag
  async deleteTag(tag: Tag) {
    const alert = await this.alertController.create({
      header: 'Delete Tag',
      message: `Are you sure you want to delete "${tag.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteTag(tag.id).subscribe({
              next: () => this.loadData(),
              error: (error) => console.error('Error deleting tag:', error)
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Delete label
  async deleteLabel(label: Label) {
    const alert = await this.alertController.create({
      header: 'Delete Label',
      message: `Are you sure you want to delete "${label.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteLabel(label.id).subscribe({
              next: () => this.loadData(),
              error: (error) => console.error('Error deleting label:', error)
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
