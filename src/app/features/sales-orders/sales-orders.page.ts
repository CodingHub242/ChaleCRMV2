import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { SalesOrder } from '../../models';

@Component({
  selector: 'app-sales-orders',
  templateUrl: './sales-orders.page.html',
  styleUrls: ['./sales-orders.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class SalesOrdersPage implements OnInit {
  orders: SalesOrder[] = [];
  loading = false;
  currentFilter = 'all';
  searchQuery = '';

  constructor(
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const params: any = {};
    if (this.currentFilter !== 'all') {
      params.status = this.currentFilter;
    }
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.apiService.getSalesOrders(params).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.orders = response;
        } else if (response?.data) {
          this.orders = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        } else {
          this.orders = [];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales orders:', error);
        this.loading = false;
      }
    });
  }

  filterChanged(event: any) {
    this.currentFilter = event.detail.value;
    this.loadOrders();
  }

  searchChanged(event: any) {
    this.searchQuery = event.detail.value;
    this.loadOrders();
  }

  viewOrder(order: SalesOrder) {
    this.router.navigate(['/sales-orders', order.id]);
  }

  editOrder(order: SalesOrder) {
    this.router.navigate(['/sales-orders', order.id, 'edit']);
  }

  async convertToInvoice(order: SalesOrder) {
    const alert = await this.alertController.create({
      header: 'Convert to Invoice',
      message: `Convert sales order "${order.order_number}" to an invoice?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Convert',
          handler: () => {
            this.apiService.convertSalesOrderToInvoice(order.id).subscribe({
              next: (response) => {
                this.router.navigate(['/invoices', response.data.id]);
              },
              error: (error) => {
                console.error('Error converting to invoice:', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteOrder(order: SalesOrder) {
    const alert = await this.alertController.create({
      header: 'Delete Order',
      message: `Are you sure you want to delete order "${order.order_number}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.apiService.deleteSalesOrder(order.id).subscribe({
              next: () => {
                this.loadOrders();
              },
              error: (error) => {
                console.error('Error deleting order:', error);
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
      confirmed: 'primary',
      processing: 'warning',
      shipped: 'tertiary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'medium';
  }

  // Stats calculations
  getTotalAmount(): number {
    return this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
  }

  getPendingCount(): number {
    return this.orders.filter(o => 
      ['draft', 'confirmed', 'processing', 'shipped'].includes(o.status)
    ).length;
  }

  getCompletedCount(): number {
    return this.orders.filter(o => o.status === 'delivered').length;
  }

  // Action sheet for order options
  async presentActionSheet(order: SalesOrder) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Order Actions',
      buttons: [
        {
          text: 'View Details',
          icon: 'eye-outline',
          handler: () => {
            this.viewOrder(order);
          }
        },
        {
          text: 'Edit Order',
          icon: 'create-outline',
          handler: () => {
            this.editOrder(order);
          }
        },
        {
          text: 'Convert to Invoice',
          icon: 'document-text-outline',
          handler: () => {
            this.convertToInvoice(order);
          }
        },
        {
          text: 'Delete Order',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.deleteOrder(order);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close-outline'
        }
      ]
    });
    await actionSheet.present();
  }
}
