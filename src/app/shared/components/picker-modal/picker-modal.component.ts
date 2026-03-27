import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { addIcons } from 'ionicons';
import { searchOutline, close, chevronBack, person, business, folder } from 'ionicons/icons';

export interface PickerItem {
  id: number;
  name: string;
  subtitle?: string;
}

@Component({
  selector: 'app-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
    <ion-header class="picker-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="close()">
            <ion-icon style="color:#fff;" slot="icon-only" name="chevron-back"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title style="color:#fff;">{{ title }}</ion-title>
        <ion-buttons slot="end" *ngIf="selectedItem">
          <ion-button (click)="removeSelection()" color="medium">
            Remove
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <ion-icon name="search-outline" class="search-icon"></ion-icon>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search {{ title.toLowerCase() }}..."
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            (keyup.enter)="onSearch()">
          <ion-icon 
            *ngIf="searchQuery" 
            name="close" 
            class="clear-icon"
            (click)="clearSearch()"></ion-icon>
        </div>
      </div>
    </ion-header>

    <ion-content class="picker-content" [scrollEvents]="true" (ionScroll)="onScroll($event)">
      <!-- Loading State -->
      <div *ngIf="isLoading && items.length === 0" class="loading-state">
        <ion-spinner name="lines"></ion-spinner>
        <p>Loading {{ title.toLowerCase() }}...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredItems.length === 0" class="empty-state">
        <div class="empty-icon">
          <ion-icon [name]="icon"></ion-icon>
        </div>
        <h3>No {{ title.toLowerCase() }} found</h3>
        <p *ngIf="searchQuery">Try adjusting your search</p>
        <p *ngIf="!searchQuery">No {{ title.toLowerCase() }} available</p>
      </div>

      <!-- Items List -->
      <div class="items-list" *ngIf="filteredItems.length > 0">
        <div 
          *ngFor="let item of filteredItems" 
          class="picker-item"
          [class.selected]="selectedItem?.id === item.id"
          (click)="selectItem(item)">
          <div class="item-avatar">
            <ion-icon [name]="icon"></ion-icon>
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-subtitle" *ngIf="item.subtitle">{{ item.subtitle }}</div>
          </div>
          <div class="item-check" *ngIf="selectedItem?.id === item.id">
            <ion-icon name="checkmark-circle" color="primary"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Load More / Loading More -->
      <div class="loading-more" *ngIf="isLoadingMore">
        <ion-spinner name="lines"></ion-spinner>
        <span>Loading more...</span>
      </div>
    </ion-content>

    <ion-footer class="picker-footer">
      <ion-button expand="block" (click)="confirm()" [disabled]="!selectedItem">
        Select {{ title }}
      </ion-button>
    </ion-footer>
  `,
  styles: [`
    .picker-header {
      --background: #073336;
      --color: #e3e3e3;
    }

    .picker-header ion-toolbar {
      --background: #073336;
    }

    .search-container {
      padding: 8px 16px;
      background: white;
      border-bottom: 1px solid #e9ecef;
    }

    .search-input-wrapper {
      display: flex;
      align-items: center;
      background: #f5f7fa;
      border-radius: 10px;
      padding: 0 12px;
    }

    .search-icon {
      color: #999;
      font-size: 18px;
      margin-right: 8px;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 10px 0;
      font-size: 14px;
      outline: none;
      color: #333;
    }

    .search-input::placeholder {
      color: #999;
    }

    .clear-icon {
      color: #999;
      font-size: 18px;
      cursor: pointer;
      padding: 4px;
    }

    .picker-content {
      --background: #f5f7fa;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 50vh;
      text-align: center;
      color: #999;
      padding: 20px;
    }

    .loading-state ion-spinner {
      margin-bottom: 16px;
      color: #073336;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .empty-icon ion-icon {
      font-size: 32px;
      color: #999;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }

    .empty-state p {
      margin: 8px 0 0;
      font-size: 13px;
      color: #666;
    }

    .items-list {
      padding: 8px;
    }

    .picker-item {
      --padding-start: 12px;
      --padding-end: 12px;
      --inner-padding-end: 0;
      display: flex;
      align-items: center;
      background: white;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e9ecef;
      height: 64px;
      --background: transparent;
    }

    .picker-item:hover {
      background: #f8f9fa;
      border-color: #ced4da;
    }

    .picker-item.selected {
      background: #f0f7f7;
      border-color: #073336;
      border-width: 2px;
    }

    .item-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }

    .item-avatar ion-icon {
      font-size: 20px;
      color: #666;
    }

    .item-info {
      flex: 1;
      min-width: 0;
    }

    .item-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-subtitle {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .item-check {
      margin-left: 8px;
    }

    .item-check ion-icon {
      font-size: 22px;
    }

    .loading-more {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: #666;
      font-size: 13px;
    }

    .loading-more ion-spinner {
      color: #073336;
    }

    .picker-footer {
      padding: 16px;
      background: white;
      border-top: 1px solid #e9ecef;
    }

    .picker-footer ion-button {
      --background: #073336;
      --border-radius: 8px;
    }
  `]
})
export class PickerModalComponent implements OnInit, OnDestroy {
  @Input() title = 'Select';
  @Input() pickerType: 'contact' | 'company' | 'group' = 'contact';
  @Input() selectedId?: number;
  @Output() itemSelected = new EventEmitter<PickerItem>();

  items: PickerItem[] = [];
  filteredItems: PickerItem[] = [];
  selectedItem: PickerItem | null = null;
  searchQuery = '';
  isLoading = true;
  isLoadingMore = false;
  currentPage = 1;
  hasMore = true;
  private searchTimeout: any;

  // Icon mapping based on type
  get icon(): string {
    switch (this.pickerType) {
      case 'contact': return 'person';
      case 'company': return 'business';
      case 'group': return 'folder';
      default: return 'person';
    }
  }

  constructor(
    private api: ApiService,
    private modalController: ModalController
  ) {
    addIcons({ searchOutline, close, chevronBack, person, business, folder });
  }

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  loadItems(loadMore = false): void {
    if (loadMore) {
      if (!this.hasMore || this.isLoadingMore) return;
      this.isLoadingMore = true;
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    // Build params - contacts and companies support pagination, groups don't
    let params: any;
    let request: any;

    switch (this.pickerType) {
      case 'contact':
        params = {
          page: this.currentPage,
          per_page: 50,
          search: this.searchQuery
        };
        request = this.api.getContacts(params);
        break;
      case 'company':
        params = {
          page: this.currentPage,
          per_page: 50,
          search: this.searchQuery
        };
        request = this.api.getCompanies(params);
        break;
      case 'group':
        // Groups don't support pagination, load all
        request = this.api.getDealGroups();
        break;
    }

    request.subscribe({
      next: (response: any) => {
        console.log('Picker API Response:', this.pickerType, response);
        const data = response.data || [];
        
        // Map data to PickerItem format
        const mappedItems: PickerItem[] = data.map((item: any) => {
          let name = '';
          let subtitle = '';

          switch (this.pickerType) {
            case 'contact':
              name = `${item.first_name || ''} ${item.last_name || ''}`.trim();
              subtitle = item.email || '';
              break;
            case 'company':
              name = item.name || '';
              subtitle = item.industry || '';
              break;
            case 'group':
              name = item.name || '';
              subtitle = item.color || '';
              break;
          }

          return {
            id: item.id,
            name,
            subtitle
          };
        });

        if (loadMore) {
          this.items = [...this.items, ...mappedItems];
          this.isLoadingMore = false;
        } else {
          this.items = mappedItems;
        }

        this.filteredItems = this.items;
        
        // Check if there are more pages
        if (response.meta) {
          this.hasMore = response.meta.current_page < response.meta.last_page;
        } else if (response.last_page) {
          this.hasMore = response.current_page < response.last_page;
        } else {
          this.hasMore = false;
        }

        // Set selected item if there's a selectedId
        if (this.selectedId && !loadMore) {
          this.selectedItem = this.filteredItems.find(item => item.id === this.selectedId) || null;
        }

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Picker API Error:', this.pickerType, err);
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadItems();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearch();
  }

  selectItem(item: PickerItem): void {
    this.selectedItem = item;
  }

  removeSelection(): void {
    this.selectedItem = null;
  }

  confirm(): void {
    if (this.selectedItem) {
      this.itemSelected.emit(this.selectedItem);
      this.close();
    }
  }

  close(): void {
    this.modalController.dismiss();
  }

  // Load more when scrolling near bottom
  onScroll(event: any): void {
    const scrollElement = event.target;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;

    // Load more when near bottom (within 100px)
    if (scrollHeight - scrollTop - clientHeight < 100) {
      this.loadItems(true);
    }
  }
}