import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Invoice, Contact, Company, Product } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './invoice-form.page.html',
  styleUrls: ['./invoice-form.page.scss']
})
export class InvoiceFormPage implements OnInit {
  isEditing = false;
  invoiceId: number | null = null;
  isLoading = false;

  contacts: Contact[] = [];
  companies: Company[] = [];
  products: Product[] = [];

  invoice: any = {
    subject: '',
    contact_id: undefined,
    company_id: undefined,
    quote_id: undefined,
    status: 'draft',
    invoice_date: '',
    due_date: '',
    currency: 'GHS',
    items: [],
    terms: ''
  };

  statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD','GHS'];

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
     addIcons({trashOutline,personOutline,locationOutline,flagOutline,briefcase,notificationsOutline,settingsOutline,trophyOutline,trendingUp,cash,chevronBack,chevronForward,chevronDown,alertCircle, add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter,checkmarkCircle,cloudUpload,layers,time,person,logOut,list,calendar,analytics,people,flag,folderOpen,ellipse,business,callOutline,chatbubbleOutline,calendarOutline});
  }

  ngOnInit(): void {
    this.loadContacts();
    this.loadCompanies();
    this.loadProducts();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.invoiceId = +id;
      this.loadInvoice();
    } else {
      this.invoice.invoice_date = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      this.invoice.due_date = dueDate.toISOString().split('T')[0];
    }
  }

  loadContacts(): void {
    this.api.getContacts({ per_page: 100 }).subscribe({
      next: (response) => { this.contacts = response.data; }
    });
  }

  loadCompanies(): void {
    this.api.getCompanies({ per_page: 100 }).subscribe({
      next: (response) => { this.companies = response.data; }
    });
  }

  loadProducts(): void {
    this.api.getProducts({ per_page: 100 }).subscribe({
      next: (response) => { this.products = response.data; }
    });
  }

  loadInvoice(): void {
    if (!this.invoiceId) return;
    this.isLoading = true;
    this.api.getInvoice(this.invoiceId).subscribe({
      next: (response) => {
        if (response.success) this.invoice = response.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  addItem(): void {
    this.invoice.items.push({ product_id: undefined, name: '', quantity: 1, unit_price: 0, discount: 0, amount: 0 });
  }

  removeItem(index: number): void {
    this.invoice.items.splice(index, 1);
  }

  updateItemAmount(item: any): void {
    const product = this.products.find(p => p.id === item.product_id);
    if (product) {
      item.name = product.name;
      item.unit_price = product.unit_price;
    }
    item.amount = item.quantity * item.unit_price * (1 - item.discount / 100);
  }

  get subtotal(): number {
    return this.invoice.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  }

  async save(): Promise<void> {
    if (!this.invoice.subject || !this.invoice.contact_id) {
      this.showAlert('Validation Error', 'Please fill in required fields');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Saving...' });
    await loading.present();

    const request = this.isEditing && this.invoiceId
      ? this.api.updateInvoice(this.invoiceId, this.invoice)
      : this.api.createInvoice(this.invoice);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) this.router.navigate(['/invoices']);
        else this.showAlert('Error', response.message);
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save invoice');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header: title, message, buttons: ['OK'] });
    await alert.present();
  }
}
