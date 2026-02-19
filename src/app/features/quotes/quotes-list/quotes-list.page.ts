import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SegmentCustomEvent } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Quote } from '../../../models';

@Component({
  selector: 'app-quotes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './quotes-list.page.html',
  styleUrls: ['./quotes-list.page.scss']
})
export class QuotesListPage implements OnInit {
  quotes: Quote[] = [];
  isLoading = false;
  statusFilter = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.isLoading = true;
    this.api.getQuotes({ status: this.statusFilter || undefined }).subscribe({
      next: (response) => {
        this.quotes = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.quotes = [];
        this.isLoading = false;
      }
    });
  }

  onStatusChange(): void {
    this.loadQuotes();
  }

  getTotalValue(): number {
    return this.quotes.reduce((sum, quote) => sum + (quote.total || 0), 0);
  }
}
