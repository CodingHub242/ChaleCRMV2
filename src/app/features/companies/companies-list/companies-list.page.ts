import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, SearchbarCustomEvent } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Company } from '../../../models';

@Component({
  selector: 'app-companies-list',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './companies-list.page.html',
  styleUrls: ['./companies-list.page.scss']
})
export class CompaniesListPage implements OnInit {
  companies: Company[] = [];
  searchQuery = '';
  
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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.api.getCompanies({ 
      per_page: 100,
      search: this.searchQuery 
    }).subscribe({
      next: (response) => {
        this.companies = response.data;
      },
      error: () => {
        this.companies = [];
      }
    });
  }

  onSearch(event: SearchbarCustomEvent): void {
    this.searchQuery = event.detail.value || '';
    this.loadCompanies();
  }

  getInitials(company: Company): string {
    return company.name?.charAt(0).toUpperCase() || 'C';
  }

  getAvatarColor(company: Company): string {
    const index = company.id % this.avatarColors.length;
    return this.avatarColors[index];
  }
}
