import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Quote, Contact, Company, Deal, Product } from '../../../models';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, personOutline, flagOutline, locationOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './quote-form.page.html',
  styleUrls: ['./quote-form.page.scss']
})
export class QuoteFormPage implements OnInit {
  isEditing = false;
  quoteId: number | null = null;
  isLoading = false;

  contacts: Contact[] = [];
  companies: Company[] = [];
  deals: Deal[] = [];
  products: Product[] = [];

  quote: any = {
    subject: '',
    contact_id: undefined,
    company_id: undefined,
    deal_id: undefined,
    status: 'draft',
    expiration_date: '',
    currency: 'GHS',
    items: [],
    terms: ''
  };

  statuses = ['draft', 'sent', 'accepted', 'declined', 'expired'];
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
    this.loadDeals();
    this.loadProducts();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.quoteId = +id;
      this.loadQuote();
    } else {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      this.quote.expiration_date = date.toISOString().split('T')[0];
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

  loadDeals(): void {
    this.api.getDeals({ per_page: 100 }).subscribe({
      next: (response) => { this.deals = response.data; }
    });
  }

  loadProducts(): void {
    this.api.getProducts({ per_page: 100 }).subscribe({
      next: (response) => { this.products = response.data; }
    });
  }

  loadQuote(): void {
    if (!this.quoteId) return;
    this.isLoading = true;
    this.api.getQuote(this.quoteId).subscribe({
      next: (response) => {
        if (response.success) this.quote = response.data;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  addItem(): void {
    this.quote.items.push({ product_id: undefined, name: '', quantity: 1, unit_price: 0, discount: 0, amount: 0 });
  }

  removeItem(index: number): void {
    this.quote.items.splice(index, 1);
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
    return this.quote.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  }

  async save(): Promise<void> {
    if (!this.quote.subject || !this.quote.contact_id) {
      this.showAlert('Validation Error', 'Please fill in required fields');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Saving...' });
    await loading.present();

    const request = this.isEditing && this.quoteId
      ? this.api.updateQuote(this.quoteId, this.quote)
      : this.api.createQuote(this.quote);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) this.router.navigate(['/quotes']);
        else this.showAlert('Error', response.message);
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save quote');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header: title, message, buttons: ['OK'] });
    await alert.present();
  }
}
