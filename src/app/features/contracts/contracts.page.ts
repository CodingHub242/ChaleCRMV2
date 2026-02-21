import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Contract } from '../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline } from 'ionicons/icons';


@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class ContractsPage implements OnInit {
  contracts: Contract[] = [];
  loading = false;
  currentFilter = 'all';
  searchQuery = '';
  
  // Stats
  totalCount = 0;
  activeCount = 0;
  pendingCount = 0;
  expiredCount = 0;
  totalValue = 0;

  // Pagination
  currentPage = 1;
  hasMore = true;

  // Contract types and statuses
  contractTypes = ['sales', 'service', 'nda', 'employment', 'partnership', 'other'];
  contractStatuses = ['draft', 'pending', 'active', 'expired', 'terminated', 'cancelled'];

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private modalController: ModalController,
    private apiService: ApiService
  ) {
    addIcons({cloudUploadOutline});
  }

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    this.loading = true;
    const params: any = {
      page: this.currentPage
    };
    
    if (this.currentFilter !== 'all') {
      params.status = this.currentFilter;
    }
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getContracts(params).subscribe({
      next: (response: any) => {
        // Handle both direct array and paginated response
        if (Array.isArray(response)) {
          this.contracts = response;
        } else if (response?.data) {
          if (this.currentPage === 1) {
            this.contracts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
          } else {
            this.contracts = [...this.contracts, ...(Array.isArray(response.data) ? response.data : (response.data?.data || []))];
          }
          this.hasMore = response.data?.next_page_url !== null;
        } else {
          this.contracts = [];
        }
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contracts:', error);
        this.loading = false;
      }
    });
  }

  calculateStats() {
    this.totalCount = this.contracts.length;
    this.activeCount = this.contracts.filter(c => c.status === 'active').length;
    this.pendingCount = this.contracts.filter(c => c.status === 'pending').length;
    this.expiredCount = this.contracts.filter(c => c.status === 'expired').length;
    this.totalValue = this.contracts.reduce((sum, c) => sum + (c.value || 0), 0);
  }

  filterChanged(filter: string) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.loadContracts();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.currentPage = 1;
    this.loadContracts();
  }

  loadMore(event: any) {
    if (this.hasMore) {
      this.currentPage++;
      this.loadContracts();
    }
    event.target.complete();
  }

  viewContract(contract: Contract) {
    this.router.navigate(['/contracts', contract.id]);
  }

  async presentActionSheet(event: Event, contract: Contract) {
    event.stopPropagation();
    const actionSheet = await this.actionSheetController.create({
      buttons: [
        {
          text: 'View Details',
          icon: 'eye-outline',
          handler: () => {
            this.viewContract(contract);
          }
        },
        {
          text: 'Send for Signature',
          icon: 'pencil-outline',
          handler: () => {
            this.sendForSignature(contract);
          }
        },
        {
          text: 'Download',
          icon: 'download-outline',
          handler: () => {
            this.download(contract);
          }
        },
        {
          text: 'Edit',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/contracts', contract.id, 'edit']);
          }
        },
        {
          text: 'Delete',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.deleteContract(contract);
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

  async sendForSignature(contract: Contract) {
    const alert = await this.alertController.create({
      header: 'Send for Signature',
      message: `Send contract "${contract.title}" for signature?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Send',
          handler: () => {
            this.apiService.sendContractForSignature(contract.id, {
              subject: `Contract: ${contract.title}`
            }).subscribe({
              next: () => {
                this.loadContracts();
              },
              error: (error) => {
                console.error('Error sending for signature:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  download(contract: Contract) {
    console.log('Download:', contract.id);
  }

  async deleteContract(contract: Contract) {
    const alert = await this.alertController.create({
      header: 'Delete Contract',
      message: `Are you sure you want to delete "${contract.title}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteContract(contract.id).subscribe({
              next: () => {
                this.loadContracts();
              },
              error: (error) => {
                console.error('Error deleting contract:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async presentImportModal() {
    // This would open an import modal - placeholder for now
    const alert = await this.alertController.create({
      header: 'Import Contracts',
      message: 'Import functionality coming soon!',
      buttons: ['OK']
    });
    await alert.present();
  }

  // Helper methods
  getStatusColor(status: string): string {
    const colors: any = {
      draft: 'medium',
      pending: 'warning',
      active: 'success',
      expired: 'danger',
      terminated: 'danger',
      cancelled: 'medium'
    };
    return colors[status] || 'medium';
  }

  getStatusClass(status: string): string {
    return status || 'draft';
  }

  getTypeClass(type: string): string {
    return type || 'other';
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      sales: 'cart-outline',
      service: 'construct-outline',
      document: 'document-lock-outline',
      nda: 'shield-checkmark-outline',
      employment: 'people-outline',
      partnership: 'handshake-outline',
      other: 'document-outline'
    };
    return icons[type] || 'document-outline';
  }

  getSignedCount(contract: Contract): number {
    if (!contract.signers) return 0;
    return contract.signers.filter(s => s.signed_at).length;
  }

  formatCurrency(value: number): string {
    if (!value) return 'GHS0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}
