import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './product-form.page.html',
  styleUrls: ['./product-form.page.scss']
})
export class ProductFormPage implements OnInit {
  isEditing = false;
  productId: number | null = null;
  isLoading = false;

  product: Partial<Product> = {
    name: '',
    sku: '',
    category: '',
    description: '',
    unit_price: 0,
    quantity: 0,
    low_stock_threshold: 10,
    is_active: true
  };

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditing = true;
      this.productId = +id;
      this.loadProduct();
    }
  }

  loadProduct(): void {
    if (!this.productId) return;
    
    this.isLoading = true;
    this.api.getProduct(this.productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.product = response.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showAlert('Error', 'Failed to load product');
      }
    });
  }

  async save(): Promise<void> {
    if (!this.product.name || !this.product.sku) {
      this.showAlert('Validation Error', 'Please fill in required fields (name and SKU)');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving...'
    });
    await loading.present();

    const request = this.isEditing && this.productId
      ? this.api.updateProduct(this.productId, this.product)
      : this.api.createProduct(this.product as any);

    request.subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.router.navigate(['/products']);
        } else {
          this.showAlert('Error', response.message);
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showAlert('Error', error.error?.message || 'Failed to save product');
      }
    });
  }

  private async showAlert(title: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
