import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Company } from '../../../models';
import { DataImportComponent } from '../../../shared/components/data-import/data-import.component';
import { addIcons } from 'ionicons';
import { briefcase,add, trash, create, mail, document, close, eye, download, checkmark, arrowBack, arrowUp, arrowDown, filter, cloudUpload, checkmarkCircle, layers, time, alertCircle, chevronBack, chevronForward, chevronDown, person, logOut, list, calendar, analytics, trendingUp, flag, folderOpen, ellipse, business, notificationsOutline, settingsOutline, cash, people, trophyOutline, callOutline, chatbubbleOutline, calendarOutline, cloudUploadOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './companies-list.page.html',
  styleUrls: ['./companies-list.page.scss']
})
export class CompaniesListPage implements OnInit {
  companies: Company[] = [];
  isLoading = true;
  searchQuery = '';
  currentPage = 1;
  hasMore = true;
  
  private avatarColors = [
    'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  ];

  constructor(
    private api: ApiService,
    private modalController: ModalController
  ) {
    addIcons({cloudUploadOutline,trashOutline})
  }

  ngOnInit(): void {
    //this.loadCompanies();
  }

  ionViewWillEnter(): void {
    this.loadCompanies();
  }

  loadCompanies(loadMore = false): void {
    if (loadMore) {
      this.currentPage++;
    } else {
      this.isLoading = true;
      this.currentPage = 1;
    }

    this.api.getCompanies({ 
      page: this.currentPage, 
      per_page: 20,
      search: this.searchQuery 
    }).subscribe({
      next: (response) => {
        if (loadMore) {
          this.companies = [...this.companies, ...response.data];
        } else {
          this.companies = response.data;
        }
        this.hasMore = response.current_page < response.last_page;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.companies = [];
      }
    });
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadCompanies();
  }

  loadMore(event: any): void {
    if (this.hasMore) {
      this.currentPage++;
      this.api.getCompanies({ 
        page: this.currentPage, 
        per_page: 20,
        search: this.searchQuery 
      }).subscribe({
        next: (response) => {
          this.companies = [...this.companies, ...response.data];
          this.hasMore = response.current_page < response.last_page;
          event.target.complete();
        },
        error: () => {
          event.target.complete();
        }
      });
    } else {
      event.target.complete();
    }
  }

  getInitials(company: Company): string {
    return company.name?.charAt(0).toUpperCase() || 'C';
  }

  getAvatarColor(company: Company): string {
    const index = company.id % this.avatarColors.length;
    return this.avatarColors[index];
  }

  async presentImportModal() {
    const modal = await this.modalController.create({
      component: DataImportComponent,
      componentProps: {
        entityType: 'company'
      },
      cssClass: 'import-modal'
    });
    
    await modal.present();
    
    const { data } = await modal.onWillDismiss();
    if (data?.success) {
      this.loadCompanies();
    }
  }

  deleteCompany(company: Company) {
    this.api.deleteCompany(company.id).subscribe({
      next: () => {
        this.loadCompanies();
      }
    });
  }
}
