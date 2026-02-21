import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, AlertController, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contact } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline } from 'ionicons/icons';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './contacts-list.page.html',
  styleUrls: ['./contacts-list.page.scss']
})
export class ContactsListPage implements OnInit {
  contacts: Contact[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;

  private avatarColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  constructor(
    private api: ApiService, 
    private alertController: AlertController,
    private modalController: ModalController
  ) {
     addIcons({cloudUploadOutline})
  }

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    this.api.getContacts({ 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery 
    }).subscribe({
      next: (response) => {
        if (loadMore) {
          this.contacts = [...this.contacts, ...response.data];
        } else {
          this.contacts = response.data;
        }
        this.hasMore = response.current_page < response.last_page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.contacts = [];
      }
    });
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadContacts();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      this.api.getContacts({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery 
      }).subscribe({
        next: (response) => {
          this.contacts = [...this.contacts, ...response.data];
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

  getFullName(contact: Contact): string {
    return `${contact.first_name} ${contact.last_name}`.trim();
  }

  getInitials(contact: Contact): string {
    const first = contact.first_name?.charAt(0) || '';
    const last = contact.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  }

  getAvatarColor(contact: Contact): string {
    const index = contact.id % this.avatarColors.length;
    return this.avatarColors[index];
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'new': 'new',
      'contacted': 'contacted',
      'qualified': 'qualified',
      'proposal': 'proposal',
      'customer': 'customer'
    };
    return statusMap[status?.toLowerCase()] || 'new';
  }

  async deleteContact(contact: Contact): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete Contact',
      message: `Are you sure you want to delete ${this.getFullName(contact)}?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.api.deleteContact(contact.id).subscribe({
              next: () => {
                this.loadContacts();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentImportModal() {
    const modal = await this.modalController.create({
      component: DataImportComponent,
      componentProps: {
        entityType: 'contact'
      },
      cssClass: 'import-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.loadContacts();
    }
  }
}
