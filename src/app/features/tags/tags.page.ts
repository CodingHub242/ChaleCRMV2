import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Tag, Label } from '../../models';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class TagsPage implements OnInit {
  currentSegment = 'tags';
  tags: Tag[] = [];
  labels: Label[] = [];
  loading = false;

  constructor(
    private apiService: ApiService,
    private alertController: AlertController
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

  showCreateModal() {
    console.log('Show create modal');
  }

  editTag(tag: Tag) {
    console.log('Edit tag:', tag);
  }

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
              next: () => {
                this.loadData();
              },
              error: (error) => {
                console.error('Error deleting tag:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  editLabel(label: Label) {
    console.log('Edit label:', label);
  }

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
              next: () => {
                this.loadData();
              },
              error: (error) => {
                console.error('Error deleting label:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
