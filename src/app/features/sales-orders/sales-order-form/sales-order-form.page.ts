import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Contact, Company, Product, SalesOrder } from '../../../models';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './sales-order-form.page.html',
  styleUrls: ['./sales-order-form.page.scss']
})
export class SalesOrderFormPage implements OnInit {
  isEditing = false;
  orderId: number | null = null;
  isLoading = false;

  customers: Contact[] = [];
  companies: Company[] = [];
  products: Product[] = [];

  order: any = {
    order_number: '',
    customer_id: undefined,
    company_id: undefined,
    order_date: '',
    due_date: '',
    status: 'draft',
    currency: 'GHS',
    billing_address: '',
    shipping_address: '',
    subtotal: 0,
    tax_rate: 0,
    tax_amount: 0,
    discount_amount: 0,
    total: 0,
    notes: '',
    items: []
  };

  statuses = ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'GHS'];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadCompanies();
    this.loadProducts();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.orderId = +id;
      this.loadOrder();
    } else {
      // Set default dates
      const today = new Date();
      this.order.order_date = today.toISOString().split('T')[0];
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      this.order.due_date = dueDate.toISOString().split('T')[0];
      
      // Generate order number
      this.generateOrderNumber();
    }
  }

  loadCustomers(): void {
    this.api.getContacts({ per_page: 100 }).subscribe({
      next: (response: any) => { 
        this.customers = response.data || []; 
      }
    });
  }

  loadCompanies(): void {
    this.api.getCompanies({ per_page: 100 }).subscribe({
      next: (response: any) => { 
        this.companies = response.data || []; 
      }
    });
  }

  loadProducts(): void {
    this.api.getProducts({ per_page: 100 }).subscribe({
      next: (response: any) => { 
        this.products = response.data || []; 
      }
    });
  }

  loadOrder(): void {
    if (!this.orderId) return;
    this.isLoading = true;
    this.api.getSalesOrder(this.orderId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.order = response.data;
          // Ensure items array exists
          if (!this.order.items) {
            this.order.items = [];
          }
        }
        this.isLoading = false;
      },
      error: () => { 
        this.isLoading = false; 
      }
    });
  }

  generateOrderNumber(): void {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.order.order_number = `SO-${year}${month}-${random}`;
  }

  onCustomerChange(): void {
    // Optionally auto-fill customer details
    const customer = this.customers.find(c => c.id === this.order.customer_id);
    if (customer) {
      // Could pre-fill company if customer has one
      if (customer.company_id && !this.order.company_id) {
        this.order.company_id = customer.company_id;
      }
    }
  }

  addItem(): void {
    this.order.items.push({ 
      product_id: undefined, 
      name: '', 
      quantity: 1, 
      unit_price: 0, 
      discount: 0, 
      amount: 0 
    });
  }

  removeItem(index: number): void {
    this.order.items.splice(index, 1);
    this.calculateTotals();
  }

  updateItemAmount(item: any): void {
    const product = this.products.find(p => p.id === item.product_id);
    if (product) {
      item.name = product.name;
      item.unit_price = product.unit_price || 0;
    }
    item.amount = (item.quantity || 0) * (item.unit_price || 0) * (1 - (item.discount || 0) / 100);
    this.calculateTotals();
  }

  get subtotal(): number {
    return this.order.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  }

  get taxAmount(): number {
    return this.subtotal * ((this.order.tax_rate || 0) / 100);
  }

  calculateTotals(): void {
    const subtotal = this.subtotal;
    const tax = this.taxAmount;
    const discount = this.order.discount_amount || 0;
    this.order.subtotal = subtotal;
    this.order.tax_amount = tax;
    this.order.total = subtotal + tax - discount;
  }

  async save(): Promise<void> {
    if (!this.order.order_number || !this.order.customer_id || !this.order.order_date) {
      this.showAlert('Validation Error', 'Please fill in required fields (Order Number, Customer, Order Date)');
      return;
    }

    // Calculate totals before saving
    this.calculateTotals();

    const loading = await this.loadingController.create({ message: 'Saving...' });
    await loading.present();

    const request = this.isEditing && this.orderId
      ? this.api.updateSalesOrder(this.orderId, this.order)
      : this.api.createSalesOrder(this.order);

    request.subscribe({
      next: (response: any) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/sales-orders']);
        } else {
          this.showAlert('Error', response.message || 'Failed to save order');
        }
      },
      error: (error: any) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save order');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ 
      header: title, 
      message, 
      buttons: ['OK'] 
    });
    await alert.present();
  }
}
