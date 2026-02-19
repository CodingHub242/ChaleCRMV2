import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SegmentCustomEvent } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Invoice } from '../../../models';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './invoices-list.page.html',
  styleUrls: ['./invoices-list.page.scss']
})
export class InvoicesListPage implements OnInit {
  invoices: Invoice[] = [];
  isLoading = false;
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.api.getInvoices({ status: this.statusFilter || undefined }).subscribe({
      next: (response) => {
        this.invoices = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.invoices = [];
        this.isLoading = false;
      }
    });
  }

  onStatusChange(): void {
    this.loadInvoices();
  }

  getTotalValue(): number {
    return this.invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  }

  getPaidValue(): number {
    return this.invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  }

  getOutstandingValue(): number {
    return this.invoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
  }

  getPaymentPercent(invoice: Invoice): number {
    if (!invoice.total || invoice.total === 0) return 0;
    return Math.round((invoice.paid_amount / invoice.total) * 100);
  }
}
