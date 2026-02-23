import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonItemGroup,
  IonItemDivider,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonNote,
  IonList
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { businessOutline, createOutline, peopleOutline, shieldOutline } from 'ionicons/icons';

@Component({
  selector: 'app-organization-setup',
  templateUrl: './organization-setup.page.html',
  styleUrls: ['./organization-setup.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonItem,
    IonItemGroup,
    IonItemDivider,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonNote,
    IonList,
    CommonModule, 
    FormsModule
  ]
})
export class OrganizationSetupPage implements OnInit {
  organizationName = '';
  email = '';
  phone = '';
  address = '';
  city = '';
  state = '';
  country = '';
  zipCode = '';
  website = '';

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ businessOutline, createOutline, peopleOutline, shieldOutline });
  }

  ngOnInit(): void {
    // Check if user already has organization
    if (this.authService.hasOrganization) {
      this.router.navigate(['/dashboard']);
    }
  }

  createOrganization(): void {
    if (!this.organizationName) {
      this.errorMessage = 'Organization name is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const data = {
      name: this.organizationName,
      email: this.email || undefined,
      phone: this.phone || undefined,
      address: this.address || undefined,
      city: this.city || undefined,
      state: this.state || undefined,
      country: this.country || undefined,
      zip_code: this.zipCode || undefined,
      website: this.website || undefined
    };

    this.authService.createOrganization(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to create organization';
      }
    });
  }
}
