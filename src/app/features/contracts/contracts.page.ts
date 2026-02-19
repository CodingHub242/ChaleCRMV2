import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ApiService } from '../../core/services/api.service';
import { Contract } from '../../models';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.page.html',
  styleUrls: ['./contracts.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class ContractsPage implements OnInit {
  contracts: Contract[] = [];
  loading = false;
  currentFilter = 'all';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    this.loading = true;
    const params: any = {};
    if (this.currentFilter !== 'all') {
      params.status = this.currentFilter;
    }
    
    this.apiService.getContracts(params).subscribe({
      next: (response: any) => {
        // Handle both direct array and paginated response
        if (Array.isArray(response)) {
          this.contracts = response;
        } else if (response?.data) {
          this.contracts = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.contracts = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contracts:', error);
        this.loading = false;
      }
    });
  }

  filterChanged(event: any) {
    this.currentFilter = event.detail.value;
    this.loadContracts();
  }

  searchChanged(event: any) {
    this.loadContracts();
  }

  viewContract(contract: Contract) {
    this.router.navigate(['/contracts', contract.id]);
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

  getStatusColor(status: string): string {
    const colors: any = {
      draft: 'medium',
      pending: 'warning',
      active: 'success',
      expired: 'danger',
      terminated: 'danger'
    };
    return colors[status] || 'medium';
  }
}
